using System.Text.Json;
using HSApi.Infrastructure.Cms;
using HSApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HSApi.Features.Portfolio.GetPortfolio;

public sealed class GetPortfolioHandler(
    UmbracoContentClient cmsClient,
    PortfolioDbContext dbContext,
    IWebHostEnvironment environment,
    ILogger<GetPortfolioHandler> logger)
{
    public async Task<PortfolioContentDocument> HandleAsync(
        string locale,
        CancellationToken cancellationToken)
    {
        JsonDocument? cmsDocument = await cmsClient.GetPortfolioContentAsync(locale, cancellationToken);

        if (cmsDocument is not null)
        {
            using (cmsDocument)
            {
                JsonDocument content = PortfolioContentMapper.MapFromUmbraco(cmsDocument);
                return await StoreSnapshotAsync(locale, "cms", content, cancellationToken);
            }
        }

        ContentSnapshot? snapshot = await dbContext.ContentSnapshots
            .AsNoTracking()
            .Where(item => item.Locale == locale && item.IsCurrent)
            .OrderByDescending(item => item.FetchedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (snapshot is not null)
        {
            logger.LogInformation("Serving portfolio content from API snapshot for locale {Locale}.", locale);
            return new PortfolioContentDocument(
                locale,
                "snapshot",
                snapshot.FetchedAtUtc,
                snapshot.ETag,
                JsonDocument.Parse(snapshot.PayloadJson));
        }

        JsonDocument fallbackSeed = await LoadSeedAsync(cancellationToken);
        JsonDocument fallbackContent = PortfolioContentMapper.MapFromSeed(fallbackSeed, locale);
        string fallbackPayload = fallbackContent.RootElement.GetRawText();

        return new PortfolioContentDocument(
            locale,
            "fallback",
            DateTimeOffset.UtcNow,
            PortfolioContentDocument.CreateETag(fallbackPayload),
            fallbackContent);
    }

    private async Task<PortfolioContentDocument> StoreSnapshotAsync(
        string locale,
        string source,
        JsonDocument content,
        CancellationToken cancellationToken)
    {
        string payload = content.RootElement.GetRawText();
        string etag = PortfolioContentDocument.CreateETag(payload);
        DateTimeOffset now = DateTimeOffset.UtcNow;

        ContentSnapshot[] currentSnapshots = await dbContext.ContentSnapshots
            .Where(item => item.Locale == locale && item.IsCurrent)
            .ToArrayAsync(cancellationToken);

        foreach (ContentSnapshot snapshot in currentSnapshots)
        {
            snapshot.IsCurrent = false;
        }

        dbContext.ContentSnapshots.Add(new ContentSnapshot
        {
            Locale = locale,
            PayloadJson = payload,
            ETag = etag,
            FetchedAtUtc = now,
            IsCurrent = true,
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new PortfolioContentDocument(locale, source, now, etag, content);
    }

    private async Task<JsonDocument> LoadSeedAsync(CancellationToken cancellationToken)
    {
        string[] candidates =
        [
            Path.Combine(environment.ContentRootPath, "shared-content", "portfolio.seed.json"),
            Path.GetFullPath(Path.Combine(environment.ContentRootPath, "..", "shared-content", "portfolio.seed.json")),
            Path.Combine(AppContext.BaseDirectory, "shared-content", "portfolio.seed.json"),
        ];

        string path = candidates.FirstOrDefault(File.Exists)
            ?? throw new FileNotFoundException("Could not find portfolio seed content.", candidates[0]);

        await using FileStream stream = File.OpenRead(path);
        return await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
    }
}
