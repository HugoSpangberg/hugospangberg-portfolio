using System.Threading.RateLimiting;
using HSApi.Common.Configuration;
using HSApi.Common.Security;
using HSApi.Features.Admin.Auth;
using HSApi.Features.Greetings.SendGreeting;
using HSApi.Features.Portfolio.GetPortfolio;
using HSApi.Infrastructure.Cms;
using HSApi.Infrastructure.HomeAssistant;
using HSApi.Infrastructure.Persistence;
using HSApi.Infrastructure.Turnstile;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.Name = "__Host-HSPortfolioCsrf";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
});
builder.Services.AddHealthChecks()
    .AddDbContextCheck<PortfolioDbContext>("api-db");

builder.Services.AddOptions<AdminAuthOptions>()
    .Bind(builder.Configuration.GetSection(AdminAuthOptions.SectionName))
    .Validate(options =>
        !options.Enabled ||
        (!string.IsNullOrWhiteSpace(options.Username) &&
         (!string.IsNullOrWhiteSpace(options.Password) ||
          !string.IsNullOrWhiteSpace(options.PasswordHash))),
        "AdminAuth requires Username and Password or PasswordHash when enabled.")
    .ValidateOnStart();
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
                .AllowCredentials()
                .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .WithHeaders("Accept", "Content-Type", "If-None-Match", "X-CSRF-TOKEN")
                .WithExposedHeaders("ETag");
        }
    });
});

builder.Services.AddAuthentication(AdminAuthOptions.Scheme)
    .AddCookie(AdminAuthOptions.Scheme, options =>
    {
        AdminAuthOptions adminOptions = builder.Configuration
            .GetSection(AdminAuthOptions.SectionName)
            .Get<AdminAuthOptions>() ?? new AdminAuthOptions();

        options.Cookie.Name = adminOptions.CookieName;
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = adminOptions.RequireSecureCookies
            ? CookieSecurePolicy.Always
            : CookieSecurePolicy.SameAsRequest;
        options.LoginPath = "/api/v1/admin/auth/login";
        options.AccessDeniedPath = "/api/v1/admin/auth/forbidden";
        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            },
            OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            },
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AdminAuthOptions.Policy, policy =>
        policy.RequireAuthenticatedUser().RequireRole(AdminAuthOptions.Policy));
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
    options.AddPolicy("admin-login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(10),
            }));
});

builder.Services.AddScoped<GetPortfolioHandler>();
builder.Services.AddScoped<SendGreetingHandler>();
builder.Services.AddScoped<AdminPasswordVerifier>();

builder.Services.AddHttpClient<UmbracoContentClient>((serviceProvider, client) =>
{
    CmsOptions options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<CmsOptions>>().Value;
    if (!string.IsNullOrWhiteSpace(options.BaseUrl))
    {
        client.BaseAddress = new Uri(options.BaseUrl);
    }

    client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
});

builder.Services.AddHttpClient<CmsManagementClient>((serviceProvider, client) =>
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
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready");

app.Run();

public partial class Program;
