using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace HSApi.Features.Portfolio.GetPortfolio;

public sealed record PortfolioContentDocument(
    string Locale,
    string Source,
    DateTimeOffset GeneratedAtUtc,
    string ETag,
    JsonDocument Content)
{
    public static string CreateETag(string payload)
    {
        byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        return '"' + Convert.ToHexString(hash).ToLowerInvariant() + '"';
    }
}
