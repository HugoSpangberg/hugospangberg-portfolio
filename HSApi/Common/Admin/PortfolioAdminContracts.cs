using System.Text.RegularExpressions;

namespace HSApi.Common.Admin;

public sealed record PortfolioAdminListResponse<T>(IReadOnlyList<T> Items);

public sealed record PortfolioAdminOrderRequest(IReadOnlyList<PortfolioAdminOrderItem> Items);

public sealed record PortfolioAdminOrderItem(Guid Id, int SortOrder, int Version);

public sealed record AdminExperienceDto(
    Guid Id,
    string Slug,
    string Locale,
    string Company,
    string Role,
    string? Location,
    string? EmploymentType,
    DateOnly? StartDate,
    DateOnly? EndDate,
    bool IsCurrent,
    string Summary,
    string Description,
    IReadOnlyList<string> Technologies,
    IReadOnlyList<string> Highlights,
    int SortOrder,
    bool IsPublished,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy,
    DateTimeOffset? PublishedAt,
    int Version);

public sealed record UpsertAdminExperienceRequest(
    string Slug,
    string Locale,
    string Company,
    string Role,
    string? Location,
    string? EmploymentType,
    DateOnly? StartDate,
    DateOnly? EndDate,
    bool IsCurrent,
    string Summary,
    string Description,
    IReadOnlyList<string>? Technologies,
    IReadOnlyList<string>? Highlights,
    int SortOrder,
    bool IsPublished,
    int? Version);

public sealed record AdminProjectDto(
    Guid Id,
    string Slug,
    string Locale,
    string Title,
    string ShortDescription,
    string Description,
    IReadOnlyList<string> Technologies,
    string? RepositoryUrl,
    string? LiveUrl,
    string? ImageUrl,
    bool Featured,
    int SortOrder,
    bool IsPublished,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy,
    DateTimeOffset? PublishedAt,
    int Version);

public sealed record UpsertAdminProjectRequest(
    string Slug,
    string Locale,
    string Title,
    string ShortDescription,
    string Description,
    IReadOnlyList<string>? Technologies,
    string? RepositoryUrl,
    string? LiveUrl,
    string? ImageUrl,
    bool Featured,
    int SortOrder,
    bool IsPublished,
    int? Version);

public static partial class PortfolioAdminValidation
{
    public static IDictionary<string, string[]> ValidateExperience(
        UpsertAdminExperienceRequest request,
        bool requireVersion)
    {
        Dictionary<string, string[]> errors = new(StringComparer.Ordinal);

        Require(errors, nameof(request.Company), request.Company, "Company is required.");
        Require(errors, nameof(request.Role), request.Role, "Role is required.");
        Require(errors, nameof(request.Slug), request.Slug, "Slug is required.");
        Require(errors, nameof(request.Locale), request.Locale, "Locale is required.");
        Require(errors, nameof(request.Summary), request.Summary, "Summary is required.");
        Require(errors, nameof(request.Description), request.Description, "Description is required.");
        ValidateCommon(errors, request.Slug, request.Locale, request.SortOrder, request.Version, requireVersion);

        if (request.StartDate is not null &&
            request.EndDate is not null &&
            request.StartDate > request.EndDate)
        {
            errors[nameof(request.StartDate)] = ["Start date cannot be after end date."];
        }

        if (request.IsCurrent && request.EndDate is not null)
        {
            errors[nameof(request.EndDate)] = ["Current positions cannot have an end date."];
        }

        return errors;
    }

    public static IDictionary<string, string[]> ValidateProject(
        UpsertAdminProjectRequest request,
        bool requireVersion)
    {
        Dictionary<string, string[]> errors = new(StringComparer.Ordinal);

        Require(errors, nameof(request.Title), request.Title, "Title is required.");
        Require(errors, nameof(request.ShortDescription), request.ShortDescription, "Short description is required.");
        Require(errors, nameof(request.Description), request.Description, "Description is required.");
        Require(errors, nameof(request.Slug), request.Slug, "Slug is required.");
        Require(errors, nameof(request.Locale), request.Locale, "Locale is required.");
        ValidateCommon(errors, request.Slug, request.Locale, request.SortOrder, request.Version, requireVersion);
        ValidateUrl(errors, nameof(request.RepositoryUrl), request.RepositoryUrl);
        ValidateUrl(errors, nameof(request.LiveUrl), request.LiveUrl);
        ValidateUrl(errors, nameof(request.ImageUrl), request.ImageUrl);

        return errors;
    }

    public static IReadOnlyList<string> NormalizeTags(IReadOnlyList<string>? values) =>
        values?
            .Select(value => value.Trim())
            .Where(value => value.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray() ?? [];

    private static void ValidateCommon(
        Dictionary<string, string[]> errors,
        string slug,
        string locale,
        int sortOrder,
        int? version,
        bool requireVersion)
    {
        if (!string.IsNullOrWhiteSpace(slug) && !SlugRegex().IsMatch(slug))
        {
            errors[nameof(slug)] = ["Slug may contain lowercase letters, numbers and hyphens only."];
        }

        if (locale is not "sv" and not "en")
        {
            errors[nameof(locale)] = ["Supported locales are 'sv' and 'en'."];
        }

        if (sortOrder < 0)
        {
            errors[nameof(sortOrder)] = ["Sort order cannot be negative."];
        }

        if (requireVersion && version is null)
        {
            errors[nameof(version)] = ["Version is required for updates."];
        }
    }

    private static void ValidateUrl(
        Dictionary<string, string[]> errors,
        string field,
        string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return;
        }

        if (!Uri.TryCreate(value, UriKind.Absolute, out Uri? uri) ||
            uri.Scheme is not ("http" or "https"))
        {
            errors[field] = ["URL must be an absolute HTTP or HTTPS URL."];
        }
    }

    private static void Require(
        Dictionary<string, string[]> errors,
        string field,
        string? value,
        string message)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors[field] = [message];
        }
    }

    [GeneratedRegex("^[a-z0-9]+(?:-[a-z0-9]+)*$", RegexOptions.CultureInvariant)]
    private static partial Regex SlugRegex();
}
