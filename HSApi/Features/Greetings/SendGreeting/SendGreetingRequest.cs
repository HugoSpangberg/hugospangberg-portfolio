using System.ComponentModel.DataAnnotations;

namespace HSApi.Features.Greetings.SendGreeting;

public sealed record SendGreetingRequest
{
    [Required]
    [RegularExpression("^(sv|en)$")]
    public required string Locale { get; init; }

    [Required]
    public required Guid RequestId { get; init; }

    [Required]
    [StringLength(4096, MinimumLength = 1)]
    public required string TurnstileToken { get; init; }
}
