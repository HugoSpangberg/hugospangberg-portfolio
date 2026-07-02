using System.Text.Json;
using System.Text.Json.Nodes;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace HugoPortfolio.Cms.Features.PortfolioManagement;

public sealed class PortfolioContentManagementService(IContentService contentService)
{
    private const string PortfolioHomeAlias = "portfolioHome";
    private const string PortfolioContentAlias = "portfolioContent";
    private const int SystemUserId = -1;

    public PortfolioAdminListResponse<AdminExperienceDto> GetExperiences(string? locale)
    {
        string[] locales = ResolveLocales(locale);
        List<AdminExperienceDto> items = [];

        foreach (string currentLocale in locales)
        {
            JsonObject root = LoadRoot(Culture(currentLocale));
            items.AddRange(GetItems(root, "experience")
                .OfType<JsonObject>()
                .Select((item, index) => MapExperience(item, currentLocale, index)));
        }

        return new PortfolioAdminListResponse<AdminExperienceDto>(
            items.OrderBy(item => item.Locale, StringComparer.Ordinal)
                .ThenBy(item => item.SortOrder)
                .ThenBy(item => item.Company, StringComparer.Ordinal)
                .ToArray());
    }

    public AdminExperienceDto? GetExperience(Guid id) =>
        ResolveLocales(null)
            .SelectMany(locale => GetItems(LoadRoot(Culture(locale)), "experience")
                .OfType<JsonObject>()
                .Select((item, index) => MapExperience(item, locale, index)))
            .FirstOrDefault(item => item.Id == id);

    public ManagementWriteResult<AdminExperienceDto> CreateExperience(
        UpsertAdminExperienceRequest request)
    {
        IDictionary<string, string[]> errors =
            PortfolioManagementValidation.ValidateExperience(request, requireVersion: false);

        if (errors.Count > 0)
        {
            return ManagementWriteResult<AdminExperienceDto>.Invalid(errors);
        }

        return Mutate(request.Locale, root =>
        {
            JsonArray items = GetItems(root, "experience");

            if (HasDuplicateSlug(items, request.Slug, null))
            {
                return ManagementWriteResult<AdminExperienceDto>.Invalid(
                    new Dictionary<string, string[]> { ["slug"] = ["Slug must be unique per locale."] });
            }

            JsonObject item = ExperienceToJson(request, Guid.NewGuid(), 1, DateTimeOffset.UtcNow, null);
            items.Add(item);

            return ManagementWriteResult<AdminExperienceDto>.Ok(
                MapExperience(item, request.Locale, items.Count - 1),
                shouldPublish: request.IsPublished);
        });
    }

    public ManagementWriteResult<AdminExperienceDto> UpdateExperience(
        Guid id,
        UpsertAdminExperienceRequest request)
    {
        IDictionary<string, string[]> errors =
            PortfolioManagementValidation.ValidateExperience(request, requireVersion: true);

        if (errors.Count > 0)
        {
            return ManagementWriteResult<AdminExperienceDto>.Invalid(errors);
        }

        return Mutate(request.Locale, root =>
        {
            JsonArray items = GetItems(root, "experience");
            JsonObject? existing = FindItem(items, id);

            if (existing is null)
            {
                return ManagementWriteResult<AdminExperienceDto>.NotFound();
            }

            if (ReadInt(existing, "version") != request.Version)
            {
                return ManagementWriteResult<AdminExperienceDto>.Conflict();
            }

            if (HasDuplicateSlug(items, request.Slug, id))
            {
                return ManagementWriteResult<AdminExperienceDto>.Invalid(
                    new Dictionary<string, string[]> { ["slug"] = ["Slug must be unique per locale."] });
            }

            int index = IndexOf(items, existing);
            JsonObject replacement = ExperienceToJson(
                request,
                id,
                request.Version.GetValueOrDefault() + 1,
                ReadDateTime(existing, "createdAt") ?? DateTimeOffset.UtcNow,
                request.IsPublished ? ReadDateTime(existing, "publishedAt") : null);

            items[index] = replacement;

            return ManagementWriteResult<AdminExperienceDto>.Ok(
                MapExperience(replacement, request.Locale, index),
                shouldPublish: request.IsPublished);
        });
    }

