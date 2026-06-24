namespace HSApi.Infrastructure.Persistence;

public sealed class GreetingAttempt
{
    public long Id { get; set; }

    public required Guid RequestId { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset? CompletedAtUtc { get; set; }

    public required string Outcome { get; set; }

    public string? FailureCategory { get; set; }

    public DateTimeOffset ExpiresAtUtc { get; set; }
}
