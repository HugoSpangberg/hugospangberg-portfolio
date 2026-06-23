using System.Text.Json;

namespace HugoPortfolio.Cms.Seed;

public static class PortfolioSeedValidator
{
    private static readonly string[] RequiredLocales = ["sv", "en"];

    public static void Validate(Stream stream)
    {
        using JsonDocument document = JsonDocument.Parse(stream);
        JsonElement root = document.RootElement;

        if (root.ValueKind is not JsonValueKind.Object)
        {
            throw new PortfolioSeedValidationException("Portfolio seed root must be an object.");
        }

        foreach (string locale in RequiredLocales)
        {
            if (!root.TryGetProperty(locale, out JsonElement localizedContent))
            {
                throw new PortfolioSeedValidationException(
                    $"Portfolio seed is missing locale '{locale}'.");
            }

            ValidateLocalizedContent(locale, localizedContent);
        }
    }

    private static void ValidateLocalizedContent(string locale, JsonElement content)
    {
        RequireObject(content, locale);
        RequireString(content, locale, "seo", "title");
        RequireString(content, locale, "seo", "description");
        RequireString(content, locale, "hero", "title");
        RequireString(content, locale, "sayHi", "buttonLabel");
        RequireString(content, locale, "sayHi", "successDialog", "privacy");
    }

    private static void RequireString(
        JsonElement root,
        string locale,
        string section,
        string property)
    {
        if (!root.TryGetProperty(section, out JsonElement sectionElement) ||
            sectionElement.ValueKind is not JsonValueKind.Object ||
            !sectionElement.TryGetProperty(property, out JsonElement propertyElement) ||
            propertyElement.ValueKind is not JsonValueKind.String ||
            string.IsNullOrWhiteSpace(propertyElement.GetString()))
        {
            throw new PortfolioSeedValidationException(
                $"Portfolio seed locale '{locale}' is missing '{section}.{property}'.");
        }
    }

    private static void RequireString(
        JsonElement root,
        string locale,
        string section,
        string group,
        string property)
    {
        if (!root.TryGetProperty(section, out JsonElement sectionElement) ||
            sectionElement.ValueKind is not JsonValueKind.Object ||
            !sectionElement.TryGetProperty(group, out JsonElement groupElement) ||
            groupElement.ValueKind is not JsonValueKind.Object ||
            !groupElement.TryGetProperty(property, out JsonElement propertyElement) ||
            propertyElement.ValueKind is not JsonValueKind.String ||
            string.IsNullOrWhiteSpace(propertyElement.GetString()))
        {
            throw new PortfolioSeedValidationException(
                $"Portfolio seed locale '{locale}' is missing '{section}.{group}.{property}'.");
        }
    }

    private static void RequireObject(JsonElement element, string locale)
    {
        if (element.ValueKind is not JsonValueKind.Object)
        {
            throw new PortfolioSeedValidationException(
                $"Portfolio seed locale '{locale}' must be an object.");
        }
    }
}
