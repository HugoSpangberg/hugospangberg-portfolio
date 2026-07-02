namespace HSApi.Common.Admin;

public sealed record PublicExperienceDto(
    Guid? Id,
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
    int SortOrder);

public sealed record PublicProjectDto(
    Guid? Id,
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
    int SortOrder);
