using HSApi.Common.Admin;
using HSApi.Common.Security;
using HSApi.Features.Admin;
using HSApi.Infrastructure.Cms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HSApi.Features.Admin.Experiences;

[ApiController]
[Authorize(Policy = AdminAuthOptions.Policy)]
[Route("api/v1/admin/experiences")]
[AutoValidateAntiforgeryToken]
public sealed class AdminExperiencesController(CmsManagementClient cmsClient) : ControllerBase
{
    [HttpGet]
    [IgnoreAntiforgeryToken]
    public async Task<ActionResult<PortfolioAdminListResponse<AdminExperienceDto>>> GetAll(
        [FromQuery] string? locale,
        CancellationToken cancellationToken)
    {
        CmsManagementResult<IReadOnlyList<AdminExperienceDto>> result =
            await cmsClient.GetExperiencesAsync(locale, cancellationToken);

        if (!result.Success)
        {
            return StatusCode((int)result.StatusCode, result.Detail);
        }

        return Ok(new PortfolioAdminListResponse<AdminExperienceDto>(result.Value));
    }

    [HttpGet("{id:guid}")]
    [IgnoreAntiforgeryToken]
    public async Task<ActionResult<AdminExperienceDto>> Get(
        Guid id,
        CancellationToken cancellationToken) =>
        this.ToActionResult(await cmsClient.GetExperienceAsync(id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<AdminExperienceDto>> Create(
        UpsertAdminExperienceRequest request,
        CancellationToken cancellationToken)
    {
        IDictionary<string, string[]> errors =
            PortfolioAdminValidation.ValidateExperience(request, requireVersion: false);

        if (errors.Count > 0)
        {
            return UnprocessableEntity(new ValidationProblemDetails(errors));
        }

        CmsManagementResult<AdminExperienceDto> result =
            await cmsClient.CreateExperienceAsync(request with
            {
                Technologies = PortfolioAdminValidation.NormalizeTags(request.Technologies),
                Highlights = PortfolioAdminValidation.NormalizeTags(request.Highlights),
            }, cancellationToken);

        if (!result.Success)
        {
            return this.ToActionResult(result);
        }

        return CreatedAtAction(nameof(Get), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AdminExperienceDto>> Update(
        Guid id,
        UpsertAdminExperienceRequest request,
        CancellationToken cancellationToken)
    {
        IDictionary<string, string[]> errors =
            PortfolioAdminValidation.ValidateExperience(request, requireVersion: true);

        if (errors.Count > 0)
        {
            return UnprocessableEntity(new ValidationProblemDetails(errors));
        }

        return this.ToActionResult(await cmsClient.UpdateExperienceAsync(id, request with
        {
            Technologies = PortfolioAdminValidation.NormalizeTags(request.Technologies),
            Highlights = PortfolioAdminValidation.NormalizeTags(request.Highlights),
        }, cancellationToken));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        CmsManagementResult<object> result = await cmsClient.DeleteExperienceAsync(id, cancellationToken);

        if (result.Success)
        {
            return NoContent();
        }

        return this.ToActionResult(result).Result!;
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<AdminExperienceDto>> Publish(
        Guid id,
        CancellationToken cancellationToken) =>
        this.ToActionResult(await cmsClient.PublishExperienceAsync(id, cancellationToken));

    [HttpPost("{id:guid}/unpublish")]
    public async Task<ActionResult<AdminExperienceDto>> Unpublish(
        Guid id,
        CancellationToken cancellationToken) =>
        this.ToActionResult(await cmsClient.UnpublishExperienceAsync(id, cancellationToken));

    [HttpPut("order")]
    public async Task<ActionResult<PortfolioAdminListResponse<AdminExperienceDto>>> Reorder(
        PortfolioAdminOrderRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Items.Any(item => item.SortOrder < 0))
        {
            return UnprocessableEntity(new ValidationProblemDetails(
                new Dictionary<string, string[]> { ["sortOrder"] = ["Sort order cannot be negative."] }));
        }

        CmsManagementResult<IReadOnlyList<AdminExperienceDto>> result =
            await cmsClient.ReorderExperiencesAsync(request, cancellationToken);

        if (!result.Success)
        {
            return StatusCode((int)result.StatusCode, result.Detail);
        }

        return Ok(new PortfolioAdminListResponse<AdminExperienceDto>(result.Value));
    }
}
