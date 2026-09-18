param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('kimi', 'deepseek')]
  [string]$Target
)

$ErrorActionPreference = 'Stop'

$configPath = 'C:\Users\Admin\.codex\config.toml'
if (-not (Test-Path -LiteralPath $configPath)) { throw "config not found: $configPath" }

$presets = @{
  kimi     = @{ model = 'k3-256k';           provider = 'kimi' }
  deepseek = @{ model = 'deepseek-v4-flash'; provider = 'deepseek' }
}
$want = $presets[$Target]

# latin1 gives a byte-for-byte round trip, so unrelated (incl. non-UTF8) lines stay untouched
$latin1 = [Text.Encoding]::GetEncoding(28591)
$text = $latin1.GetString([IO.File]::ReadAllBytes($configPath))

Copy-Item -LiteralPath $configPath -Destination "$configPath.bak-switch" -Force

$modelRegex = [regex]'(?m)^model = "[^"\r\n]*"'
$providerRegex = [regex]'(?m)^model_provider = "[^"\r\n]*"'
$text = $modelRegex.Replace($text, 'model = "' + $want.model + '"', 1)
$text = $providerRegex.Replace($text, 'model_provider = "' + $want.provider + '"', 1)

[IO.File]::WriteAllBytes($configPath, $latin1.GetBytes($text))

Write-Host ''
Write-Host ("Active now -> model: {0} | provider: {1}" -f $want.model, $want.provider)
Write-Host 'Fully quit the Codex desktop app and reopen it for the change to take effect.'
