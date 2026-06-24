namespace HSApi.Features.Greetings.SendGreeting;

public sealed record SendGreetingResult(
    GreetingOutcome Outcome,
    Guid RequestId,
    int? CooldownSeconds = null,
    int? RetryAfterSeconds = null);
