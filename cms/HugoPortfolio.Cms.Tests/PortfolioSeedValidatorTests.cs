using System.Text;
using HugoPortfolio.Cms.Seed;

namespace HugoPortfolio.Cms.Tests;

public sealed class PortfolioSeedValidatorTests
{
    [Fact]
    public void ValidateAcceptsCurrentSharedSeed()
    {
        string root = FindRepositoryRoot();
        string seedPath = Path.Combine(root, "shared-content", "portfolio.seed.json");

        using FileStream stream = File.OpenRead(seedPath);

        PortfolioSeedValidator.Validate(stream);
    }

    [Fact]
    public void ValidateRejectsMissingLocale()
    {
        using MemoryStream stream = new(Encoding.UTF8.GetBytes(
            """
            {
              "sv": {
                "seo": { "title": "Title", "description": "Description" },
                "hero": { "title": "Hero" },
                "sayHi": {
                  "buttonLabel": "Klicka på mig",
                  "successDialog": { "privacy": "Privacy" }
                }
              }
            }
            """));

        Assert.Throws<PortfolioSeedValidationException>(() =>
            PortfolioSeedValidator.Validate(stream));
    }

    private static string FindRepositoryRoot()
    {
        DirectoryInfo? directory = new(AppContext.BaseDirectory);

        while (directory is not null)
        {
            if (Directory.Exists(Path.Combine(directory.FullName, ".git")))
            {
                return directory.FullName;
            }

            directory = directory.Parent;
        }

        throw new DirectoryNotFoundException("Could not locate repository root.");
    }
}
