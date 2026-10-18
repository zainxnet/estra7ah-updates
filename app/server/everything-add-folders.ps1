param([switch]$LibraryOnly)
Set-StrictMode -Version 2
$ErrorActionPreference = 'Stop'
function Normalize-Folder([string]$Value) {
    $v=$Value.Trim().Trim('"').Replace('/','\').TrimEnd('\')
    if ($v -notmatch '^\\\\[^\\]+\\[^\\]+(?:\\.*)?$' -or $v -match '[,;"\r\n\x00-\x1f]' -or $v -match '(^|\\)\.{1,2}(\\|$)') { throw "مسار شبكي غير صالح أو يحتوي فاصلة غير مدعومة: $Value" }
    return $v
}
function Covered-By([string]$Child,[string]$Parent) {
    $p=$Parent.Trim().Trim('"').Replace('/','\').TrimEnd('\')
    return $Child.Equals($p,[StringComparison]::OrdinalIgnoreCase) -or $Child.StartsWith($p+'\',[StringComparison]::OrdinalIgnoreCase)
}
function Plan-Folders([string[]]$Requested,[string[]]$Existing) {
    $add=New-Object 'System.Collections.Generic.List[string]'
    $skip=New-Object 'System.Collections.Generic.List[string]'
    $sorted=@($Requested | Where-Object { $_.Trim() } | ForEach-Object { Normalize-Folder $_ } | Sort-Object Length)
    foreach($candidate in $sorted) {
        $cover=@(@($Existing)+@($add) | Where-Object { Covered-By $candidate $_ } | Select-Object -First 1)
        if($cover.Count){$skip.Add($candidate+'  ←  '+$cover[0])}else{$add.Add($candidate)}
    }
    return @{Add=@($add.ToArray());Skip=@($skip.ToArray())}
}
function Read-Settings([string]$IniPath) {
    $raw=[IO.File]::ReadAllBytes($IniPath)
    $encoding=New-Object Text.UTF8Encoding($false,$true)
    $offset=0
    if($raw.Length -ge 3 -and $raw[0] -eq 239 -and $raw[1] -eq 187 -and $raw[2] -eq 191){$encoding=New-Object Text.UTF8Encoding($true,$true);$offset=3}
    elseif($raw.Length -ge 2 -and $raw[0] -eq 255 -and $raw[1] -eq 254){$encoding=[Text.Encoding]::Unicode;$offset=2}
    elseif($raw.Length -ge 2 -and $raw[0] -eq 254 -and $raw[1] -eq 255){$encoding=[Text.Encoding]::BigEndianUnicode;$offset=2}
    $text=$encoding.GetString($raw,$offset,$raw.Length-$offset)
    $lines=[regex]::Split($text,'\r\n|\n|\r')
    $start=-1;$end=$lines.Length
    for($i=0;$i -lt $lines.Length;$i++) {
        if($lines[$i] -match '^\s*\[Everything\]\s*$'){if($start -ge 0){throw 'ملف الإعدادات يحتوي قسم Everything مكررًا'};$start=$i}
        elseif($start -ge 0 -and $lines[$i] -match '^\s*\[' -and $end -eq $lines.Length){$end=$i}
    }
    if($start -lt 0){throw 'لم يوجد قسم [Everything] في الملف؛ اختر ملف إعدادات Everything الصحيح.'}
    $values=@{};$positions=@{}
    for($i=$start+1;$i -lt $end;$i++){if($lines[$i] -match '^\s*([^=;#]+?)\s*=(.*)$'){$key=$Matches[1].Trim();if($positions.ContainsKey($key)){throw 'يوجد مفتاح إعدادات مكرر: '+$key};$values[$key]=$Matches[2];$positions[$key]=$i}}
    $existing=@()
    if($values.ContainsKey('folders') -and $values.folders.Trim()) {
        # Standard Everything INI uses comma separated paths, optionally quoted.
        foreach($value in ($values.folders -split ',')){$piece=$value.Trim();$v=$piece.Trim('"');if($piece.StartsWith('"') -ne $piece.EndsWith('"') -or $v -notmatch '^(?:\\\\|[A-Za-z]:\\)' -or !$v -or $v.Contains('"')){throw 'صيغة قائمة المجلدات غير مدعومة؛ لم يتم التعديل.'};$existing+= $v}
    }
    return @{Raw=$raw;Encoding=$encoding;Lines=$lines;Start=$start;End=$end;Values=$values;Positions=$positions;Existing=$existing;Newline=$(if($text.Contains("`r`n")){"`r`n"}else{"`n"})}
}
function Build-Settings($Settings,[string[]]$Add) {
    if(!$Add.Count){return $null}
    $defaults=[ordered]@{folder_monitor_changes='1';folder_buffer_size_list='65536';folder_rescan_if_full_list='1';folder_update_types='2';folder_update_days='0';folder_update_ats='3';folder_update_intervals='24';folder_update_interval_types='1'}
    $changes=@{folders=(@($Settings.Existing)+@($Add) -join ',')}
    foreach($key in $defaults.Keys){
        $old=@();if($Settings.Values.ContainsKey($key) -and $Settings.Values[$key].Length){$old=@($Settings.Values[$key] -split ',')}
        if($old.Count -gt $Settings.Existing.Count){throw 'عدد إعدادات المجلدات غير متوافق: '+$key}
        while($old.Count -lt $Settings.Existing.Count){$old+= $defaults[$key]}
        $changes[$key]=(@($old)+@($Add | ForEach-Object {$defaults[$key]}) -join ',')
    }
    $out=New-Object 'System.Collections.Generic.List[string]'
    for($i=0;$i -le $Settings.Lines.Length;$i++){
        if($i -eq $Settings.End){foreach($key in $changes.Keys){if(!$Settings.Positions.ContainsKey($key)){$out.Add($key+'='+$changes[$key])}}}
        if($i -eq $Settings.Lines.Length){break}
        $line=$Settings.Lines[$i]
        if($i -gt $Settings.Start -and $i -lt $Settings.End -and $line -match '^\s*([^=;#]+?)\s*='){$key=$Matches[1].Trim();if($changes.ContainsKey($key)){$line=$key+'='+$changes[$key]}}
        $out.Add($line)
    }
    return [string]::Join($Settings.Newline,$out.ToArray())
}
function Save-Settings([string]$IniPath,$Settings,[string]$Text) {
    $current=[IO.File]::ReadAllBytes($IniPath)
    if([Convert]::ToBase64String($current) -ne [Convert]::ToBase64String($Settings.Raw)){throw 'تغير ملف الإعدادات منذ المعاينة؛ أعد المعاينة.'}
    $backup=$IniPath+'.estra7ah-backup-'+[Guid]::NewGuid().ToString('N')
    $temp=$IniPath+'.estra7ah-new-'+[Guid]::NewGuid().ToString('N')
    [IO.File]::WriteAllText($temp,$Text,$Settings.Encoding)
    [IO.File]::Replace($temp,$IniPath,$backup)
    return $backup
}
if($LibraryOnly){return}
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[Windows.Forms.Application]::EnableVisualStyles()
$form=New-Object Windows.Forms.Form
$form.Text='إضافة مسارات الاستراحة إلى Everything';$form.Size=New-Object Drawing.Size(820,700);$form.StartPosition='CenterScreen';$form.RightToLeft='Yes'
$label=New-Object Windows.Forms.Label;$label.SetBounds(20,15,760,65);$label.Text='شغّل الملف على جهاز Everything وبنفس مستخدم Windows. أغلق Everything من أيقونته بجانب الساعة (خروج) قبل الإضافة. الصق المسارات المطلوبة، مسارًا في كل سطر. المسار الأب الموجود يغطي مجلداته الفرعية؛ لا يتم تغييره أو تكراره.';$form.Controls.Add($label)
$paths=New-Object Windows.Forms.TextBox;$paths.Multiline=$true;$paths.ScrollBars='Both';$paths.RightToLeft='No';$paths.SetBounds(20,85,760,160);$form.Controls.Add($paths)
$embedded='__ESTRA7AH_PATHS_BASE64__'
if($embedded -ne '__ESTRA7AH_'+'PATHS_BASE64__'){$paths.Lines=@([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($embedded)) | ConvertFrom-Json)}
$pick=New-Object Windows.Forms.Button;$pick.Text='اختيار Everything.ini';$pick.SetBounds(550,255,230,35);$form.Controls.Add($pick)
$ini=New-Object Windows.Forms.TextBox;$ini.ReadOnly=$true;$ini.RightToLeft='No';$ini.SetBounds(20,300,760,28);$form.Controls.Add($ini)
$preview=New-Object Windows.Forms.Button;$preview.Text='معاينة الإضافات';$preview.SetBounds(310,255,230,35);$form.Controls.Add($preview)
$apply=New-Object Windows.Forms.Button;$apply.Text='إضافة المسارات الناقصة';$apply.SetBounds(20,255,280,35);$apply.Enabled=$false;$form.Controls.Add($apply)
$output=New-Object Windows.Forms.TextBox;$output.Multiline=$true;$output.ReadOnly=$true;$output.ScrollBars='Both';$output.SetBounds(20,340,760,270);$form.Controls.Add($output)
$script:plan=$null;$script:settings=$null
$paths.Add_TextChanged({$apply.Enabled=$false})
$pick.Add_Click({$dialog=New-Object Windows.Forms.OpenFileDialog;$dialog.Filter='Everything settings (*.ini)|*.ini';$dialog.InitialDirectory=Join-Path $env:APPDATA 'Everything';if($dialog.ShowDialog() -eq 'OK'){$ini.Text=$dialog.FileName;$apply.Enabled=$false}})
$preview.Add_Click({try{
    $script:settings=Read-Settings $ini.Text
    $script:plan=Plan-Folders @($paths.Lines) @($script:settings.Existing)
    $null=Build-Settings $script:settings @($script:plan.Add)
    $output.Text="ستضاف هذه المسارات:`r`n"+($script:plan.Add -join "`r`n")+"`r`n`r`nمسارات مغطاة بالفعل ولن تضاف:`r`n"+($script:plan.Skip -join "`r`n")+"`r`n`r`nإذا كان الأب مضافًا لكن لا تظهر نتائج، راجع الاستثناءات وصلاحيات الوصول واكتمال الفهرسة."
    $apply.Enabled=$script:plan.Add.Count -gt 0
}catch{$apply.Enabled=$false;$output.Text=$_.Exception.Message}})
$apply.Add_Click({try{
    $session=[Diagnostics.Process]::GetCurrentProcess().SessionId
    $running=@(Get-Process -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -like 'Everything*' -and $_.SessionId -eq $session})
    if($running.Count){throw 'أغلق Everything باختيار خروج من أيقونته بجانب الساعة، ثم اضغط الإضافة. لا يكفي إغلاق نافذة البحث.'}
    $text=Build-Settings $script:settings @($script:plan.Add)
    $backup=Save-Settings $ini.Text $script:settings $text
    $apply.Enabled=$false;$output.Text="اكتملت إضافة المسارات. افتح Everything بالطريقة المعتادة وانتظر الفهرسة.`r`nنسخة احتياطية محفوظة في:`r`n"+$backup+"`r`nلم تُغيّر كلمات المرور أو إعدادات الاتصال."
}catch{$output.Text=$_.Exception.Message}})
$null=$form.ShowDialog()