    public ManagementWriteResult<object> DeleteExperience(Guid id) =>
        DeleteItem(id, "experience");

    public ManagementWriteResult<AdminExperienceDto> PublishExperience(Guid id) =>
        SetExperiencePublication(id, true);

    public ManagementWriteResult<AdminExperienceDto> UnpublishExperience(Guid id) =>
        SetExperiencePublication(id, false);

    public ManagementWriteResult<PortfolioAdminListResponse<AdminExperienceDto>> ReorderExperiences(
        PortfolioAdminOrderRequest request)
    {
        foreach (PortfolioAdminOrderItem orderItem in request.Items)
        {
            if (orderItem.SortOrder < 0)
            {
                return ManagementWriteResult<PortfolioAdminListResponse<AdminExperienceDto>>.Invalid(
                    new Dictionary<string, string[]> { ["sortOrder"] = ["Sort order cannot be negative."] });
            }
        }

        return Reorder("experience", request, MapExperience);
    }

    public PortfolioAdminListResponse<AdminProjectDto> GetProjects(string? locale)
    {
        string[] locales = ResolveLocales(locale);
        List<AdminProjectDto> items = [];

        foreach (string currentLocale in locales)
        {
            JsonObject root = LoadRoot(Culture(currentLocale));
            items.AddRange(GetItems(root, "labs")
                .OfType<JsonObject>()
                .Select((item, index) => MapProject(item, currentLocale, index)));
        }

        return new PortfolioAdminListResponse<AdminProjectDto>(
            items.OrderBy(item => item.Locale, StringComparer.Ordinal)
                .ThenBy(item => item.SortOrder)
                .ThenBy(item => item.Title, StringComparer.Ordinal)
                .ToArray());
    }

    public AdminProjectDto? GetProject(Guid id) =>
        ResolveLocales(null)
            .SelectMany(locale => GetItems(LoadRoot(Culture(locale)), "labs")
                .OfType<JsonObject>()
                .Select((item, index) => MapProject(item, locale, index)))
            .FirstOrDefault(item => item.Id == id);

    public ManagementWriteResult<AdminProjectDto> CreateProject(UpsertAdminProjectRequest request)
    {
        IDictionary<string, string[]> errors =
            PortfolioManagementValidation.ValidateProject(request, requireVersion: false);

        if (errors.Count > 0)
        {
            return ManagementWriteResult<AdminProjectDto>.Invalid(errors);
        }

        return Mutate(request.Locale, root =>
        {
            JsonArray items = GetItems(root, "labs");

            if (HasDuplicateSlug(items, request.Slug, null))
            {
                return ManagementWriteResult<AdminProjectDto>.Invalid(
                    new Dictionary<string, string[]> { ["slug"] = ["Slug must be unique per locale."] });
            }

            JsonObject item = ProjectToJson(request, Guid.NewGuid(), 1, DateTimeOffset.UtcNow, null);
            items.Add(item);

            return ManagementWriteResult<AdminProjectDto>.Ok(
                MapProject(item, request.Locale, items.Count - 1),
                shouldPublish: request.IsPublished);
        });
    }

    public ManagementWriteResult<AdminProjectDto> UpdateProject(Guid id, UpsertAdminProjectRequest request)
    {
        IDictionary<string, string[]> errors =
            PortfolioManagementValidation.ValidateProject(request, requireVersion: true);

        if (errors.Count > 0)
        {
            return ManagementWriteResult<AdminProjectDto>.Invalid(errors);
        }

        return Mutate(request.Locale, root =>
        {
            JsonArray items = GetItems(root, "labs");
            JsonObject? existing = FindItem(items, id);

            if (existing is null)
            {
                return ManagementWriteResult<AdminProjectDto>.NotFound();
            }

            if (ReadInt(existing, "version") != request.Version)
            {
                return ManagementWriteResult<AdminProjectDto>.Conflict();
            }

            if (HasDuplicateSlug(items, request.Slug, id))
            {
                return ManagementWriteResult<AdminProjectDto>.Invalid(
                    new Dictionary<string, string[]> { ["slug"] = ["Slug must be unique per locale."] });
            }

            int index = IndexOf(items, existing);
            JsonObject replacement = ProjectToJson(
                request,
                id,
                request.Version.GetValueOrDefault() + 1,
                ReadDateTime(existing, "createdAt") ?? DateTimeOffset.UtcNow,
                request.IsPublished ? ReadDateTime(existing, "publishedAt") : null);

            items[index] = replacement;

            return ManagementWriteResult<AdminProjectDto>.Ok(
                MapProject(replacement, request.Locale, index),
                shouldPublish: request.IsPublished);
        });
    }

