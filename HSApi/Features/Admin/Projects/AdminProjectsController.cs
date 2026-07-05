using HSApi.Common.Admin;
using HSApi.Common.Security;
using HSApi.Features.Admin;
using HSApi.Infrastructure.Cms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HSApi.Features.Admin.Projects;

[ApiController]
[Authorize(Policy = AdminAuthOptions.Policy)]
[Route("api/v1/admin/projects")]
[AutoValidateAntiforgeryToken]
public sealed class AdminProjectsController(CmsManagementClient cmsClient) : ControllerBase
{
    [HttpGet]
    [IgnoreAntiforgeryToken]
    public async Task<ActionResult<PortfolioAdminListResponse<AdminProjectDto>>> GetAll(
        [FromQuery] string? locale,
        CancellationToken cancellationToken)
    {
        CmsManagementResult<IReadOnlyList<AdminProjectDto>> result =
            await cmsClient.GetProjectsAsync(locale, cancellationToken);

        if (!result.Success)
        {
            return StatusCode((int)result.StatusCode, result.Detail);
        }

        return Ok(new PortfolioAdminListResponse<AdminProjectDto>(result.Value));
    }

    [HttpGet("{id:guid}")]
    [IgnoreAntiforgeryToken]
    public async Task<ActionResult<AdminProjectDto>> Get(
        Guid id,
        CancellationToken cancellationToken) =>
        this.ToActionResult(await cmsClient.GetProjectAsync(id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<AdminProjectDto>> Create(
        UpsertAdminProjectRequest request,
        CancellationToken cancellationToken)
    {
        IDictionary<string, string[]> errors =
            PortfolioAdminValidation.ValidateProject(request, requireVersion: false);

        if (errors.Count > 0)
        {
            return UnprocessableEntity(new ValidationProblemDetails(errors));
        }

        CmsManagementResult<AdminProjectDto> result =
            await cmsClient.CreateProjectAsync(request with
            {
                Technologies = PortfolioAdminValidation.NormalizeTags(request.Technologies),
            }, cancellationToken);

        if (!result.Success)
        {
            return this.ToActionResult(result);
        }

        return CreatedAtAction(nameof(Get), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AdminProjectDto>> Update(
        Guid id,
        UpsertAdminProjectRequest request,
        CancellationToken cancellationToken)
    {
        IDictionary<string, string[]> errors =
            PortfolioAdminValidation.ValidateProject(request, requireVersion: true);

        if (errors.Count > 0)
        {
            return UnprocessableEntity(new ValidationProblemDetails(errors));
        }

        return this.ToActionResult(await cmsClient.UpdateProjectAsync(id, request with
        {
            Technologies = PortfolioAdminValidation.NormalizeTags(request.Technologies),
        }, cancellationToken));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        CmsManagementResult<object> result = await cmsClient.DeleteProjectAsync(id, cancellationToken);

        if (result.Success)
        {
            return NoContent();
        }

        return this.ToActionResult(result).Result!;
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<AdminProjectDto>> Publish(
        Guid id,
        CancellationToken cancellationToken) =>
        this.ToActionResult(await cmsClient.PublishProjectAsync(id, cancellationToken));

    [HttpPost("{id:guid}/unpublish")]
    public async Task<ActionResult<AdminProjectDto>> Unpublish(
        Guid id,
        CancellationToken cancellationToken) =>
        this.ToActionResult(await cmsClient.UnpublishProjectAsync(id, cancellationToken));

    [HttpPut("order")]
    public async Task<ActionResult<PortfolioAdminListResponse<AdminProjectDto>>> Reorder(
        PortfolioAdminOrderRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Items.Any(item => item.SortOrder < 0))
        {
            return UnprocessableEntity(new ValidationProblemDetails(
                new Dictionary<string, string[]> { ["sortOrder"] = ["Sort order cannot be negative."] }));
        }

        CmsManagementResult<IReadOnlyList<AdminProjectDto>> result =
            await cmsClient.ReorderProjectsAsync(request, cancellationToken);

        if (!result.Success)
        {
            return StatusCode((int)result.StatusCode, result.Detail);
        }

        return Ok(new PortfolioAdminListResponse<AdminProjectDto>(result.Value));
    }
}
