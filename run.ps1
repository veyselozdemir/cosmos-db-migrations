$files = Get-ChildItem -Filter *.js ./scriptsToRun | Sort-Object -Property Name 
if (-Not ($files)) {
    Write-Output "No scripts found to run"
    Return
}
Write-Output "Scripts found to run : $files" 
foreach ($file in $files)
{
    $executionResultCode = 0
    $cmd = @('node', $file.Fullname) -join ' '
    Invoke-Expression $cmd 
    $executionResultCode = $LASTEXITCODE
    Write-Output "Execution result code is: $executionResultCode" 

    if (-Not ($executionResultCode -eq 0)) {
       Write-Error "Exit code is not found to be True. Remaining scripts will not be executed" 
       break
    }
}
