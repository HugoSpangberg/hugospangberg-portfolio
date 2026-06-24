using System.ComponentModel.DataAnnotations;

namespace HSApi.Common.Configuration;

public sealed class CmsOptions
{
    public const string SectionName = "Cms";

    public bool Enabled { get; init; }

    [Url]
    public string? BaseUrl { get; init; }

    [Required]
    public string ContentRoute { get; init; } = "/portfolio";

    [Range(1, 30)]
    public int TimeoutSeconds { get; init; } = 5;
}
