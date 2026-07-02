namespace HSApi.Features.Admin.Auth;

public sealed record LoginRequest(string Username, string Password);

public sealed record AdminSessionResponse(bool Authenticated, string? Username);

public sealed record CsrfTokenResponse(string Token);
