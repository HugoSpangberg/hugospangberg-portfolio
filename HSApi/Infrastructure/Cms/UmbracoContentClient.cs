using System.Text.Json;
using HSApi.Common.Configuration;
using HSApi.Common.Http;
using Microsoft.Extensions.Options;

namespace HSApi.Infrastructure.Cms;

public sealed class UmbracoContentClient(
    HttpClient httpClient,
    IOptions<CmsOptions> options,
    ILogger<UmbracoContentClient> logger)
{
    private readonly CmsOptions _options = options.Value;

    public async Task<JsonDocument?> GetPortfolioContentAsync(
        string locale,
        CancellationToken cancellationToken)
    {
        if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.BaseUrl))
        {
            return null;
        }

        if (!LocaleMap.TryMapCulture(locale, out string culture))
        {
            throw new ArgumentOutOfRangeException(nameof(locale), locale, "Unsupported locale.");
        }

        string route = Uri.EscapeDataString(_options.ContentRoute.TrimStart('/'));
        using HttpRequestMessage request = new(
            HttpMethod.Get,
            $"/umbraco/delivery/api/v2/content/item/{route}?culture={Uri.EscapeDataString(culture)}");
        request.Headers.AcceptLanguage.ParseAdd(culture);

        using HttpResponseMessage response = await httpClient.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("CMS content fetch failed with status {StatusCode}.", response.StatusCode);
            return null;
        }

        await using Stream stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
    }
}
