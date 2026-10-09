# Local Windows OCR is optional. Fail closed to folder title if unavailable or uncertain.
function Get-PosterWordmark([string]$Poster,[string]$Title,[string]$Output) {
 if([IO.File]::Exists($Output)){return $null}
 $scratch=New-Object 'System.Collections.Generic.List[string]'
 try {
 Add-Type -AssemblyName System.Runtime.WindowsRuntime
 [void][Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
 [void][Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime]
 [void][Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
 [void][Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]
 $asTask=([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {$_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq ('IAsyncOperation' + [char]96 + '1')})[0]
 function Wait-Ocr($operation,[Type]$type){$task=$asTask.MakeGenericMethod($type).Invoke($null,@($operation));if(-not $task.Wait(8000)){throw 'OCR_TIMEOUT'};return $task.Result}
 Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Imaging;using System.Runtime.InteropServices;using System.Collections.Generic;
public static class PosterWordmarkPixels {
 public static bool Red(Color c){return c.R>60&&c.R>c.G*2.2&&c.R>c.B*2.2;}
 public static void Prepare(string source,string output,int mode){
 using(var image=Image.FromFile(source))using(var b=new Bitmap(Math.Min(mode==3?300:900,image.Width),(int)Math.Round(image.Height*(double)Math.Min(mode==3?300:900,image.Width)/image.Width),PixelFormat.Format32bppArgb)){
 using(var g=Graphics.FromImage(b))g.DrawImage(image,0,0,b.Width,b.Height);
 var d=b.LockBits(new Rectangle(0,0,b.Width,b.Height),ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);var a=new byte[d.Stride*b.Height];Marshal.Copy(d.Scan0,a,0,a.Length);
 for(int i=0;i<a.Length;i+=4){byte v=mode>=2?(byte)(a[i+2]>60&&a[i+2]>a[i+1]*2.2&&a[i+2]>a[i]*2.2?0:255):mode==1?Math.Max(a[i],Math.Max(a[i+1],a[i+2])):Math.Min(a[i],Math.Min(a[i+1],a[i+2]));if(mode==3 && (i/d.Stride<b.Height*0.70||i/d.Stride>b.Height*0.91))v=255;a[i]=v;a[i+1]=v;a[i+2]=v;}
 Marshal.Copy(a,0,d.Scan0,a.Length);b.UnlockBits(d);b.Save(output,ImageFormat.Png);}}
 public static double Similarity(string a,string b){if(a.Length==0||b.Length==0)return 0;int[] prev=new int[b.Length+1];for(int j=0;j<=b.Length;j++)prev[j]=j;for(int i=1;i<=a.Length;i++){int[] row=new int[b.Length+1];row[0]=i;for(int j=1;j<=b.Length;j++)row[j]=Math.Min(Math.Min(prev[j]+1,row[j-1]+1),prev[j-1]+(a[i-1]==b[j-1]?0:1));prev=row;}return 1-(double)prev[b.Length]/Math.Max(a.Length,b.Length);}
 public static bool Extract(string input,string output,double[] regions){
 using(var image=new Bitmap(input))using(var canvas=new Bitmap(image.Width,image.Height,PixelFormat.Format32bppArgb)){
 int left=image.Width,top=image.Height,right=0,bottom=0,kept=0;
 for(int i=0;i<regions.Length;i+=5){
 int x=(int)regions[i],y=(int)regions[i+1],w=(int)regions[i+2],h=(int)regions[i+3],mode=(int)regions[i+4];
 // Expand red OCR boxes, then retain only substantial connected glyph components.
 int pad=mode==2?(int)(h*.6):Math.Max(2,h/12);
 int x0=Math.Max(0,x-pad),x1=Math.Min(image.Width,x+w+pad),y0=Math.Max(0,y-(mode==2?pad:2)),y1=Math.Min(image.Height,y+h+(mode==2?pad:2));
 int rw=x1-x0,rh=y1-y0;if(rw<=0||rh<=0)continue;
 bool[] mask=new bool[rw*rh],visited=new bool[rw*rh];
 int whites=0,blacks=0;
 for(int yy=Math.Max(0,y);yy<Math.Min(image.Height,y+h);yy++)for(int xx=Math.Max(0,x);xx<Math.Min(image.Width,x+w);xx++){Color c=image.GetPixel(xx,yy);if(Math.Min(c.R,Math.Min(c.G,c.B))>160)whites++;if(Math.Max(c.R,Math.Max(c.G,c.B))<65)blacks++;}
 // On a dark poster take light glyphs; on a light poster take dark glyphs.
 double border=0;int samples=0;
 for(int xx=Math.Max(0,x);xx<Math.Min(image.Width,x+w);xx+=Math.Max(1,w/80)){foreach(int yy in new int[]{Math.Max(0,y-3),Math.Min(image.Height-1,y+h+2)}){Color c=image.GetPixel(xx,yy);border+=(c.R+c.G+c.B)/3.0;samples++;}}
 bool lightInk=samples>0?border/samples<125:blacks>whites;
 for(int yy=0;yy<rh;yy++)for(int xx=0;xx<rw;xx++){Color c=image.GetPixel(x0+xx,y0+yy);mask[yy*rw+xx]=mode==2?Red(c):lightInk?(Math.Min(c.R,Math.Min(c.G,c.B))>135||Red(c)):Math.Max(c.R,Math.Max(c.G,c.B))<85;}
 for(int start=0;start<mask.Length;start++){if(!mask[start]||visited[start])continue;var points=new List<int>();var queue=new Queue<int>();queue.Enqueue(start);visited[start]=true;int minY=rh,maxY=0,minX=rw,maxX=0;
 while(queue.Count>0){int pos=queue.Dequeue(),xx=pos%rw,yy=pos/rw;points.Add(pos);minY=Math.Min(minY,yy);maxY=Math.Max(maxY,yy);minX=Math.Min(minX,xx);maxX=Math.Max(maxX,xx);for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=xx+dx,ny=yy+dy;if(nx<0||ny<0||nx>=rw||ny>=rh)continue;int next=ny*rw+nx;if(mask[next]&&!visited[next]){visited[next]=true;queue.Enqueue(next);}}}
 if(points.Count<Math.Max(3,h*h*.003)||(maxY-minY+1)<h*(mode==2?.45:.18))continue;
 if(mode==2&&(maxY-minY+1)>h*1.5)continue;
 foreach(int pos in points){int xx=x0+pos%rw,yy=y0+pos/rw;canvas.SetPixel(xx,yy,image.GetPixel(xx,yy));left=Math.Min(left,xx);right=Math.Max(right,xx);top=Math.Min(top,yy);bottom=Math.Max(bottom,yy);kept++;}
 }
 }
 if(kept<30||right<=left||bottom<=top)return false;
 using(var result=canvas.Clone(new Rectangle(left,top,right-left+1,bottom-top+1),PixelFormat.Format32bppArgb))result.Save(output,ImageFormat.Png);
 return true;
 }}
}
'@
 function Normalize-Title([string]$s){return [regex]::Replace($s.ToLowerInvariant().Normalize(), '[^\p{L}\p{N}]','')}
 $clean=[regex]::Replace($Title,'(?:\s*[\(\[](?:19|20)\d{2}[\)\]]|\s+(?:19|20)\d{2}\b).*$',' ')
 $clean=[regex]::Replace($clean,'[\u200e\u200f\u202a-\u202e]','');$clean=[regex]::Replace($clean,'\s+-\s*\d{1,3}\s*$','')
 $tokens=@([regex]::Matches($clean.ToLowerInvariant(),'[\p{L}\p{N}]+') | ForEach-Object {$_.Value})
 if(-not $tokens.Count){return $null}
 $phrases=New-Object 'System.Collections.Generic.List[string]'
 for($i=0;$i -lt $tokens.Count;$i++){for($j=$i;$j -lt $tokens.Count;$j++){$phrases.Add(($tokens[$i..$j] -join ''))}}
 $language=if($Title -match '[\u0600-\u06ff]'){'ar-SA'}else{'en-US'}
 $engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language $language))
 if(-not $engine){$engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'en-US'))}
 if(-not $engine){return $null}
 if(([IO.FileInfo]$Poster).Length -gt 24MB){return $null}
 $original=[Drawing.Image]::FromFile($Poster);if([long]$original.Width*$original.Height -gt 40000000 -or $original.Height/[double]$original.Width -gt 3){$original.Dispose();return $null};$scale=$original.Width/[double][Math]::Min(900,$original.Width);$originalWidth=$original.Width;$height=$original.Height;$original.Dispose()
 $found=New-Object 'System.Collections.Generic.List[object]'
 $prominent=New-Object 'System.Collections.Generic.List[object]'
 foreach($mode in @(0,1,2,3)){
 $scale=if($mode -eq 3){$originalWidth/[double][Math]::Min(300,$originalWidth)}else{$originalWidth/[double][Math]::Min(900,$originalWidth)}
 $temp=$Output+'.ocr'+$mode+'.png';$scratch.Add($temp);[PosterWordmarkPixels]::Prepare($Poster,$temp,$mode)
 $file=Wait-Ocr ([Windows.Storage.StorageFile]::GetFileFromPathAsync($temp)) ([Windows.Storage.StorageFile])
 $stream=Wait-Ocr ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
 try{$decoder=Wait-Ocr ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder]);$bitmap=Wait-Ocr ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
 try{$ocr=Wait-Ocr ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
 foreach($line in $ocr.Lines){
 $normal=Normalize-Title $line.Text;$score=0.0
 foreach($phrase in $phrases){$score=[Math]::Max($score,[PosterWordmarkPixels]::Similarity($normal,$phrase))}
 if($normal.Length -lt 3){continue}
 $x=1e9;$y=1e9;$right=0;$bottom=0
 foreach($word in $line.Words){$r=$word.BoundingRect;$x=[Math]::Min($x,$r.X);$y=[Math]::Min($y,$r.Y);$right=[Math]::Max($right,$r.X+$r.Width);$bottom=[Math]::Max($bottom,$r.Y+$r.Height)}
 if(($bottom-$y)*$scale -lt $height*.012){continue}
 $record=@{x=$x*$scale;y=$y*$scale;w=($right-$x)*$scale;h=($bottom-$y)*$scale;mode=$(if($mode -eq 3){2}else{$mode});score=$score;text=$normal}
 if($record.h -ge $height*.035){$prominent.Add($record)}
 if($score -lt .72){continue}
 $same=@($found | Where-Object {[Math]::Abs($_.y-$record.y) -lt [Math]::Max($_.h,$record.h)*.6 -and [PosterWordmarkPixels]::Similarity($_.text,$record.text) -gt .7})
 if($same.Count){if($score -gt $same[0].score){[void]$found.Remove($same[0]);$found.Add($record)}}else{$found.Add($record)}
 }
 }finally{$bitmap.Dispose()}
 }finally{$stream.Dispose()}
 }
 # Only an unmistakably large title block can be used without a folder-name match.
 $independent=$false
 if(-not $found.Count){
  if(-not $prominent.Count){return $null}
  $large=$prominent | Sort-Object h -Descending | Select-Object -First 1
  if($large.h -lt $height*.06 -or $large.w -lt $height*.2){return $null}
  foreach($r in $prominent){if($r.y -ge $large.y-$large.h*.15 -and $r.y -lt $large.y+$large.h*2.0){
   $same=@($found | Where-Object {[Math]::Abs($_.y-$r.y) -lt [Math]::Max($_.h,$r.h)*.6})
   if(-not $same.Count){$found.Add($r)}
  }}
  $independent=$true
 }
 $anchor=$found | Sort-Object h -Descending | Select-Object -First 1
 $chosen=@($found | Where-Object {[Math]::Abs($_.y-$anchor.y) -lt [Math]::Max($height*.18,$anchor.h*2.5)})
 $coverage=($chosen | ForEach-Object {$_.text.Length} | Measure-Object -Sum).Sum
 if(-not $independent -and $coverage -lt (Normalize-Title $clean).Length*.65){return $null}
 # Short single-word titles must match exactly; fuzzy OCR boxes can truncate letters.
 if($tokens.Count -eq 1 -and (Normalize-Title $clean).Length -le 8 -and -not @($chosen | Where-Object {$_.text -eq (Normalize-Title $clean)}).Count){return $null}
 $rects=New-Object 'System.Collections.Generic.List[double]'
 foreach($r in $chosen){foreach($key in @('x','y','w','h','mode')){$rects.Add([double]$r[$key])}}
 if([PosterWordmarkPixels]::Extract($Poster,$Output,$rects.ToArray())){return $Output}
 return $null
 }catch{return $null}finally{foreach($temp in $scratch){if([IO.File]::Exists($temp)){[IO.File]::Delete($temp)}}}
}