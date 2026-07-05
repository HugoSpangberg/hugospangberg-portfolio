using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using HSApi.Common.Admin;
using HSApi.Common.Security;
using Microsoft.Extensions.Options;

namespace HSApi.Infrastructure.Cms;

public sealed class CmsManagementClient(
    HttpClient httpClient,
    IOptions<AdminAuthOptions> adminOptions)
{
    private readonly AdminAuthOptions _adminOptions = adminOptions.Value;

    public Task<CmsManagementResult<IReadOnlyList<AdminExperienceDto>>> GetExperiencesAsync(
        string? locale,
        CancellationToken cancellationToken) =>
        GetListAsync<AdminExperienceDto>(
            BuildPath("/internal/portfolio-management/experiences", locale),
            cancellationToken);

    public Task<CmsManagementResult<AdminExperienceDto>> GetExperienceAsync(
        Guid id,
        CancellationToken cancellationToken) =>
        SendAsync<AdminExperienceDto>(
            HttpMethod.Get,
            $"/internal/portfolio-management/experiences/{id}",
            null,
            cancellationToken);

    public Task<CmsManagementResult<AdminExperienceDto>> CreateExperienceAsync(
        UpsertAdminExperienceRequest request,
        CancellationToken cancellationToken) =>
        SendAsync<AdminExperienceDto>(
            HttpMethod.Post,
            "/internal/portfolio-management/experiences",
            request,
            cancellationToken);

    public Task<CmsManagementResult<AdminExperienceDto>> UpdateExperienceAsync(
        Guid id,
        UpsertAdminExperienceRequest request,
        CancellationToken cancellationToken) =>
        SendAsync<AdminExperienceDto>(
            HttpMethod.Put,
            $"/internal/portfolio-management/experiences/{id}",
            request,
            cancellationToken);

    public Task<CmsManagementResult<object>> DeleteExperienceAsync(
        Guid id,
        CancellationToken cancellationToken) =>
        SendAsync<object>(
            HttpMethod.Delete,
            $"/internal/portfolio-management/experiences/{id}",
            null,
            cancellationToken);

    public Task<CmsManagementResult<AdminExperienceDto>> PublishExperienceAsync(
        Guid id,
        CancellationToken cancellationToken) =>
        SendAsync<AdminExperienceDto>(
            HttpMethod.Post,
            $"/internal/portfolio-management/experiences/{id}/publish",
            null,
            cancellationToken);

    public Task<CmsManagementResult<AdminExperienceDto>> UnpublishExperienceAsync(
        Guid id,
        CancellationToken cancellationToken) =>
        SendAsync<AdminExperienceDto>(
            HttpMethod.Post,
            $"/internal/portfolio-management/experiences/{id}/unpublish",
            null,
            cancellationToken);

    public Task<CmsManagementResult<IReadOnlyList<AdminExperienceDto>>> ReorderExperiencesAsync(
        PortfolioAdminOrderRequest request,
        CancellationToken cancellationToken) =>
        SendAsync<IReadOnlyList<AdminExperienceDto>>(
            HttpMethod.Put,
            "/internal/portfolio-management/experiences/order",
            request,
            cancellationToken);

    public Task<CmsManagementResult<IReadOnlyList<AdminProjectDto>>> GetProjectsAsync(
        string? locale,
        CancellationToken cancellationToken) =>
        GetListAsync<AdminProjectDto>(
            BuildPath("/internal/portfolio-management/projects", locale),
            cancellationToken);

    public Task<CmsManagementResult<AdminProjectDto>> GetProjectAsync(
        Guid id,
        CancellationToken cancellationToken) =>
        SendAsync<AdminProjectDto>(
            HttpMethod.Get,
            $"/internal/portfolio-management/projects/{id}",
            null,
            cancellationToken);

    public Task<CmsManagementResult<AdminProjectDto>> CreateProjectAsync(
        UpsertAdminProjectRequest request,
        CancellationToken cancellationToken) =>
        SendAsync<AdminProjectDto>(
            HttpMethod.Post,
            "/internal/portfolio-management/projects",
            request,
            cancellationToken);

    public Task<CmsManagementResult<AdminProjectDto>> UpdateProjectAsync(
        Guid id,
        UpsertAdminProjectRequest request,
        CancellationToken cancellationToken) =>
        SendAsync<AdminProjectDto>(
            HttpMethod.Put,
            $"/internal/portfolio-management/projects/{id}",
            request,
            cancellationToken);

    public Task<CmsManagementResult<object>> DeleteProjectAsync(
        Guid id,
        CancellationToken cancellationToken) =>
        SendAsync<object>(
            HttpMethod.Delete,
            $"/internal/portfolio-management/projects/{id}",
            null,
            cancellationToken);

    public Task<CmsManagementResult<AdminProjectDto>> PublishProjectAsync(
        Guid id,
        CancellationToken cancellationToken) =>
        SendAsync<AdminProjectDto>(
            HttpMethod.Post,
            $"/internal/portfolio-management/projects/{id}/publish",
            null,
            cancellationToken);

    public Task<CmsManagementResult<AdminProjectDto>> UnpublishProjectAsync(
        Guid id,
        CancellationToken cancellationToken) =>
        SendAsync<AdminProjectDto>(
            HttpMethod.Post,
            $"/internal/portfolio-management/projects/{id}/unpublish",
            null,
            cancellationToken);

    public Task<CmsManagementResult<IReadOnlyList<AdminProjectDto>>> ReorderProjectsAsync(
        PortfolioAdminOrderRequest request,
        CancellationToken cancellationToken) =>
        SendAsync<IReadOnlyList<AdminProjectDto>>(
            HttpMethod.Put,
            "/internal/portfolio-management/projects/order",
            request,
            cancellationToken);

    private async Task<CmsManagementResult<IReadOnlyList<T>>> GetListAsync<T>(
        string path,
        CancellationToken cancellationToken)
    {
        CmsManagementResult<JsonElement> result = await SendAsync<JsonElement>(
            HttpMethod.Get,
            path,
            null,
            cancellationToken);

        if (!result.Success)
        {
            return CmsManagementResult<IReadOnlyList<T>>.Failure(
                result.StatusCode,
                result.Errors,
                result.Detail);
        }

        IReadOnlyList<T> items = result.Value.TryGetProperty("items", out JsonElement itemsElement)
            ? JsonSerializer.Deserialize<IReadOnlyList<T>>(itemsElement.GetRawText(), JsonOptions()) ?? []
            : [];

        return CmsManagementResult<IReadOnlyList<T>>.Ok(items);
    }

    private async Task<CmsManagementResult<T>> SendAsync<T>(
        HttpMethod method,
        string path,
        object? body,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_adminOptions.CmsManagementSecret))
        {
            return CmsManagementResult<T>.Failure(
                HttpStatusCode.ServiceUnavailable,
                null,
                "CMS management secret is not configured.");
        }

        using HttpRequestMessage request = new(method, path);
        request.Headers.Add("X-Portfolio-Internal-Secret", _adminOptions.CmsManagementSecret);

        if (body is not null)
        {
            request.Content = JsonContent.Create(body, options: JsonOptions());
        }

        using HttpResponseMessage response = await httpClient.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);

        if (response.StatusCode == HttpStatusCode.NoContent)
        {
            return CmsManagementResult<T>.Ok(default!);
        }

        await using Stream stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        JsonDocument document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (response.IsSuccessStatusCode)
        {
            T value = document.Deserialize<T>(JsonOptions())
                ?? throw new JsonException("CMS management response could not be deserialized.");

            return CmsManagementResult<T>.Ok(value);
        }

        IDictionary<string, string[]>? errors = null;
        string? detail = null;

        if (document.RootElement.TryGetProperty("errors", out JsonElement errorsElement))
        {
            errors = JsonSerializer.Deserialize<IDictionary<string, string[]>>(
                errorsElement.GetRawText(),
                JsonOptions());
        }

        if (document.RootElement.TryGetProperty("detail", out JsonElement detailElement))
        {
            detail = detailElement.GetString();
        }

        return CmsManagementResult<T>.Failure(response.StatusCode, errors, detail);
    }

    private static string BuildPath(string path, string? locale)
    {
        if (string.IsNullOrWhiteSpace(locale))
        {
            return path;
        }

        return $"{path}?locale={Uri.EscapeDataString(locale)}";
    }

    private static JsonSerializerOptions JsonOptions() => new(JsonSerializerDefaults.Web);
}

public sealed record CmsManagementResult<T>(
    bool Success,
    HttpStatusCode StatusCode,
    T Value,
    IDictionary<string, string[]>? Errors,
    string? Detail)
{
    public static CmsManagementResult<T> Ok(T value) =>
        new(true, HttpStatusCode.OK, value, null, null);

    public static CmsManagementResult<T> Failure(
        HttpStatusCode statusCode,
        IDictionary<string, string[]>? errors,
        string? detail) =>
        new(false, statusCode, default!, errors, detail);
}
