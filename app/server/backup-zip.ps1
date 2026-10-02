param([string]$Mode,[string]$File,[string]$Stage)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
if($Mode -eq 'create'){
 $manifest=Get-Content -LiteralPath (Join-Path $Stage 'backup-manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
 $stream=[IO.File]::Open($File,[IO.FileMode]::CreateNew)
 $zip=New-Object IO.Compression.ZipArchive($stream,[IO.Compression.ZipArchiveMode]::Create,$false)
 try{foreach($name in @('backup-manifest.json')+@($manifest.files | ForEach-Object {$_.path})){
  $level=if($name -match '\.(jpg|jpeg|png|webp|mp4|webm)$'){[IO.Compression.CompressionLevel]::NoCompression}else{[IO.Compression.CompressionLevel]::Optimal}
  [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,(Join-Path $Stage $name),$name,$level)|Out-Null
 }}finally{$zip.Dispose();$stream.Dispose()}
 exit 0
}
$zip=[IO.Compression.ZipFile]::OpenRead($File)
try{
 $entries=@($zip.Entries);if($entries.Count -gt 20001){throw 'Too many ZIP entries'}
 $entry=$zip.GetEntry('backup-manifest.json')
 if(!$entry){if($Mode -eq 'inspect'){[Console]::Write('null');exit 0};throw 'Manifest missing'}
 if($entry.Length -gt 8MB){throw 'Manifest too large'}
 $reader=New-Object IO.StreamReader($entry.Open());try{$manifest=$reader.ReadToEnd()|ConvertFrom-Json}finally{$reader.Dispose()}
 if($Mode -eq 'inspect'){@{manifest=$manifest;entries=@($entries|ForEach-Object {@{name=$_.FullName;size=$_.Length}})}|ConvertTo-Json -Depth 10 -Compress;exit 0}
 $root=[IO.Path]::GetFullPath($Stage)+[IO.Path]::DirectorySeparatorChar
 foreach($row in $manifest.files){
  $name=[string]$row.path;$dest=[IO.Path]::GetFullPath((Join-Path $Stage $name))
  if(!$dest.StartsWith($root,[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe ZIP path'}
  $e=$zip.GetEntry($name);if(!$e -or $e.Length -ne $row.size){throw 'ZIP entry mismatch'}
  [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($dest))|Out-Null
  $inputStream=$e.Open();$outputStream=[IO.File]::Open($dest,[IO.FileMode]::CreateNew)
  try{$inputStream.CopyTo($outputStream)}finally{$inputStream.Dispose();$outputStream.Dispose()}
 }
}finally{$zip.Dispose()}
