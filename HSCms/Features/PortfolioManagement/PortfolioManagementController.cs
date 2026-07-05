using HugoPortfolio.Cms.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HugoPortfolio.Cms.Features.PortfolioManagement;

[ApiController]
[Route("internal/portfolio-management")]
public sealed class PortfolioManagementController(
    PortfolioContentManagementService service,
    IOptions<PortfolioOptions> options) : ControllerBase
{
    private readonly PortfolioOptions _options = options.Value;

    [HttpGet("experiences")]
    public ActionResult<PortfolioAdminListResponse<AdminExperienceDto>> GetExperiences(
        [FromQuery] string? locale)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return Ok(service.GetExperiences(locale));
    }

    [HttpGet("experiences/{id:guid}")]
    public ActionResult<AdminExperienceDto> GetExperience(Guid id)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        AdminExperienceDto? item = service.GetExperience(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("experiences")]
    public ActionResult<AdminExperienceDto> CreateExperience(UpsertAdminExperienceRequest request)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        ManagementWriteResult<AdminExperienceDto> result = service.CreateExperience(request);
        return ToActionResult(result);
    }

    [HttpPut("experiences/{id:guid}")]
    public ActionResult<AdminExperienceDto> UpdateExperience(
        Guid id,
        UpsertAdminExperienceRequest request)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return ToActionResult(service.UpdateExperience(id, request));
    }

    [HttpDelete("experiences/{id:guid}")]
    public IActionResult DeleteExperience(Guid id)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        ManagementWriteResult<object> result = service.DeleteExperience(id);
        return result.Status switch
        {
            ManagementWriteStatus.Ok => NoContent(),
            ManagementWriteStatus.NotFound => NotFound(),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError),
        };
    }

    [HttpPost("experiences/{id:guid}/publish")]
    public ActionResult<AdminExperienceDto> PublishExperience(Guid id)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return ToActionResult(service.PublishExperience(id));
    }

    [HttpPost("experiences/{id:guid}/unpublish")]
    public ActionResult<AdminExperienceDto> UnpublishExperience(Guid id)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return ToActionResult(service.UnpublishExperience(id));
    }

    [HttpPut("experiences/order")]
    public ActionResult<PortfolioAdminListResponse<AdminExperienceDto>> ReorderExperiences(
        PortfolioAdminOrderRequest request)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return ToActionResult(service.ReorderExperiences(request));
    }

    [HttpGet("projects")]
    public ActionResult<PortfolioAdminListResponse<AdminProjectDto>> GetProjects(
        [FromQuery] string? locale)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return Ok(service.GetProjects(locale));
    }

    [HttpGet("projects/{id:guid}")]
    public ActionResult<AdminProjectDto> GetProject(Guid id)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        AdminProjectDto? item = service.GetProject(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("projects")]
    public ActionResult<AdminProjectDto> CreateProject(UpsertAdminProjectRequest request)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return ToActionResult(service.CreateProject(request));
    }

    [HttpPut("projects/{id:guid}")]
    public ActionResult<AdminProjectDto> UpdateProject(
        Guid id,
        UpsertAdminProjectRequest request)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return ToActionResult(service.UpdateProject(id, request));
    }

    [HttpDelete("projects/{id:guid}")]
    public IActionResult DeleteProject(Guid id)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        ManagementWriteResult<object> result = service.DeleteProject(id);
        return result.Status switch
        {
            ManagementWriteStatus.Ok => NoContent(),
            ManagementWriteStatus.NotFound => NotFound(),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError),
        };
    }

    [HttpPost("projects/{id:guid}/publish")]
    public ActionResult<AdminProjectDto> PublishProject(Guid id)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return ToActionResult(service.PublishProject(id));
    }

    [HttpPost("projects/{id:guid}/unpublish")]
    public ActionResult<AdminProjectDto> UnpublishProject(Guid id)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return ToActionResult(service.UnpublishProject(id));
    }

    [HttpPut("projects/order")]
    public ActionResult<PortfolioAdminListResponse<AdminProjectDto>> ReorderProjects(
        PortfolioAdminOrderRequest request)
    {
        if (!IsAuthorized())
        {
            return Unauthorized();
        }

        return ToActionResult(service.ReorderProjects(request));
    }

    private ActionResult<T> ToActionResult<T>(ManagementWriteResult<T> result)
    {
        if (result.Success)
        {
            return Ok(result.Value);
        }

        return result.Status switch
        {
            ManagementWriteStatus.Invalid => UnprocessableEntity(
                new ValidationProblemDetails(result.Errors ?? new Dictionary<string, string[]>())
                {
                    Status = StatusCodes.Status422UnprocessableEntity,
                }),
            ManagementWriteStatus.NotFound => NotFound(),
            ManagementWriteStatus.Conflict => Conflict(new ProblemDetails
            {
                Title = "Content version conflict",
                Detail = "The item was changed elsewhere. Reload and try again.",
                Status = StatusCodes.Status409Conflict,
            }),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError),
        };
    }

    private bool IsAuthorized()
    {
        if (string.IsNullOrWhiteSpace(_options.InternalManagementSecret))
        {
            return false;
        }

        return Request.Headers.TryGetValue("X-Portfolio-Internal-Secret", out var value) &&
            string.Equals(value.ToString(), _options.InternalManagementSecret, StringComparison.Ordinal);
    }
}
