param([Parameter(Mandatory=$true)][string]$File,[Parameter(Mandatory=$true)][string]$Stage)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = [Console]::OutputEncoding
Add-Type -AssemblyName System.IO.Compression.FileSystem
$stageRoot=[IO.Path]::GetFullPath($Stage).TrimEnd('\')+'\'
$zip=[IO.Compression.ZipFile]::OpenRead($File)
$names=[Collections.Generic.List[string]]::new()
$total=0L
try {
 foreach($entry in $zip.Entries){
  $name=$entry.FullName
  $target=$null
  if($name -ceq 'db/estra7ah.json' -or $name -ceq 'db/estra7ah.items.json'){$target='assets/'+$name}
  elseif($name -cmatch '^(ExtsImage|SecsImage|AdImage|ExtsVideo)/[^/\\:\x00-\x1f]{1,240}\.(jpg|jpeg|png|webp|gif|ico|bmp|mp4|webm)$'){$target='assets/'+$name}
  if(!$target){continue}
  if($names.Contains($target)){throw 'Duplicate backup file'}
  $total+=$entry.Length
  if($total -gt 2147483648 -or $names.Count -ge 20000){throw 'Backup exceeds limits'}
  $destination=[IO.Path]::GetFullPath((Join-Path $Stage $target))
  if(!$destination.StartsWith($stageRoot,[StringComparison]::OrdinalIgnoreCase)){throw 'Invalid backup path'}
  [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination)) | Out-Null
  [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$destination,$false)
  $names.Add($target)
 }
 if(!$names.Contains('assets/db/estra7ah.json') -or !$names.Contains('assets/db/estra7ah.items.json')){throw 'Incomplete legacy database backup'}
 ConvertTo-Json -InputObject @($names.ToArray()) -Compress
} finally {$zip.Dispose()}
