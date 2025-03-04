using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

using Altinn.Platform.Profile.Tests.IntegrationTests.Utils;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;

using Xunit;

namespace Altinn.Platform.Profile.Tests.IntegrationTests
{
    public class ErrorHandlingTests : IClassFixture<WebApplicationFactory<Startup>>
    {
        private readonly WebApplicationFactorySetup _webApplicationFactorySetup;

        public ErrorHandlingTests(WebApplicationFactory<Startup> factory)
        {
            _webApplicationFactorySetup = new WebApplicationFactorySetup(factory);
        }

        [Fact]
        public async Task GetError_ReturnsInternalServerError()
        {
            // Arrange
            HttpClient client = _webApplicationFactorySetup.GetTestServerClient();

            HttpRequestMessage httpRequestMessage = new (HttpMethod.Get, "/profile/api/v1/error");

            // Act
            HttpResponseMessage response = await client.SendAsync(httpRequestMessage);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

            string responseContent = await response.Content.ReadAsStringAsync();
            ProblemDetails problemDetails = JsonSerializer.Deserialize<ProblemDetails>(responseContent);

            Assert.StartsWith("An error occurred", problemDetails.Title);
        }
    }
}
