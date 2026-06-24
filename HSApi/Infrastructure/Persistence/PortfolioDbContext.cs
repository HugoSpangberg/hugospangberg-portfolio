using Microsoft.EntityFrameworkCore;

namespace HSApi.Infrastructure.Persistence;

public sealed class PortfolioDbContext(DbContextOptions<PortfolioDbContext> options)
    : DbContext(options)
{
    public DbSet<ContentSnapshot> ContentSnapshots => Set<ContentSnapshot>();

    public DbSet<GreetingAttempt> GreetingAttempts => Set<GreetingAttempt>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("hsapi");

        modelBuilder.Entity<ContentSnapshot>(entity =>
        {
            entity.ToTable("ContentSnapshots");
            entity.HasKey(snapshot => snapshot.Id);
            entity.Property(snapshot => snapshot.Locale).HasMaxLength(8).IsRequired();
            entity.Property(snapshot => snapshot.PayloadJson).IsRequired();
            entity.Property(snapshot => snapshot.ETag).HasMaxLength(128).IsRequired();
            entity.HasIndex(snapshot => new { snapshot.Locale, snapshot.IsCurrent });
        });

        modelBuilder.Entity<GreetingAttempt>(entity =>
        {
            entity.ToTable("GreetingAttempts");
            entity.HasKey(attempt => attempt.Id);
            entity.Property(attempt => attempt.Outcome).HasMaxLength(32).IsRequired();
            entity.Property(attempt => attempt.FailureCategory).HasMaxLength(64);
            entity.HasIndex(attempt => attempt.RequestId).IsUnique();
            entity.HasIndex(attempt => attempt.CreatedAtUtc);
            entity.HasIndex(attempt => attempt.ExpiresAtUtc);
        });
    }
}
