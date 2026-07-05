using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace HSApi.Features.Greetings.SendGreeting;

[ApiController]
[Route("api/v1/greetings")]
[EnableRateLimiting("greetings")]
public sealed class SendGreetingController(SendGreetingHandler handler) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<SendGreetingResponse>(StatusCodes.Status202Accepted)]
    [ProducesResponseType<SendGreetingResponse>(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType<SendGreetingResponse>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Send(
        [FromBody] SendGreetingRequest request,
        CancellationToken cancellationToken)
    {
        SendGreetingResult result = await handler.HandleAsync(request, cancellationToken);

        return result.Outcome switch
        {
            GreetingOutcome.Accepted => Accepted(new SendGreetingResponse(
                "accepted",
                result.RequestId,
                CooldownSeconds: result.CooldownSeconds)),
            GreetingOutcome.Cooldown or GreetingOutcome.Duplicate => StatusCode(
                StatusCodes.Status429TooManyRequests,
                new SendGreetingResponse(
                    "cooldown",
                    result.RequestId,
                    RetryAfterSeconds: result.RetryAfterSeconds ?? result.CooldownSeconds)),
            GreetingOutcome.HomeAssistantUnavailable => StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new SendGreetingResponse("unavailable", result.RequestId)),
            _ => BadRequest(new SendGreetingResponse("error", result.RequestId)),
        };
    }
}
