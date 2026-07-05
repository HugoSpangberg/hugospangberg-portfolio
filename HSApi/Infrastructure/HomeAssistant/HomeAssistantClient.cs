using System.Net.Http.Json;
using HSApi.Common.Configuration;
using Microsoft.Extensions.Options;

namespace HSApi.Infrastructure.HomeAssistant;

public sealed class HomeAssistantClient(
    HttpClient httpClient,
    IOptions<HomeAssistantOptions> options,
    ILogger<HomeAssistantClient> logger)
{
    private readonly HomeAssistantOptions _options = options.Value;

    public async Task<bool> SendHelloAsync(Guid requestId, CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            logger.LogInformation("Home Assistant is disabled; using safe development success for request {RequestId}.", requestId);
            return true;
        }

        if (string.IsNullOrWhiteSpace(_options.WebhookUrl))
        {
            logger.LogWarning("Home Assistant is enabled but no webhook URL is configured.");
            return false;
        }

        using HttpRequestMessage request = new(HttpMethod.Post, _options.WebhookUrl);
        request.Content = JsonContent.Create(new
        {
            requestId,
            timestamp = DateTimeOffset.UtcNow,
        });

        if (!string.IsNullOrWhiteSpace(_options.AccessClientId) &&
            !string.IsNullOrWhiteSpace(_options.AccessClientSecret))
        {
            request.Headers.TryAddWithoutValidation("CF-Access-Client-Id", _options.AccessClientId);
            request.Headers.TryAddWithoutValidation("CF-Access-Client-Secret", _options.AccessClientSecret);
        }

        using HttpResponseMessage response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Home Assistant request {RequestId} failed with status {StatusCode}.", requestId, response.StatusCode);
            return false;
        }

        return true;
    }
}
