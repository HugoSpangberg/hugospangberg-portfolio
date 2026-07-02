using System.Security.Claims;
using HSApi.Common.Security;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace HSApi.Features.Admin.Auth;

[ApiController]
[Route("api/v1/admin/auth")]
[AutoValidateAntiforgeryToken]
public sealed class AdminAuthController(
    AdminPasswordVerifier passwordVerifier,
    IAntiforgery antiforgery) : ControllerBase
{
    [HttpGet("csrf")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType<CsrfTokenResponse>(StatusCodes.Status200OK)]
    public ActionResult<CsrfTokenResponse> Csrf()
    {
        AntiforgeryTokenSet tokens = antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new CsrfTokenResponse(tokens.RequestToken ?? string.Empty));
    }

    [HttpGet("session")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType<AdminSessionResponse>(StatusCodes.Status200OK)]
    public ActionResult<AdminSessionResponse> Session()
    {
        return Ok(new AdminSessionResponse(
            User.Identity?.IsAuthenticated == true,
            User.Identity?.Name));
    }

    [HttpPost("login")]
    [EnableRateLimiting("admin-login")]
    [ProducesResponseType<AdminSessionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AdminSessionResponse>> Login(
        LoginRequest request)
    {
        if (!passwordVerifier.Verify(request.Username, request.Password))
        {
            return Unauthorized();
        }

        Claim[] claims =
        [
            new(ClaimTypes.Name, request.Username),
            new(ClaimTypes.Role, AdminAuthOptions.Policy),
        ];

        ClaimsIdentity identity = new(claims, AdminAuthOptions.Scheme);
        ClaimsPrincipal principal = new(identity);

        await HttpContext.SignInAsync(
            AdminAuthOptions.Scheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = false,
                IssuedUtc = DateTimeOffset.UtcNow,
            });

        return Ok(new AdminSessionResponse(true, request.Username));
    }

    [Authorize(Policy = AdminAuthOptions.Policy)]
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(AdminAuthOptions.Scheme);
        return NoContent();
    }
}
