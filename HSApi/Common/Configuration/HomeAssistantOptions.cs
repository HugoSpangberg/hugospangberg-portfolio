using System.ComponentModel.DataAnnotations;

namespace HSApi.Common.Configuration;

public sealed class HomeAssistantOptions
{
    public const string SectionName = "HomeAssistant";

    public bool Enabled { get; init; }

    [Url]
    public string? WebhookUrl { get; init; }

    public string? AccessClientId { get; init; }

    public string? AccessClientSecret { get; init; }

    [Range(1, 30)]
    public int TimeoutSeconds { get; init; } = 5;
}
