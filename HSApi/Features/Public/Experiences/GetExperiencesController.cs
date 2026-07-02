using HSApi.Common.Admin;
using HSApi.Common.Http;
using HSApi.Features.Portfolio.GetPortfolio;
using Microsoft.AspNetCore.Mvc;

namespace HSApi.Features.Public.Experiences;

[ApiController]
[Route("api/v1/experiences")]
public sealed class GetExperiencesController(GetPortfolioHandler handler) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PortfolioAdminListResponse<PublicExperienceDto>>> Get(
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
            return Ok(new PortfolioAdminListResponse<PublicExperienceDto>(
                PortfolioPublicItemMapper.MapExperiences(document.Content.RootElement, locale)));
        }
    }
}
