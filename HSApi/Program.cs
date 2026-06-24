using System.Threading.RateLimiting;
using HSApi.Common.Configuration;
using HSApi.Features.Greetings.SendGreeting;
using HSApi.Features.Portfolio.GetPortfolio;
using HSApi.Infrastructure.Cms;
using HSApi.Infrastructure.HomeAssistant;
using HSApi.Infrastructure.Persistence;
using HSApi.Infrastructure.Turnstile;
using Microsoft.EntityFrameworkCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<PortfolioDbContext>("api-db");

builder.Services.AddOptions<CmsOptions>()
    .Bind(builder.Configuration.GetSection(CmsOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddOptions<GreetingOptions>()
    .Bind(builder.Configuration.GetSection(GreetingOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddOptions<HomeAssistantOptions>()
    .Bind(builder.Configuration.GetSection(HomeAssistantOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddOptions<TurnstileOptions>()
    .Bind(builder.Configuration.GetSection(TurnstileOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

string? apiConnectionString = builder.Configuration.GetConnectionString("HSPortfolioApi");
builder.Services.AddDbContext<PortfolioDbContext>(options =>
{
    if (string.IsNullOrWhiteSpace(apiConnectionString))
    {
        options.UseInMemoryDatabase("HSPortfolioApi");
    }
    else
    {
        options.UseSqlServer(apiConnectionString);
    }
});

builder.Services.AddCors(options =>
{
    string[] origins = builder.Configuration
        .GetSection("Cors:FrontendOrigins")
        .Get<string[]>() ?? [];

    options.AddPolicy("Client", policy =>
    {
        if (origins.Length > 0)
        {
            policy.WithOrigins(origins)
                .WithMethods("GET", "POST", "OPTIONS")
                .WithHeaders("Accept", "Content-Type", "If-None-Match")
                .WithExposedHeaders("ETag");
        }
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("greetings", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(5),
            }));
});

builder.Services.AddScoped<GetPortfolioHandler>();
builder.Services.AddScoped<SendGreetingHandler>();

builder.Services.AddHttpClient<UmbracoContentClient>((serviceProvider, client) =>
{
    CmsOptions options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<CmsOptions>>().Value;
    if (!string.IsNullOrWhiteSpace(options.BaseUrl))
    {
        client.BaseAddress = new Uri(options.BaseUrl);
    }

    client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
});

builder.Services.AddHttpClient<TurnstileClient>((serviceProvider, client) =>
{
    TurnstileOptions options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<TurnstileOptions>>().Value;
    client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
});

builder.Services.AddHttpClient<HomeAssistantClient>((serviceProvider, client) =>
{
    HomeAssistantOptions options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<HomeAssistantOptions>>().Value;
    client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
});

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors("Client");
app.UseRateLimiter();

app.MapControllers();
app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready");

app.Run();

public partial class Program;