    public ManagementWriteResult<object> DeleteProject(Guid id) =>
        DeleteItem(id, "labs");

    public ManagementWriteResult<AdminProjectDto> PublishProject(Guid id) =>
        SetProjectPublication(id, true);

    public ManagementWriteResult<AdminProjectDto> UnpublishProject(Guid id) =>
        SetProjectPublication(id, false);

    public ManagementWriteResult<PortfolioAdminListResponse<AdminProjectDto>> ReorderProjects(
        PortfolioAdminOrderRequest request) =>
        Reorder("labs", request, MapProject);

    private ManagementWriteResult<T> Mutate<T>(
        string locale,
        Func<JsonObject, ManagementWriteResult<T>> change)
    {
        string culture = Culture(locale);
        IContent rootContent = GetPortfolioHome();
        JsonObject root = LoadRoot(rootContent, culture);
        ManagementWriteResult<T> result = change(root);

        if (!result.Success)
        {
            return result;
        }

        SaveRoot(rootContent, culture, root, result.ShouldPublish);
        return result;
    }

    private ManagementWriteResult<PortfolioAdminListResponse<T>> Reorder<T>(
        string sectionName,
        PortfolioAdminOrderRequest request,
        Func<JsonObject, string, int, T> mapper)
    {
        foreach (string locale in ResolveLocales(null))
        {
            ManagementWriteResult<T>? localeResult = null;
            string capturedLocale = locale;

            ManagementWriteResult<T> mutation = Mutate(locale, root =>
            {
                JsonArray items = GetItems(root, sectionName);

                foreach (PortfolioAdminOrderItem orderItem in request.Items)
                {
                    JsonObject? item = FindItem(items, orderItem.Id);

                    if (item is null)
                    {
                        continue;
                    }

                    if (ReadInt(item, "version") != orderItem.Version)
                    {
                        return ManagementWriteResult<T>.Conflict();
                    }

                    item["sortOrder"] = orderItem.SortOrder;
                    item["version"] = orderItem.Version + 1;
                    item["updatedAt"] = DateTimeOffset.UtcNow;
                }

                JsonObject first = items
                    .OfType<JsonObject>()
                    .OrderBy(item => ReadInt(item, "sortOrder") ?? int.MaxValue)
                    .FirstOrDefault() ?? new JsonObject();

                localeResult = ManagementWriteResult<T>.Ok(mapper(first, capturedLocale, 0), shouldPublish: false);
                return localeResult;
            });

            if (!mutation.Success)
            {
                return ManagementWriteResult<PortfolioAdminListResponse<T>>.Failure(mutation.Status, mutation.Errors);
            }
        }

        string? requestedLocale = null;
        IReadOnlyList<T> responseItems = ResolveLocales(requestedLocale)
            .SelectMany(locale => GetItems(LoadRoot(Culture(locale)), sectionName)
                .OfType<JsonObject>()
                .Select((item, index) => mapper(item, locale, index)))
            .ToArray();

        return ManagementWriteResult<PortfolioAdminListResponse<T>>.Ok(
            new PortfolioAdminListResponse<T>(responseItems),
            shouldPublish: false);
    }

    private ManagementWriteResult<object> DeleteItem(Guid id, string sectionName)
    {
        foreach (string locale in ResolveLocales(null))
        {
            ManagementWriteResult<object> result = Mutate<object>(locale, root =>
            {
                JsonArray items = GetItems(root, sectionName);
                JsonObject? item = FindItem(items, id);

                if (item is null)
                {
                    return ManagementWriteResult<object>.NotFound();
                }

                items.Remove(item);
                return ManagementWriteResult<object>.Ok(new object(), shouldPublish: false);
            });

            if (result.Success)
            {
                return result;
            }
        }

        return ManagementWriteResult<object>.NotFound();
    }

