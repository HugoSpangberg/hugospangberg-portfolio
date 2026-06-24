FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props global.json ./
COPY HSApi/HSApi.csproj HSApi/
RUN dotnet restore HSApi/HSApi.csproj

COPY HSApi HSApi
COPY shared-content shared-content
RUN dotnet publish HSApi/HSApi.csproj \
  --configuration Release \
  --no-restore \
  --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl --fail http://localhost:8080/health/live || exit 1

ENTRYPOINT ["dotnet", "HSApi.dll"]
