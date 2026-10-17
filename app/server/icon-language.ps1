param([string]$IconPath)
$ErrorActionPreference='Stop'
$scratch=[IO.Path]::Combine([IO.Path]::GetTempPath(),[Guid]::NewGuid().ToString()+'.png')
try {
 Add-Type -AssemblyName System.Drawing
 Add-Type -AssemblyName System.Runtime.WindowsRuntime
 [void][Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
 [void][Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime]
 [void][Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
 [void][Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]
 $asTask=([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {$_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq ('IAsyncOperation'+[char]96+'1')})[0]
 function Await-Ocr($op,[Type]$type){$task=$asTask.MakeGenericMethod($type).Invoke($null,@($op));if(!$task.Wait(5000)){throw 'timeout'};return $task.Result}
 $bytes=[IO.File]::ReadAllBytes($IconPath);$count=[BitConverter]::ToUInt16($bytes,4);$best=-1;$area=0
 for($n=0;$n -lt $count;$n++){$at=6+16*$n;$w=[int]$bytes[$at];$h=[int]$bytes[$at+1];if(!$w){$w=256};if(!$h){$h=256};if($w*$h -gt $area){$area=$w*$h;$best=$at}}
 if($best -lt 0){throw 'invalid'}
 $length=[BitConverter]::ToUInt32($bytes,$best+8);$offset=[BitConverter]::ToUInt32($bytes,$best+12)
 $stream=New-Object IO.MemoryStream(,$bytes[$offset..($offset+$length-1)])
 try{$bitmap=New-Object Drawing.Bitmap($stream)}catch{ $ico=New-Object Drawing.Icon($IconPath,256,256);$bitmap=$ico.ToBitmap();$ico.Dispose() }
 $rect=New-Object Drawing.Rectangle([int]($bitmap.Width*0.84),[int]($bitmap.Height*0.15),[int]($bitmap.Width*0.12),[int]($bitmap.Height*0.7))
 $crop=$bitmap.Clone($rect,[Drawing.Imaging.PixelFormat]::Format32bppArgb);$bitmap.Dispose();$stream.Dispose();$crop.RotateFlip([Drawing.RotateFlipType]::Rotate270FlipNone)
 $large=New-Object Drawing.Bitmap(($crop.Width*4),($crop.Height*4));$g=[Drawing.Graphics]::FromImage($large);$g.Clear([Drawing.Color]::White);$g.DrawImage($crop,0,0,$large.Width,$large.Height);$g.Dispose();$crop.Dispose();$large.Save($scratch,[Drawing.Imaging.ImageFormat]::Png);$large.Dispose()
 $file=Await-Ocr ([Windows.Storage.StorageFile]::GetFileFromPathAsync($scratch)) ([Windows.Storage.StorageFile]);$inputStream=Await-Ocr ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
 try{$decoder=Await-Ocr ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($inputStream)) ([Windows.Graphics.Imaging.BitmapDecoder]);$software=Await-Ocr ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
 try{$arabic=$false;$latin=$false;$hasArabicEngine=$false
 foreach($lang in @('ar-SA','en-US')){$engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language $lang));if(!$engine){continue};if($lang -eq 'ar-SA'){$hasArabicEngine=$true};$read=Await-Ocr ($engine.RecognizeAsync($software)) ([Windows.Media.Ocr.OcrResult]);if($read.Text -match '[\u0600-\u06ff]{2,}'){$arabic=$true};if($read.Text -match '[A-Za-z]{3,}'){$latin=$true}}
 if($arabic){'arabic'}elseif($latin -and $hasArabicEngine){'latin'}else{'unknown'}
 }finally{$software.Dispose()}}finally{$inputStream.Dispose()}
}catch{'unknown'}finally{if([IO.File]::Exists($scratch)){[IO.File]::Delete($scratch)}}
