
using HugoPortfolio.Cms.Configuration;
using HugoPortfolio.Cms.Health;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

PortfolioOptions portfolioOptions = builder.Configuration
    .GetSection(PortfolioOptions.SectionName)
    .Get<PortfolioOptions>() ?? new PortfolioOptions();

builder.Services.AddCors(options =>
{
    options.AddPolicy(PortfolioOptions.CorsPolicyName, policy =>
    {
        if (portfolioOptions.FrontendOrigins.Length > 0)
        {
            policy
                .WithOrigins(portfolioOptions.FrontendOrigins)
                .WithMethods("GET", "HEAD", "OPTIONS")
                .WithHeaders("Accept", "Accept-Language", "Content-Type");
        }
    });
});

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .Build();

WebApplication app = builder.Build();


await app.BootUmbracoAsync();

app.UseHttpsRedirection();
app.UseCors(PortfolioOptions.CorsPolicyName);

app.MapPortfolioHealthEndpoints();

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
