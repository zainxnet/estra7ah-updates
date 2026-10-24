param([int]$ParentProcessId)
$ErrorActionPreference='Stop'
[Console]::InputEncoding=New-Object Text.UTF8Encoding($false)
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
Add-Type -ReferencedAssemblies System.Web.Extensions -TypeDefinition @"
using System;
using System.IO;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Threading;
using System.Diagnostics;
public static class ZainWatcherHost {
 class Root { public string id; public string path; public FileSystemWatcher watcher; public bool connecting; public DateTime retry; }
 static object gate=new object(); static JavaScriptSerializer json=new JavaScriptSerializer();
 static void Send(object value) { lock(gate) { Console.WriteLine(json.Serialize(value)); Console.Out.Flush(); } }
 static void Connect(object state) {
  Root root=(Root)state;
  try {
   var w=new FileSystemWatcher(root.path); w.IncludeSubdirectories=true; w.NotifyFilter=NotifyFilters.FileName|NotifyFilters.DirectoryName|NotifyFilters.Size|NotifyFilters.LastWrite;w.InternalBufferSize=32768;
   FileSystemEventHandler changed=(s,e)=>Send(new {kind="change",id=root.id,path=e.FullPath});
   w.Created+=changed;w.Changed+=changed;w.Deleted+=changed;
   w.Renamed+=(s,e)=>{Send(new {kind="change",id=root.id,path=e.FullPath});Send(new {kind="change",id=root.id,path=e.OldFullPath});};
   w.Error+=(s,e)=>{lock(root){if(root.watcher==w){root.watcher=null;root.retry=DateTime.UtcNow.AddSeconds(60);}}Send(new {kind="error",id=root.id,error=e.GetException().GetType().Name});w.Dispose();};
   lock(root){root.watcher=w;}w.EnableRaisingEvents=true;Send(new {kind="ready",id=root.id});
  } catch(Exception e){lock(root){if(root.watcher!=null)root.watcher.Dispose();root.watcher=null;root.retry=DateTime.UtcNow.AddSeconds(60);}Send(new {kind="error",id=root.id,error=e.GetType().Name});}
  finally{lock(root){root.connecting=false;}}
 }
 public static void Run(string config,int parent) {
  var values=json.Deserialize<List<Dictionary<string,string>>>(config);var roots=new List<Root>();
  foreach(var value in values)roots.Add(new Root{id=value["id"],path=value["path"]});
  try {for(;;){try{if(Process.GetProcessById(parent).HasExited)break;}catch{break;}
   foreach(var root in roots)lock(root){if(root.watcher==null&&!root.connecting&&root.retry<=DateTime.UtcNow){root.connecting=true;ThreadPool.QueueUserWorkItem(Connect,root);}}
   Send(new {kind="heartbeat"});Thread.Sleep(5000);
  }}finally{foreach(var root in roots)lock(root){if(root.watcher!=null)root.watcher.Dispose();}}
 }
}
"@
$config=[Console]::ReadLine()
[ZainWatcherHost]::Run($config,$ParentProcessId)