    private ManagementWriteResult<AdminExperienceDto> SetExperiencePublication(Guid id, bool isPublished)
    {
        foreach (string locale in ResolveLocales(null))
        {
            ManagementWriteResult<AdminExperienceDto> result = Mutate(locale, root =>
            {
                JsonArray items = GetItems(root, "experience");
                JsonObject? item = FindItem(items, id);

                if (item is null)
                {
                    return ManagementWriteResult<AdminExperienceDto>.NotFound();
                }

                item["isPublished"] = isPublished;
                item["publishedAt"] = isPublished ? DateTimeOffset.UtcNow : null;
                item["updatedAt"] = DateTimeOffset.UtcNow;
                item["version"] = (ReadInt(item, "version") ?? 0) + 1;

                return ManagementWriteResult<AdminExperienceDto>.Ok(
                    MapExperience(item, locale, IndexOf(items, item)),
                    shouldPublish: isPublished);
            });

            if (result.Success)
            {
                return result;
            }
        }

        return ManagementWriteResult<AdminExperienceDto>.NotFound();
    }

    private ManagementWriteResult<AdminProjectDto> SetProjectPublication(Guid id, bool isPublished)
    {
        foreach (string locale in ResolveLocales(null))
        {
            ManagementWriteResult<AdminProjectDto> result = Mutate(locale, root =>
            {
                JsonArray items = GetItems(root, "labs");
                JsonObject? item = FindItem(items, id);

                if (item is null)
                {
                    return ManagementWriteResult<AdminProjectDto>.NotFound();
                }

                item["isPublished"] = isPublished;
                item["publishedAt"] = isPublished ? DateTimeOffset.UtcNow : null;
                item["updatedAt"] = DateTimeOffset.UtcNow;
                item["version"] = (ReadInt(item, "version") ?? 0) + 1;

                return ManagementWriteResult<AdminProjectDto>.Ok(
                    MapProject(item, locale, IndexOf(items, item)),
                    shouldPublish: isPublished);
            });

            if (result.Success)
            {
                return result;
            }
        }

        return ManagementWriteResult<AdminProjectDto>.NotFound();
    }

    private IContent GetPortfolioHome() =>
        contentService.GetRootContent()
            .FirstOrDefault(content => content.ContentType.Alias == PortfolioHomeAlias)
        ?? throw new InvalidOperationException("Could not find the portfolioHome content node.");

    private JsonObject LoadRoot(string culture) => LoadRoot(GetPortfolioHome(), culture);

    private static JsonObject LoadRoot(IContent content, string culture)
    {
        object? value = content.GetValue(PortfolioContentAlias, culture, null, false);
        string json = value?.ToString() ?? "{}";

        return JsonNode.Parse(json) as JsonObject ?? new JsonObject();
    }

    private void SaveRoot(IContent content, string culture, JsonObject root, bool publish)
    {
        content.SetValue(PortfolioContentAlias, root.ToJsonString(new JsonSerializerOptions(JsonSerializerDefaults.Web)), culture);
        contentService.Save(content, SystemUserId);

        if (publish)
        {
            contentService.Publish(content, [culture], SystemUserId);
        }
        else if (content.IsCulturePublished(culture))
        {
            contentService.Publish(content, [culture], SystemUserId);
        }
    }

    private static JsonArray GetItems(JsonObject root, string sectionName)
    {
        if (root[sectionName] is not JsonObject section)
        {
            section = new JsonObject();
            root[sectionName] = section;
        }

        if (section["items"] is not JsonArray items)
        {
            items = new JsonArray();
            section["items"] = items;
        }

        return items;
    }

    private static JsonObject? FindItem(JsonArray items, Guid id) =>
        items.OfType<JsonObject>().FirstOrDefault(item => ReadGuid(item, "id") == id);

