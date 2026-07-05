using HSApi.Common.Admin;
using HSApi.Common.Http;
using HSApi.Features.Portfolio.GetPortfolio;
using Microsoft.AspNetCore.Mvc;

namespace HSApi.Features.Public.Projects;

[ApiController]
[Route("api/v1/projects")]
public sealed class GetProjectsController(GetPortfolioHandler handler) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PortfolioAdminListResponse<PublicProjectDto>>> Get(
        [FromQuery] string locale = "sv",
        CancellationToken cancellationToken = default)
    {
        if (!LocaleMap.TryMapCulture(locale, out _))
        {
            return BadRequest(new ValidationProblemDetails(
                new Dictionary<string, string[]>
                {
                    ["locale"] = ["Supported locales are 'sv' and 'en'."],
                }));
        }

        PortfolioContentDocument document = await handler.HandleAsync(locale, cancellationToken);

        using (document.Content)
        {
            return Ok(new PortfolioAdminListResponse<PublicProjectDto>(
                PortfolioPublicItemMapper.MapProjects(document.Content.RootElement, locale)));
        }
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<PublicProjectDto>> GetBySlug(
        string slug,
        [FromQuery] string locale = "sv",
        CancellationToken cancellationToken = default)
    {
        if (!LocaleMap.TryMapCulture(locale, out _))
        {
            return BadRequest(new ValidationProblemDetails(
                new Dictionary<string, string[]>
                {
                    ["locale"] = ["Supported locales are 'sv' and 'en'."],
                }));
        }

        PortfolioContentDocument document = await handler.HandleAsync(locale, cancellationToken);

        using (document.Content)
        {
            PublicProjectDto? project = PortfolioPublicItemMapper
                .MapProjects(document.Content.RootElement, locale)
                .FirstOrDefault(item => string.Equals(item.Slug, slug, StringComparison.Ordinal));

            return project is null ? NotFound() : Ok(project);
        }
    }
}
