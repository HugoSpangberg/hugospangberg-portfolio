$ErrorActionPreference = "Stop"

$required = @(
  "UMBRACO_ADMIN_EMAIL",
  "UMBRACO_ADMIN_PASSWORD",
  "UMBRACO_ADMIN_NAME"
)

foreach ($name in $required) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
    throw "Missing required environment variable: $name"
  }
}

dotnet restore cms/HugoPortfolio.Cms.slnx

dotnet user-secrets set "Umbraco:CMS:Unattended:InstallUnattended" "true" --project cms/HugoPortfolio.Cms/HugoPortfolio.Cms.csproj
dotnet user-secrets set "Umbraco:CMS:Unattended:UnattendedUserName" $env:UMBRACO_ADMIN_NAME --project cms/HugoPortfolio.Cms/HugoPortfolio.Cms.csproj
dotnet user-secrets set "Umbraco:CMS:Unattended:UnattendedUserEmail" $env:UMBRACO_ADMIN_EMAIL --project cms/HugoPortfolio.Cms/HugoPortfolio.Cms.csproj
dotnet user-secrets set "Umbraco:CMS:Unattended:UnattendedUserPassword" $env:UMBRACO_ADMIN_PASSWORD --project cms/HugoPortfolio.Cms/HugoPortfolio.Cms.csproj

Write-Host "CMS user secrets configured. Run: npm run dev:cms"
