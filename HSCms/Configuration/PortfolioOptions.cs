namespace HugoPortfolio.Cms.Configuration;

public sealed class PortfolioOptions
{
    public const string SectionName = "Portfolio";
    public const string CorsPolicyName = "PortfolioFrontend";

    public string[] FrontendOrigins { get; init; } = [];

    public SeedOptions Seed { get; init; } = new();

    public string ContentRootRoute { get; init; } = "/";

    public int CacheSeconds { get; init; } = 300;

    public string? InternalManagementSecret { get; init; }
}

public sealed class SeedOptions
{
    public bool Enabled { get; init; }

    public bool Force { get; init; }

    public string Path { get; init; } = "../../shared-content/portfolio.seed.json";
}