    private static bool HasDuplicateSlug(JsonArray items, string slug, Guid? exceptId) =>
        items.OfType<JsonObject>().Any(item =>
            string.Equals(ReadString(item, "slug"), slug, StringComparison.Ordinal) &&
            ReadGuid(item, "id") != exceptId);

    private static int IndexOf(JsonArray items, JsonObject target)
    {
        for (int index = 0; index < items.Count; index++)
        {
            if (ReferenceEquals(items[index], target))
            {
                return index;
            }
        }

        return -1;
    }

    private static AdminExperienceDto MapExperience(JsonObject item, string locale, int index) =>
        new(
            ReadGuid(item, "id") ?? Guid.NewGuid(),
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
            ReadInt(item, "sortOrder") ?? index,
            ReadBoolDefault(item, "isPublished", true),
            ReadDateTime(item, "createdAt") ?? DateTimeOffset.MinValue,
            ReadDateTime(item, "updatedAt") ?? DateTimeOffset.MinValue,
            ReadString(item, "createdBy"),
            ReadString(item, "updatedBy"),
            ReadDateTime(item, "publishedAt"),
            ReadInt(item, "version") ?? 1);

    private static AdminProjectDto MapProject(JsonObject item, string locale, int index) =>
        new(
            ReadGuid(item, "id") ?? Guid.NewGuid(),
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
            ReadInt(item, "sortOrder") ?? index,
            ReadBoolDefault(item, "isPublished", true),
            ReadDateTime(item, "createdAt") ?? DateTimeOffset.MinValue,
            ReadDateTime(item, "updatedAt") ?? DateTimeOffset.MinValue,
            ReadString(item, "createdBy"),
            ReadString(item, "updatedBy"),
            ReadDateTime(item, "publishedAt"),
            ReadInt(item, "version") ?? 1);

    private static JsonObject ExperienceToJson(
        UpsertAdminExperienceRequest request,
        Guid id,
        int version,
        DateTimeOffset createdAt,
        DateTimeOffset? publishedAt)
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;
        IReadOnlyList<string> technologies = PortfolioManagementValidation.NormalizeTags(request.Technologies);
        IReadOnlyList<string> highlights = PortfolioManagementValidation.NormalizeTags(request.Highlights);

