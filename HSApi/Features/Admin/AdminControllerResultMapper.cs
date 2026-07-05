using System.Net;
using HSApi.Infrastructure.Cms;
using Microsoft.AspNetCore.Mvc;

namespace HSApi.Features.Admin;

internal static class AdminControllerResultMapper
{
    public static ActionResult<T> ToActionResult<T>(
        this ControllerBase controller,
        CmsManagementResult<T> result)
    {
        if (result.Success)
        {
            return controller.Ok(result.Value);
        }

        return result.StatusCode switch
        {
            HttpStatusCode.NotFound => controller.NotFound(),
            HttpStatusCode.Conflict => controller.Conflict(new ProblemDetails
            {
                Title = "Content version conflict",
                Detail = result.Detail ?? "The item was changed elsewhere. Reload and try again.",
                Status = StatusCodes.Status409Conflict,
            }),
            HttpStatusCode.UnprocessableEntity => controller.UnprocessableEntity(
                new ValidationProblemDetails(result.Errors ?? new Dictionary<string, string[]>())
                {
                    Status = StatusCodes.Status422UnprocessableEntity,
                    Title = "Validation failed",
                }),
            HttpStatusCode.BadRequest => controller.BadRequest(
                new ValidationProblemDetails(result.Errors ?? new Dictionary<string, string[]>())
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Validation failed",
                }),
            _ => controller.Problem(
                result.Detail ?? "CMS management request failed.",
                statusCode: StatusCodes.Status502BadGateway),
        };
    }

    public static IActionResult ToFailureResult<T>(
        this ControllerBase controller,
        CmsManagementResult<T> result)
    {
        ActionResult<T> mapped = controller.ToActionResult(result);
        return mapped.Result ?? controller.Problem(statusCode: StatusCodes.Status502BadGateway);
    }
}
