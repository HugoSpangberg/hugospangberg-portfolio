FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY cms/HugoPortfolio.Cms/HugoPortfolio.Cms.csproj cms/HugoPortfolio.Cms/
RUN dotnet restore cms/HugoPortfolio.Cms/HugoPortfolio.Cms.csproj

COPY cms/HugoPortfolio.Cms cms/HugoPortfolio.Cms
RUN dotnet publish cms/HugoPortfolio.Cms/HugoPortfolio.Cms.csproj \
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

ENTRYPOINT ["dotnet", "HugoPortfolio.Cms.dll"]
