using HSApi.Common.Configuration;
using HSApi.Features.Greetings.SendGreeting;
using HSApi.Infrastructure.HomeAssistant;
using HSApi.Infrastructure.Persistence;
using HSApi.Infrastructure.Turnstile;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace HSApi.UnitTests;

public sealed class SendGreetingHandlerTests
{
    [Fact]
    public async Task HandleAsync_returns_cooldown_after_successful_greeting()
    {
        await using PortfolioDbContext dbContext = CreateDbContext();
        SendGreetingHandler handler = CreateHandler(dbContext);

        SendGreetingRequest first = new()
        {
            Locale = "sv",
            RequestId = Guid.NewGuid(),
            TurnstileToken = "test-token",
        };

        SendGreetingRequest second = new()
        {
            Locale = "sv",
            RequestId = Guid.NewGuid(),
            TurnstileToken = "test-token",
        };

        SendGreetingResult accepted = await handler.HandleAsync(first, CancellationToken.None);
        SendGreetingResult cooldown = await handler.HandleAsync(second, CancellationToken.None);

        Assert.Equal(GreetingOutcome.Accepted, accepted.Outcome);
        Assert.Equal(GreetingOutcome.Cooldown, cooldown.Outcome);
        Assert.True(cooldown.RetryAfterSeconds > 0);
    }

    [Fact]
    public async Task HandleAsync_treats_duplicate_request_id_as_cooldown()
    {
        await using PortfolioDbContext dbContext = CreateDbContext();
        SendGreetingHandler handler = CreateHandler(dbContext);
        Guid requestId = Guid.NewGuid();
        SendGreetingRequest request = new()
        {
            Locale = "en",
            RequestId = requestId,
            TurnstileToken = "test-token",
        };

        await handler.HandleAsync(request, CancellationToken.None);
        SendGreetingResult duplicate = await handler.HandleAsync(request, CancellationToken.None);

        Assert.Equal(GreetingOutcome.Duplicate, duplicate.Outcome);
    }

    private static PortfolioDbContext CreateDbContext()
    {
        DbContextOptions<PortfolioDbContext> options = new DbContextOptionsBuilder<PortfolioDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        return new PortfolioDbContext(options);
    }

    private static SendGreetingHandler CreateHandler(PortfolioDbContext dbContext)
    {
        TurnstileClient turnstileClient = new(
            new HttpClient(),
            Options.Create(new TurnstileOptions { Enabled = false }),
            new FakeHostEnvironment(),
            NullLogger<TurnstileClient>.Instance);
        HomeAssistantClient homeAssistantClient = new(
            new HttpClient(),
            Options.Create(new HomeAssistantOptions { Enabled = false }),
            NullLogger<HomeAssistantClient>.Instance);

        return new SendGreetingHandler(
            dbContext,
            turnstileClient,
            homeAssistantClient,
            Options.Create(new GreetingOptions { CooldownSeconds = 120, RetentionHours = 24 }),
            NullLogger<SendGreetingHandler>.Instance);
    }

    private sealed class FakeHostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Development;

        public string ApplicationName { get; set; } = "HSApi.UnitTests";

        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;

        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } =
            new Microsoft.Extensions.FileProviders.NullFileProvider();
    }
}
