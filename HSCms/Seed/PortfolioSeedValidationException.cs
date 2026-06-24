namespace HugoPortfolio.Cms.Seed;

public sealed class PortfolioSeedValidationException : Exception
{
    public PortfolioSeedValidationException(string message)
        : base(message)
    {
    }
}
