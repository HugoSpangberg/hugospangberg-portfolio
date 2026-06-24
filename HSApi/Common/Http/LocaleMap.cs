namespace HSApi.Common.Http;

public static class LocaleMap
{
    public static bool TryMapCulture(string locale, out string culture)
    {
        culture = locale switch
        {
            "sv" => "sv-SE",
            "en" => "en-US",
            _ => string.Empty,
        };

        return culture.Length > 0;
    }
}
