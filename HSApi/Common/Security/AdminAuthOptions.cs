using System.ComponentModel.DataAnnotations;

namespace HSApi.Common.Security;

public sealed class AdminAuthOptions
{
    public const string SectionName = "AdminAuth";
    public const string Scheme = "PortfolioAdminCookie";
    public const string Policy = "PortfolioAdmin";

    public bool Enabled { get; init; } = true;

    [Required]
    public string? Username { get; init; }

    public string? Password { get; init; }

    public string? PasswordHash { get; init; }

    public string CookieName { get; init; } = "__Host-HSPortfolioAdmin";

    public bool RequireSecureCookies { get; init; } = true;

    public string? CmsManagementSecret { get; init; }
}
