using System.Text.Json;

namespace HSApi.Features.Portfolio.GetPortfolio;

public sealed record GetPortfolioResponse(
    string Locale,
    string Source,
    DateTimeOffset GeneratedAtUtc,
    JsonElement Content);
