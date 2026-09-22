param([Parameter(Mandatory=$true)][string]$Folder,[switch]$Open)
$ErrorActionPreference='Stop'
$openFolder=$Folder.Replace('/','\')
$Folder=$Folder.Replace('/','\').TrimEnd('\')
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class ZainFolderWindow {
 [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd,int nCmdShow);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
 [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd,out uint processId);
 [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
 [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint from,uint to,bool attach);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] public static extern IntPtr GetTopWindow(IntPtr hWnd);
 [DllImport("user32.dll")] public static extern IntPtr GetWindow(IntPtr hWnd,uint command);
 [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd,IntPtr after,int x,int y,int cx,int cy,uint flags);
 [DllImport("user32.dll",EntryPoint="GetWindowLongW")] public static extern int GetWindowLong(IntPtr hWnd,int index);
 public static void Raise(IntPtr target) {
   // Do not join Chromium's input queue: a busy renderer can block the helper.
   // ASYNCWINDOWPOS keeps cross-thread window positioning asynchronous.
   if(IsIconic(target)) ShowWindowAsync(target,9);
   else ShowWindowAsync(target,5);
   bool topmost=(GetWindowLong(target,-20)&8)!=0;
   SetWindowPos(target,new IntPtr(-1),0,0,0,0,0x4043);
   System.Threading.Thread.Sleep(150);
   if(!topmost) SetWindowPos(target,new IntPtr(-2),0,0,0,0,0x4043);
   SetForegroundWindow(target);
 }
 public static bool IsInFrontOf(IntPtr target,IntPtr previous) {
   if(target==previous) return true;
   IntPtr current=GetTopWindow(IntPtr.Zero);
   for(int n=0;n<4096 && current!=IntPtr.Zero;n++,current=GetWindow(current,2)) {
     if(current==target) return true;
     if(current==previous) return false;
   }
   return false;
 }
}
'@
$shell=New-Object -ComObject Shell.Application
$previous=[ZainFolderWindow]::GetForegroundWindow()
if($Open){Start-Process -FilePath (Join-Path $env:SystemRoot 'explorer.exe') -ArgumentList ('"'+$openFolder+'"')}
$deadline=[DateTime]::UtcNow.AddSeconds(12)
$found=$false
while([DateTime]::UtcNow -lt $deadline) {
 foreach($window in @($shell.Windows())) {
  try {
   $windowPath=([string]$window.Document.Folder.Self.Path).Replace('/','\').TrimEnd('\')
   $urlPath='';try{$urlPath=([uri]$window.LocationURL).LocalPath.Replace('/','\').TrimEnd('\')}catch{}
   if([String]::Equals($windowPath,$Folder,[StringComparison]::OrdinalIgnoreCase) -or [String]::Equals($urlPath,$Folder,[StringComparison]::OrdinalIgnoreCase)) {
    $found=$true
    $target=[IntPtr]$window.HWND
    if([ZainFolderWindow]::IsIconic($target)){
     [void][ZainFolderWindow]::ShowWindowAsync($target,9)
     Start-Sleep -Milliseconds 120
    }
    [ZainFolderWindow]::Raise($target)
    Start-Sleep -Milliseconds 250
    $focused=[ZainFolderWindow]::GetForegroundWindow() -eq $target
    $inFront=[ZainFolderWindow]::IsWindowVisible($target) -and (-not [ZainFolderWindow]::IsIconic($target)) -and [ZainFolderWindow]::IsInFrontOf($target,$previous)
    if($inFront){@{openedInFront=$true;focused=$focused;reason='shown'} | ConvertTo-Json -Compress;exit 0}
   }
  } catch {}
 }
 Start-Sleep -Milliseconds 150
}
@{openedInFront=$false;focused=$false;reason=$(if($found){'foreground-not-granted'}else{'folder-window-not-found'});sessionId=[Diagnostics.Process]::GetCurrentProcess().SessionId} | ConvertTo-Json -Compress
exit 1
