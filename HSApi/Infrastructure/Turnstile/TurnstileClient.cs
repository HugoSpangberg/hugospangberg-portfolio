using System.Net.Http.Json;
using System.Text.Json.Serialization;
using HSApi.Common.Configuration;
using Microsoft.Extensions.Options;

namespace HSApi.Infrastructure.Turnstile;

public sealed class TurnstileClient(
    HttpClient httpClient,
    IOptions<TurnstileOptions> options,
    IHostEnvironment environment,
    ILogger<TurnstileClient> logger)
{
    private readonly TurnstileOptions _options = options.Value;

    public async Task<bool> VerifyAsync(string token, CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(_options.SecretKey))
        {
            if (environment.IsDevelopment())
            {
                logger.LogWarning("Turnstile is enabled without a secret; development request is rejected unless bypass is configured.");
            }

            return false;
        }

        using FormUrlEncodedContent content = new(
        [
            new KeyValuePair<string, string>("secret", _options.SecretKey),
            new KeyValuePair<string, string>("response", token),
        ]);

        using HttpResponseMessage response = await httpClient.PostAsync(_options.VerifyUrl, content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Turnstile verification failed with status {StatusCode}.", response.StatusCode);
            return false;
        }

        TurnstileVerifyResponse? result = await response.Content
            .ReadFromJsonAsync<TurnstileVerifyResponse>(cancellationToken);

        return result?.Success == true;
    }

    private sealed record TurnstileVerifyResponse(
        [property: JsonPropertyName("success")] bool Success);
}
