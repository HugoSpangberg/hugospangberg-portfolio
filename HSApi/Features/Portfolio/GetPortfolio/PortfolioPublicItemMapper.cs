using System.Text.Json;
using HSApi.Common.Admin;

namespace HSApi.Features.Portfolio.GetPortfolio;

public static class PortfolioPublicItemMapper
{
    public static IReadOnlyList<PublicExperienceDto> MapExperiences(
        JsonElement content,
        string locale)
    {
        if (!content.TryGetProperty("experience", out JsonElement section) ||
            !section.TryGetProperty("items", out JsonElement items) ||
            items.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return items.EnumerateArray()
            .Where(IsPublished)
            .Select((item, index) => new PublicExperienceDto(
                ReadGuid(item, "id"),
                ReadString(item, "slug") ?? Slugify($"{ReadString(item, "company")}-{ReadString(item, "role")}"),
                ReadString(item, "locale") ?? locale,
                ReadString(item, "company") ?? string.Empty,
                ReadString(item, "role") ?? string.Empty,
                ReadString(item, "location"),
                ReadString(item, "employmentType"),
                ReadDate(item, "startDate"),
                ReadDate(item, "endDate"),
                ReadBool(item, "isCurrent"),
                ReadString(item, "summary") ?? ReadString(item, "description") ?? string.Empty,
                ReadString(item, "description") ?? string.Empty,
                ReadArray(item, "technologies", "focus"),
                ReadArray(item, "highlights", "impact"),
                ReadInt(item, "sortOrder") ?? index))
            .OrderBy(item => item.SortOrder)
            .ThenBy(item => item.Company, StringComparer.Ordinal)
            .ToArray();
    }

    public static IReadOnlyList<PublicProjectDto> MapProjects(
        JsonElement content,
        string locale)
    {
        if (!content.TryGetProperty("labs", out JsonElement section) ||
            !section.TryGetProperty("items", out JsonElement items) ||
            items.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return items.EnumerateArray()
            .Where(IsPublished)
            .Select((item, index) => new PublicProjectDto(
                ReadGuid(item, "id"),
                ReadString(item, "slug") ?? Slugify(ReadString(item, "title") ?? $"project-{index + 1}"),
                ReadString(item, "locale") ?? locale,
                ReadString(item, "title") ?? string.Empty,
                ReadString(item, "shortDescription") ?? ReadString(item, "description") ?? string.Empty,
                ReadString(item, "description") ?? string.Empty,
                ReadArray(item, "technologies"),
                ReadString(item, "repositoryUrl"),
                ReadString(item, "liveUrl"),
                ReadString(item, "imageUrl"),
                ReadBool(item, "featured"),
                ReadInt(item, "sortOrder") ?? index))
            .OrderBy(item => item.SortOrder)
            .ThenBy(item => item.Title, StringComparer.Ordinal)
            .ToArray();
    }

    public static bool IsPublished(JsonElement item) =>
        !item.TryGetProperty("isPublished", out JsonElement isPublished) ||
        isPublished.ValueKind != JsonValueKind.False;

    private static string? ReadString(JsonElement item, string property) =>
        item.TryGetProperty(property, out JsonElement value) &&
        value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    private static Guid? ReadGuid(JsonElement item, string property) =>
        Guid.TryParse(ReadString(item, property), out Guid id) ? id : null;

    private static DateOnly? ReadDate(JsonElement item, string property) =>
        DateOnly.TryParse(ReadString(item, property), out DateOnly date) ? date : null;

    private static int? ReadInt(JsonElement item, string property) =>
        item.TryGetProperty(property, out JsonElement value) &&
        value.ValueKind == JsonValueKind.Number &&
        value.TryGetInt32(out int result)
            ? result
            : null;

    private static bool ReadBool(JsonElement item, string property) =>
        item.TryGetProperty(property, out JsonElement value) &&
        value.ValueKind == JsonValueKind.True;

    private static IReadOnlyList<string> ReadArray(
        JsonElement item,
        string property,
        string? fallbackProperty = null)
    {
        if (!item.TryGetProperty(property, out JsonElement value) &&
            (fallbackProperty is null || !item.TryGetProperty(fallbackProperty, out value)))
        {
            return [];
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return value.EnumerateArray()
            .Where(element => element.ValueKind == JsonValueKind.String)
            .Select(element => element.GetString()?.Trim())
            .Where(element => !string.IsNullOrWhiteSpace(element))
            .Select(element => element!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static string Slugify(string value)
    {
        string slug = new(
            value.ToLowerInvariant()
                .Select(character => char.IsLetterOrDigit(character) ? character : '-')
                .ToArray());

        return string.Join(
            '-',
            slug.Split('-', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
    }
}
