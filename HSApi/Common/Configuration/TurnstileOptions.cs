using System.ComponentModel.DataAnnotations;

namespace HSApi.Common.Configuration;

public sealed class TurnstileOptions
{
    public const string SectionName = "Turnstile";

    public bool Enabled { get; init; }

    public string? SecretKey { get; init; }

    [Url]
    public string VerifyUrl { get; init; } = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    [Range(1, 30)]
    public int TimeoutSeconds { get; init; } = 5;
}
