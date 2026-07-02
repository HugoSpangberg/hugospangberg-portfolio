using System.Text.Json;
using System.Text.Json.Nodes;

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

    public static JsonElement FilterPublishedContent(JsonElement content)
    {
        JsonNode? node = JsonNode.Parse(content.GetRawText());

        if (node is not JsonObject root)
        {
            return content.Clone();
        }

        FilterSectionItems(root, "experience");
        FilterSectionItems(root, "labs");

        return JsonSerializer.SerializeToElement(root);
    }

    private static void FilterSectionItems(JsonObject root, string sectionName)
    {
        if (root[sectionName] is not JsonObject section ||
            section["items"] is not JsonArray items)
        {
            return;
        }

        JsonNode?[] publishedItems = items
            .Where(item => item is JsonObject itemObject && IsPublished(itemObject))
            .Select(item => item?.DeepClone())
            .ToArray();

        items.Clear();

        foreach (JsonNode? item in publishedItems)
        {
            items.Add(item);
        }
    }

    private static bool IsPublished(JsonObject item)
    {
        if (item["isPublished"] is not JsonValue value ||
            !value.TryGetValue(out bool published))
        {
            return true;
        }

        return published;
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
