namespace HSApi.Features.Greetings.SendGreeting;

public enum GreetingOutcome
{
    Accepted,
    Cooldown,
    Duplicate,
    TurnstileRejected,
    HomeAssistantUnavailable,
}
