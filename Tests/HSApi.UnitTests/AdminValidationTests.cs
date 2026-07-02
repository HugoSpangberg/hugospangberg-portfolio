using HSApi.Common.Admin;
using HSApi.Features.Portfolio.GetPortfolio;
using System.Text.Json;

namespace HSApi.UnitTests;

public sealed class AdminValidationTests
{
    [Fact]
    public void ExperienceValidationRejectsStaleUpdateWithoutVersion()
    {
        UpsertAdminExperienceRequest request = new(
            "valid-slug",
            "sv",
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
            PortfolioAdminValidation.ValidateExperience(request, requireVersion: true);

        Assert.Contains("version", errors.Keys);
    }

    [Fact]
    public void ProjectValidationRejectsInvalidUrls()
    {
        UpsertAdminProjectRequest request = new(
            "valid-slug",
            "en",
            "Project",
            "Short",
            "Description",
            [],
            "javascript:alert(1)",
            null,
            null,
            false,
            0,
            false,
            null);

        IDictionary<string, string[]> errors =
            PortfolioAdminValidation.ValidateProject(request, requireVersion: false);

        Assert.Contains(nameof(request.RepositoryUrl), errors.Keys);
    }

    [Fact]
    public void PublicMapperFiltersUnpublishedProjects()
    {
        using JsonDocument document = JsonDocument.Parse(
            """
            {
              "labs": {
                "items": [
                  { "title": "Published", "description": "Visible", "technologies": [], "isPublished": true },
                  { "title": "Draft", "description": "Hidden", "technologies": [], "isPublished": false }
                ]
              }
            }
            """);

        IReadOnlyList<PublicProjectDto> projects =
            PortfolioPublicItemMapper.MapProjects(document.RootElement, "sv");

        Assert.Single(projects);
        Assert.Equal("Published", projects[0].Title);
    }
}
