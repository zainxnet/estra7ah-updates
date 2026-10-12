# Keep a complete display title while removing folder date and copy suffixes.
function Get-FolderIconTitle([string]$Value) {
    $text=[regex]::Replace($Value,'[\p{Cf}\x00-\x1f\x7f]','').Trim()
    $original=$text
    $year='(?:18|19|20)\d{2}'
    $dated='[\(\[]\s*'+$year+'(?:\s*[-–—]\s*(?:'+$year+')?)?\s*[\)\]]'
    $text=[regex]::Replace($text,'^(?:\s*'+$dated+'\s*)+','')
    $match=[regex]::Match($text,'\s*'+$dated)
    if($match.Success -and $match.Index -gt 0){$text=$text.Substring(0,$match.Index)}
    $match=[regex]::Match($text,'\s+'+$year+'\b')
    if($match.Success -and $match.Index -gt 0){$text=$text.Substring(0,$match.Index)}
    $text=[regex]::Replace($text,'\s+[-–—]\s*\d{1,3}\s*$','').Trim(' ','-','–','—','_')
    if([string]::IsNullOrWhiteSpace($text)){return $original}
    return $text
}
