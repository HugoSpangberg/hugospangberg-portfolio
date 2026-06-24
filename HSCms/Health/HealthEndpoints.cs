namespace HugoPortfolio.Cms.Health;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapPortfolioHealthEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/health/live", () => Results.Ok(new
        {
            status = "ok",
            service = "hugo-portfolio-cms",
        }));

        endpoints.MapGet("/health/ready", () => Results.Ok(new
        {
            status = "ok",
            service = "hugo-portfolio-cms",
        }));

        return endpoints;
    }
}
