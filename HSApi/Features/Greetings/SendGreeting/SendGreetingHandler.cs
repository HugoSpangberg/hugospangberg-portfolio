using HSApi.Common.Configuration;
using HSApi.Infrastructure.HomeAssistant;
using HSApi.Infrastructure.Persistence;
using HSApi.Infrastructure.Turnstile;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HSApi.Features.Greetings.SendGreeting;

public sealed class SendGreetingHandler(
    PortfolioDbContext dbContext,
    TurnstileClient turnstileClient,
    HomeAssistantClient homeAssistantClient,
    IOptions<GreetingOptions> options,
    ILogger<SendGreetingHandler> logger)
{
    private readonly GreetingOptions _options = options.Value;

    public async Task<SendGreetingResult> HandleAsync(
        SendGreetingRequest request,
        CancellationToken cancellationToken)
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;
        DateTimeOffset expiresAt = now.AddHours(_options.RetentionHours);

        GreetingAttempt? duplicate = await dbContext.GreetingAttempts
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.RequestId == request.RequestId, cancellationToken);

        if (duplicate is not null)
        {
            return new SendGreetingResult(GreetingOutcome.Duplicate, request.RequestId, _options.CooldownSeconds);
        }

        GreetingAttempt? latestAccepted = await dbContext.GreetingAttempts
            .AsNoTracking()
            .Where(item => item.Outcome == GreetingOutcome.Accepted.ToString())
            .OrderByDescending(item => item.CompletedAtUtc ?? item.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (latestAccepted is not null)
        {
            DateTimeOffset cooldownUntil = (latestAccepted.CompletedAtUtc ?? latestAccepted.CreatedAtUtc)
                .AddSeconds(_options.CooldownSeconds);

            if (cooldownUntil > now)
            {
                int retryAfter = Math.Max(1, (int)Math.Ceiling((cooldownUntil - now).TotalSeconds));
                return new SendGreetingResult(GreetingOutcome.Cooldown, request.RequestId, RetryAfterSeconds: retryAfter);
            }
        }

        bool turnstileOk = await turnstileClient.VerifyAsync(request.TurnstileToken, cancellationToken);
        if (!turnstileOk)
        {
            dbContext.GreetingAttempts.Add(CreateAttempt(request.RequestId, now, expiresAt, GreetingOutcome.TurnstileRejected, "turnstile"));
            await dbContext.SaveChangesAsync(cancellationToken);
            return new SendGreetingResult(GreetingOutcome.TurnstileRejected, request.RequestId);
        }

        bool homeAssistantOk = await homeAssistantClient.SendHelloAsync(request.RequestId, cancellationToken);
        GreetingOutcome outcome = homeAssistantOk
            ? GreetingOutcome.Accepted
            : GreetingOutcome.HomeAssistantUnavailable;

        dbContext.GreetingAttempts.Add(CreateAttempt(
            request.RequestId,
            now,
            expiresAt,
            outcome,
            homeAssistantOk ? null : "home-assistant"));
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Greeting request {RequestId} completed with outcome {Outcome}.", request.RequestId, outcome);

        return new SendGreetingResult(
            outcome,
            request.RequestId,
            homeAssistantOk ? _options.CooldownSeconds : null);
    }

    private static GreetingAttempt CreateAttempt(
        Guid requestId,
        DateTimeOffset now,
        DateTimeOffset expiresAt,
        GreetingOutcome outcome,
        string? failureCategory) =>
        new()
        {
            RequestId = requestId,
            CreatedAtUtc = now,
            CompletedAtUtc = now,
            Outcome = outcome.ToString(),
            FailureCategory = failureCategory,
            ExpiresAtUtc = expiresAt,
        };
}
