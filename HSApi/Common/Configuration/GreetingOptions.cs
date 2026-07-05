using System.ComponentModel.DataAnnotations;

namespace HSApi.Common.Configuration;

public sealed class GreetingOptions
{
    public const string SectionName = "Greetings";

    [Range(1, 3600)]
    public int CooldownSeconds { get; init; } = 120;

    [Range(1, 168)]
    public int RetentionHours { get; init; } = 24;

    public bool DevelopmentBypassTurnstile { get; init; }
}
