using System.Security.Cryptography;
using HSApi.Common.Security;
using Microsoft.Extensions.Options;

namespace HSApi.Features.Admin.Auth;

public sealed class AdminPasswordVerifier(IOptions<AdminAuthOptions> options)
{
    private readonly AdminAuthOptions _options = options.Value;

    public bool Verify(string username, string password)
    {
        if (!_options.Enabled ||
            string.IsNullOrWhiteSpace(_options.Username) ||
            !string.Equals(username, _options.Username, StringComparison.Ordinal))
        {
            return false;
        }

        if (!string.IsNullOrWhiteSpace(_options.PasswordHash))
        {
            return VerifyPbkdf2(password, _options.PasswordHash);
        }

        if (!string.IsNullOrWhiteSpace(_options.Password))
        {
            return FixedTimeEquals(password, _options.Password);
        }

        return false;
    }

    private static bool VerifyPbkdf2(string password, string encoded)
    {
        string[] parts = encoded.Split('.', 4);

        if (parts.Length != 4 ||
            parts[0] != "pbkdf2-sha256" ||
            !int.TryParse(parts[1], out int iterations))
        {
            return false;
        }

        byte[] salt;
        byte[] expected;

        try
        {
            salt = Convert.FromBase64String(parts[2]);
            expected = Convert.FromBase64String(parts[3]);
        }
        catch (FormatException)
        {
            return false;
        }

        byte[] actual = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            expected.Length);

        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    private static bool FixedTimeEquals(string actual, string expected)
    {
        byte[] actualBytes = System.Text.Encoding.UTF8.GetBytes(actual);
        byte[] expectedBytes = System.Text.Encoding.UTF8.GetBytes(expected);

        return actualBytes.Length == expectedBytes.Length &&
            CryptographicOperations.FixedTimeEquals(actualBytes, expectedBytes);
    }
}
