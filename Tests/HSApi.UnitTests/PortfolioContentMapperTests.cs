using System.Text.Json;
using HSApi.Common.Http;
using HSApi.Features.Portfolio.GetPortfolio;

namespace HSApi.UnitTests;

public sealed class PortfolioContentMapperTests
{
    [Theory]
    [InlineData("sv", "sv-SE")]
    [InlineData("en", "en-US")]
    public void TryMapCulture_maps_supported_locales(string locale, string expectedCulture)
    {
        bool mapped = LocaleMap.TryMapCulture(locale, out string culture);

        Assert.True(mapped);
        Assert.Equal(expectedCulture, culture);
    }

    [Fact]
    public void MapFromUmbraco_rejects_empty_experience_list()
    {
        using JsonDocument document = JsonDocument.Parse(
            """
            {
              "properties": {
                "portfolioContent": {
                  "seo": {},
                  "hero": {},
                  "experience": { "items": [] }
                }
              }
            }
            """);

        Assert.Throws<JsonException>(() => PortfolioContentMapper.MapFromUmbraco(document));
    }
}
