param(
    [Parameter(Mandatory=$true)][string]$Poster,
    [Parameter(Mandatory=$true)][string]$Output,
    [Parameter(Mandatory=$true)][string]$Title,
    [string]$Season = '',
    [string]$Logo = '',
    [string]$Preview = ''
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
# Deterministic local compositor; GDI handles Arabic shaping and RTL layout.
$source = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Text.RegularExpressions;
public static class ZainFolderIconRenderer {
    static GraphicsPath Rounded(float x,float y,float w,float h,float radius) {
        var p=new GraphicsPath();float d=radius*2;
        p.AddArc(x,y,d,d,180,90);p.AddArc(x+w-d,y,d,d,270,90);
        p.AddArc(x+w-d,y+h-d,d,d,0,90);p.AddArc(x,y+h-d,d,d,90,90);
        p.CloseFigure();return p;
    }
    static void Quality(Graphics g) {
        g.SmoothingMode=SmoothingMode.AntiAlias;g.InterpolationMode=InterpolationMode.HighQualityBicubic;
        g.PixelOffsetMode=PixelOffsetMode.HighQuality;
        g.TextRenderingHint=System.Drawing.Text.TextRenderingHint.AntiAliasGridFit;
    }
    static void Contain(Graphics g,Image image,RectangleF box) {
        float scale=Math.Min(box.Width/image.Width,box.Height/image.Height);
        float w=image.Width*scale,h=image.Height*scale;
        var dest=new RectangleF(box.X+(box.Width-w)/2,box.Y+(box.Height-h)/2,w,h);
        using(var attributes=new ImageAttributes()) {
            attributes.SetWrapMode(WrapMode.TileFlipXY);
            g.DrawImage(image,Rectangle.Round(dest),0,0,image.Width,image.Height,GraphicsUnit.Pixel,attributes);
        }
    }
    static Color Tone(Image source) {
        using(var sample=new Bitmap(16,16)) {
            using(var g=Graphics.FromImage(sample))g.DrawImage(source,0,0,16,16);
            int r=0,b=0,gr=0;
            for(int y=0;y<16;y++)for(int x=0;x<16;x++){var c=sample.GetPixel(x,y);r+=c.R;gr+=c.G;b+=c.B;}
            return Color.FromArgb(r/256,gr/256,b/256);
        }
    }
    static bool LogoIsLight(Image image) {
        using(var sample=new Bitmap(64,32,PixelFormat.Format32bppArgb)) {
            using(var g=Graphics.FromImage(sample)){g.Clear(Color.Transparent);g.DrawImage(image,0,0,64,32);}
            double weight=0,total=0;
            for(int y=0;y<32;y++)for(int x=0;x<64;x++){var c=sample.GetPixel(x,y);if(c.A<48)continue;weight+=c.A;total+=c.A*(0.2126*c.R+0.7152*c.G+0.0722*c.B);}
            return weight>0&&total/weight>=140;
        }
    }
    static string Text(string value) {
        if(String.IsNullOrWhiteSpace(value))return "";
        return Regex.Replace(value,@"[\x00-\x1f\x7f]"," ").Trim();
    }
    static void FitText(Graphics g,string value,RectangleF rect,Color color,float max,float min) {
        value=Text(value);if(value.Length==0)return;
        // Measure and draw in an untransformed surface. Measuring directly after
        // the side-tab rotation can report clipped lines as fitting the box.
        const float scale=4;
        int width=Math.Max(1,(int)Math.Ceiling(rect.Width*scale));
        int height=Math.Max(1,(int)Math.Ceiling(rect.Height*scale));
        using(var text=new Bitmap(width,height,PixelFormat.Format32bppArgb))
        using(var tg=Graphics.FromImage(text))
        using(var sf=new StringFormat()) {
            Quality(tg);tg.Clear(Color.Transparent);
            sf.Alignment=StringAlignment.Center;sf.LineAlignment=StringAlignment.Center;sf.Trimming=StringTrimming.None;
            if(Regex.IsMatch(value,@"[\u0600-\u06ff]"))sf.FormatFlags|=StringFormatFlags.DirectionRightToLeft;
            var box=new RectangleF(2,2,Math.Max(1,width-4),Math.Max(1,height-4));
            Font selected=null;
            try {
                for(float size=max*scale;size>=1;size-=1) {
                    var candidate=new Font("Tahoma",size,FontStyle.Bold,GraphicsUnit.Pixel);
                    var measured=tg.MeasureString(value,candidate,new SizeF(box.Width,100000),sf);
                    if(measured.Height<=box.Height&&measured.Width<=box.Width+0.5f){selected=candidate;break;}
                    candidate.Dispose();
                }
                if(selected==null)selected=new Font("Tahoma",1,FontStyle.Bold,GraphicsUnit.Pixel);
                using(var shadow=new SolidBrush(Color.FromArgb(65,color.GetBrightness()>0.5f?Color.Black:Color.White))) {
                    var behind=box;behind.Offset(1,1);tg.DrawString(value,selected,shadow,behind,sf);
                }
                using(var ink=new SolidBrush(color))tg.DrawString(value,selected,ink,box,sf);
                g.DrawImage(text,rect);
            }finally{if(selected!=null)selected.Dispose();}
        }
    }
    static Image OpenImage(string filename) {
        var info=new FileInfo(filename);
        if(!info.Exists||info.Length<8||info.Length>24L*1024*1024)throw new InvalidDataException("Image file is missing or too large");
        Image image=Image.FromFile(filename);
        if(image.Width<=0||image.Height<=0||(long)image.Width*image.Height>40000000L){image.Dispose();throw new InvalidDataException("Image dimensions exceed the rendering limit");}
        return image;
    }
    static string Destination(string value,string extension) {
        string full=Path.GetFullPath(value);
        if(!String.Equals(Path.GetExtension(full),extension,StringComparison.OrdinalIgnoreCase))throw new ArgumentException("Unexpected output extension");
        if(File.Exists(full)||Directory.Exists(full))throw new IOException("Output already exists");
        if(!Directory.Exists(Path.GetDirectoryName(full)))throw new DirectoryNotFoundException("Output directory does not exist");
        return full;
    }
    static void WriteNew(string filename,byte[] bytes) {
        using(var stream=new FileStream(filename,FileMode.CreateNew,FileAccess.Write,FileShare.None)){stream.Write(bytes,0,bytes.Length);stream.Flush(true);}
    }
    public static void Render(string poster,string output,string title,string season,string logo,string preview) {
        if(Text(title).Length==0||title.Length>1000||season.Length>1000)throw new ArgumentException("A valid title and season are required");
        string ico=Destination(output,".ico");
        string png=String.IsNullOrWhiteSpace(preview)?null:Destination(preview,".png");
        using(Image image=OpenImage(poster))
        using(Image wordmark=String.IsNullOrWhiteSpace(logo)?null:OpenImage(logo))
        using(var canvas=new Bitmap(1024,1024,PixelFormat.Format32bppArgb)) {
            using(var g=Graphics.FromImage(canvas)) {
                Quality(g);g.Clear(Color.Transparent);g.ScaleTransform(4,4);
                // Fill the icon canvas, keeping one pixel for antialiased outer edges.
                g.TranslateTransform(1,1);g.ScaleTransform(254f/221f,254f/240f);g.TranslateTransform(-24.5f,-2.5f);
                Color average=Tone(image);
                bool light=0.2126*average.R+0.7152*average.G+0.0722*average.B>125;
                // Keep the original wordmark readable without recoloring it.
                if(wordmark!=null)light=!LogoIsLight(wordmark);
                Color tab=light?Color.FromArgb(235,235,232):Color.FromArgb(15,18,20);
                Color ink=light?Color.FromArgb(20,23,25):Color.FromArgb(242,242,238);
                using(var tabPath=new GraphicsPath()) {
                    tabPath.StartFigure();tabPath.AddLine(207,13,213,13);
                    tabPath.AddBezier(213,13,221,14,220,22,220,33);
                    tabPath.AddBezier(220,33,220,43,225,46,235,49);
                    tabPath.AddBezier(235,49,244,52,245,57,245,67);
                    tabPath.AddLine(245,67,245,122);
                    tabPath.AddBezier(245,122,245,132,242,136,233,140);
                    tabPath.AddBezier(233,140,224,144,220,147,220,158);
                    tabPath.AddLine(220,158,220,225);
                    tabPath.AddBezier(220,225,220,233,216,237,208,237);tabPath.CloseFigure();
                    using(var fill=new SolidBrush(tab))g.FillPath(fill,tabPath);
                    using(var pen=new Pen(light?Color.FromArgb(130,130,126):Color.FromArgb(72,76,76),1))g.DrawPath(pen,tabPath);
                }
                using(var frame=Rounded(25,3,187,239,7)) {
                    using(var fill=new SolidBrush(Color.FromArgb(average.R/3,average.G/3,average.B/3)))g.FillPath(fill,frame);
                    var saved=g.Save();g.SetClip(frame);
                    g.DrawImage(image,new RectangleF(26,4,185,237));
                    if(Text(season).Length>0) {
                        using(var band=new SolidBrush(Color.FromArgb(210,7,12,18)))g.FillRectangle(band,26,218,185,23);
                        FitText(g,season,new RectangleF(29,219,179,21),Color.White,13,6);
                    }
                    g.Restore(saved);
                    using(var pen=new Pen(light?Color.FromArgb(120,120,118):Color.FromArgb(47,52,55),1))g.DrawPath(pen,frame);
                }
                var state=g.Save();g.TranslateTransform(232,95);g.RotateTransform(90);
                if(wordmark!=null)Contain(g,wordmark,new RectangleF(-43,-11,86,22));
                else FitText(g,Regex.Replace(title,@"(?:\s*[\(\[](?:19|20)\d{2}[\)\]]|\s+(?:19|20)\d{2}\b).*$", "").Trim(),new RectangleF(-44,-12,88,24),ink,14,4);
                g.Restore(state);
            }
            int[] sizes={16,32,48,64,128,256};var frames=new byte[sizes.Length][];
            for(int i=0;i<sizes.Length;i++)using(var bitmap=new Bitmap(sizes[i],sizes[i],PixelFormat.Format32bppArgb)) {
                using(var g=Graphics.FromImage(bitmap)){Quality(g);g.Clear(Color.Transparent);g.DrawImage(canvas,0,0,sizes[i],sizes[i]);}
                using(var bytes=new MemoryStream()){bitmap.Save(bytes,ImageFormat.Png);frames[i]=bytes.ToArray();}
            }
            using(var bytes=new MemoryStream())using(var writer=new BinaryWriter(bytes)) {
                writer.Write((ushort)0);writer.Write((ushort)1);writer.Write((ushort)sizes.Length);
                uint offset=(uint)(6+16*sizes.Length);
                for(int i=0;i<sizes.Length;i++) {
                    writer.Write((byte)(sizes[i]==256?0:sizes[i]));writer.Write((byte)(sizes[i]==256?0:sizes[i]));
                    writer.Write((byte)0);writer.Write((byte)0);writer.Write((ushort)1);writer.Write((ushort)32);
                    writer.Write((uint)frames[i].Length);writer.Write(offset);offset+=(uint)frames[i].Length;
                }
                foreach(var frame in frames)writer.Write(frame);
                writer.Flush();WriteNew(ico,bytes.ToArray());
            }
            if(png!=null)WriteNew(png,frames[frames.Length-1]);
        }
    }
}
'@
Add-Type -TypeDefinition $source -ReferencedAssemblies System.Drawing
$wordmarkTemp=[IO.Path]::GetFullPath($Output)+'.wordmark.png'
try {
    . (Join-Path $PSScriptRoot 'poster-wordmark.ps1')
    $fromPoster=Get-PosterWordmark -Poster $Poster -Title $Title -Output $wordmarkTemp
    $selectedLogo=if($fromPoster){$fromPoster}else{$Logo}
    [ZainFolderIconRenderer]::Render($Poster,$Output,$Title,$Season,$selectedLogo,$Preview)
} finally { if([IO.File]::Exists($wordmarkTemp)){[IO.File]::Delete($wordmarkTemp)} }
Write-Output 'Icon rendered successfully'
