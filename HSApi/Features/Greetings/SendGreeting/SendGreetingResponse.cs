namespace HSApi.Features.Greetings.SendGreeting;

public sealed record SendGreetingResponse(
    string Status,
    Guid RequestId,
    int? CooldownSeconds = null,
    int? RetryAfterSeconds = null);
