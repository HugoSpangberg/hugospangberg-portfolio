#!/usr/bin/env bash
set -euo pipefail

required=(
  "UMBRACO_ADMIN_EMAIL"
  "UMBRACO_ADMIN_PASSWORD"
  "UMBRACO_ADMIN_NAME"
)

for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: ${name}" >&2
    exit 1
  fi
done

dotnet restore HSCms/HSCms.csproj

dotnet user-secrets set "Umbraco:CMS:Unattended:InstallUnattended" "true" --project HSCms/HSCms.csproj
dotnet user-secrets set "Umbraco:CMS:Unattended:UnattendedUserName" "${UMBRACO_ADMIN_NAME}" --project HSCms/HSCms.csproj
dotnet user-secrets set "Umbraco:CMS:Unattended:UnattendedUserEmail" "${UMBRACO_ADMIN_EMAIL}" --project HSCms/HSCms.csproj
dotnet user-secrets set "Umbraco:CMS:Unattended:UnattendedUserPassword" "${UMBRACO_ADMIN_PASSWORD}" --project HSCms/HSCms.csproj

echo "CMS user secrets configured. Run: npm run dev:cms"
