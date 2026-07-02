using HugoPortfolio.Cms.Features.PortfolioManagement;

namespace HugoPortfolio.Cms.Tests;

public sealed class PortfolioManagementValidationTests
{
    [Fact]
    public void ExperienceValidationRejectsInvalidLocale()
    {
        UpsertAdminExperienceRequest request = new(
            "valid-slug",
            "da",
            "Company",
            "Role",
            null,
            null,
            null,
            null,
            false,
            "Summary",
            "Description",
            [],
            [],
            0,
            false,
            null);

        IDictionary<string, string[]> errors =
            PortfolioManagementValidation.ValidateExperience(request, requireVersion: false);

        Assert.Contains("locale", errors.Keys);
    }

    [Fact]
    public void TagsAreNormalizedCaseInsensitively()
    {
        IReadOnlyList<string> tags = PortfolioManagementValidation.NormalizeTags(
            [" .NET ", ".net", "React", ""]);

        Assert.Equal([".NET", "React"], tags);
    }
}
