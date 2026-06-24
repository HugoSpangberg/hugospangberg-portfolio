using HSApi.Common.Http;
using Microsoft.AspNetCore.Mvc;

namespace HSApi.Features.Portfolio.GetPortfolio;

[ApiController]
[Route("api/v1/portfolio")]
public sealed class GetPortfolioController(GetPortfolioHandler handler) : ControllerBase
{
    [HttpGet("{locale}")]
    [ProducesResponseType<GetPortfolioResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status304NotModified)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Get(
        [FromRoute] string locale,
        CancellationToken cancellationToken)
    {
        if (!LocaleMap.TryMapCulture(locale, out _))
        {
            return BadRequest(
                new ValidationProblemDetails(
                    new Dictionary<string, string[]>
                {
                    ["locale"] = ["Supported locales are 'sv' and 'en'."],
                    }));
        }

        PortfolioContentDocument document = await handler.HandleAsync(locale, cancellationToken);

        Response.Headers.ETag = document.ETag;

        if (Request.Headers.IfNoneMatch.Contains(document.ETag))
        {
            document.Content.Dispose();
            return StatusCode(StatusCodes.Status304NotModified);
        }

        using (document.Content)
        {
            return Ok(new GetPortfolioResponse(
                document.Locale,
                document.Source,
                document.GeneratedAtUtc,
                document.Content.RootElement.Clone()));
        }
    }
}
