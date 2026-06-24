using System.Text.Json;

namespace HSApi.Features.Portfolio.GetPortfolio;

public static class PortfolioContentMapper
{
    public static JsonDocument MapFromUmbraco(JsonDocument deliveryApiDocument)
    {
        JsonElement root = deliveryApiDocument.RootElement;

        if (!root.TryGetProperty("properties", out JsonElement properties))
        {
            throw new JsonException("Delivery API response did not contain properties.");
        }

        JsonElement candidate = TryGetProperty(properties, "portfolioContent")
            ?? TryGetProperty(properties, "content")
            ?? TryGetProperty(properties, "portfolioJson")
            ?? properties;

        ValidatePortfolioContent(candidate);

        return JsonDocument.Parse(candidate.GetRawText());
    }

    public static JsonDocument MapFromSeed(JsonDocument seedDocument, string locale)
    {
        if (!seedDocument.RootElement.TryGetProperty(locale, out JsonElement content))
        {
            throw new JsonException($"Seed content did not contain locale '{locale}'.");
        }

        ValidatePortfolioContent(content);

        return JsonDocument.Parse(content.GetRawText());
    }

    public static void ValidatePortfolioContent(JsonElement content)
    {
        RequireObject(content, "seo");
        RequireObject(content, "hero");
        RequireObject(content, "experience");
        JsonElement experienceItems = content.GetProperty("experience").GetProperty("items");

        if (experienceItems.ValueKind != JsonValueKind.Array || experienceItems.GetArrayLength() == 0)
        {
            throw new JsonException("Portfolio content must contain at least one experience item.");
        }
    }

    private static JsonElement? TryGetProperty(JsonElement element, string name) =>
        element.TryGetProperty(name, out JsonElement value) ? value : null;

    private static void RequireObject(JsonElement element, string name)
    {
        if (!element.TryGetProperty(name, out JsonElement value) ||
            value.ValueKind != JsonValueKind.Object)
        {
            throw new JsonException($"Portfolio content must contain object '{name}'.");
        }
    }
}
