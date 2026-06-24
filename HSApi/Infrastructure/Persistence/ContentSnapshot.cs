namespace HSApi.Infrastructure.Persistence;

public sealed class ContentSnapshot
{
    public long Id { get; set; }

    public required string Locale { get; set; }

    public required string PayloadJson { get; set; }

    public required string ETag { get; set; }

    public DateTimeOffset FetchedAtUtc { get; set; }

    public bool IsCurrent { get; set; }
}