        return new JsonObject
        {
            ["id"] = id,
            ["slug"] = request.Slug.Trim(),
            ["locale"] = request.Locale,
            ["company"] = request.Company.Trim(),
            ["role"] = request.Role.Trim(),
            ["location"] = request.Location,
            ["employmentType"] = request.EmploymentType,
            ["startDate"] = request.StartDate?.ToString("O"),
            ["endDate"] = request.EndDate?.ToString("O"),
            ["isCurrent"] = request.IsCurrent,
            ["summary"] = request.Summary.Trim(),
            ["description"] = request.Description.Trim(),
            ["technologies"] = JsonSerializer.SerializeToNode(technologies),
            ["focus"] = JsonSerializer.SerializeToNode(technologies),
            ["highlights"] = JsonSerializer.SerializeToNode(highlights),
            ["impact"] = JsonSerializer.SerializeToNode(highlights),
            ["period"] = FormatPeriod(request.StartDate, request.EndDate, request.IsCurrent),
            ["sortOrder"] = request.SortOrder,
            ["isPublished"] = request.IsPublished,
            ["createdAt"] = createdAt,
            ["updatedAt"] = now,
            ["createdBy"] = "HSApi",
            ["updatedBy"] = "HSApi",
            ["publishedAt"] = request.IsPublished ? publishedAt ?? now : null,
            ["version"] = version,
        };
    }

    private static JsonObject ProjectToJson(
        UpsertAdminProjectRequest request,
        Guid id,
        int version,
        DateTimeOffset createdAt,
        DateTimeOffset? publishedAt)
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;
        IReadOnlyList<string> technologies = PortfolioManagementValidation.NormalizeTags(request.Technologies);

        return new JsonObject
        {
            ["id"] = id,
            ["slug"] = request.Slug.Trim(),
            ["locale"] = request.Locale,
            ["title"] = request.Title.Trim(),
            ["shortDescription"] = request.ShortDescription.Trim(),
            ["description"] = request.Description.Trim(),
            ["technologies"] = JsonSerializer.SerializeToNode(technologies),
            ["repositoryUrl"] = request.RepositoryUrl,
            ["liveUrl"] = request.LiveUrl,
            ["imageUrl"] = request.ImageUrl,
            ["featured"] = request.Featured,
            ["sortOrder"] = request.SortOrder,
            ["isPublished"] = request.IsPublished,
            ["createdAt"] = createdAt,
            ["updatedAt"] = now,
            ["createdBy"] = "HSApi",
            ["updatedBy"] = "HSApi",
            ["publishedAt"] = request.IsPublished ? publishedAt ?? now : null,
            ["version"] = version,
        };
    }

    private static string[] ResolveLocales(string? locale) =>
        locale switch
        {
            "sv" => ["sv"],
            "en" => ["en"],
            null or "" => ["sv", "en"],
            _ => throw new ArgumentOutOfRangeException(nameof(locale), locale, "Unsupported locale."),
        };

    private static string Culture(string locale) =>
        locale switch
        {
            "sv" => "sv-SE",
            "en" => "en-US",
            _ => throw new ArgumentOutOfRangeException(nameof(locale), locale, "Unsupported locale."),
        };

    private static string? ReadString(JsonObject item, string property) =>
        item[property]?.GetValue<string>();

    private static Guid? ReadGuid(JsonObject item, string property) =>
        Guid.TryParse(ReadString(item, property), out Guid id) ? id : null;

    private static int? ReadInt(JsonObject item, string property) =>
        item[property]?.GetValue<int>();

    private static bool ReadBool(JsonObject item, string property) =>
        item[property]?.GetValue<bool>() == true;

    private static bool ReadBoolDefault(JsonObject item, string property, bool defaultValue) =>
        item[property]?.GetValue<bool>() ?? defaultValue;

    private static DateOnly? ReadDate(JsonObject item, string property) =>
        DateOnly.TryParse(ReadString(item, property), out DateOnly date) ? date : null;

    private static DateTimeOffset? ReadDateTime(JsonObject item, string property)
    {
        JsonNode? value = item[property];

        if (value is null)
        {
            return null;
        }

        if (value is JsonValue jsonValue && jsonValue.TryGetValue(out DateTimeOffset date))
        {
            return date;
        }

        return DateTimeOffset.TryParse(value.ToString(), out date) ? date : null;
    }

    private static IReadOnlyList<string> ReadArray(
        JsonObject item,
        string property,
        string? fallbackProperty = null)
    {
        JsonArray? values = item[property] as JsonArray;

        if (values is null && fallbackProperty is not null)
        {
            values = item[fallbackProperty] as JsonArray;
        }

        return values?
            .Select(value => value?.GetValue<string>()?.Trim())
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray() ?? [];
    }

    private static string FormatPeriod(DateOnly? startDate, DateOnly? endDate, bool isCurrent)
    {
        string start = startDate?.ToString("yyyy-MM") ?? "TBD";
        string end = isCurrent ? "Present" : endDate?.ToString("yyyy-MM") ?? "TBD";
        return $"{start} - {end}";
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

public sealed record ManagementWriteResult<T>(
    bool Success,
    ManagementWriteStatus Status,
    T? Value,
    IDictionary<string, string[]>? Errors,
    bool ShouldPublish)
{
    public static ManagementWriteResult<T> Ok(T value, bool shouldPublish) =>
        new(true, ManagementWriteStatus.Ok, value, null, shouldPublish);

    public static ManagementWriteResult<T> Invalid(IDictionary<string, string[]> errors) =>
        new(false, ManagementWriteStatus.Invalid, default, errors, false);

    public static ManagementWriteResult<T> NotFound() =>
        new(false, ManagementWriteStatus.NotFound, default, null, false);

    public static ManagementWriteResult<T> Conflict() =>
        new(false, ManagementWriteStatus.Conflict, default, null, false);

    public static ManagementWriteResult<T> Failure(
        ManagementWriteStatus status,
        IDictionary<string, string[]>? errors = null) =>
        new(false, status, default, errors, false);
}

public enum ManagementWriteStatus
{
    Ok,
    Invalid,
    NotFound,
    Conflict,
}
