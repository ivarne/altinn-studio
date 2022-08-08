using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

namespace LocalTest.Controllers
{
    public class ProxyMiddleware
    {
        private readonly RequestDelegate _nextMiddleware;
        public ProxyMiddleware(RequestDelegate nextMiddleware)
        {
            _nextMiddleware = nextMiddleware;
        }
        private static readonly List<Regex> _noProxies = new()
        {
            new Regex("^/$"),
            new Regex("^/Home/"),
            new Regex("^/localtestresources/"),
            new Regex("^/LocalPlatformStorage/"),
            new Regex("^/authentication/"),
            new Regex("^/authorization/"),
            new Regex("^/profile/"),
            new Regex("^/events/"),
            new Regex("^/register/"),
            new Regex("^/storage/"),
        };
        private static readonly List<(Regex regex, string host)> _proxies = new()
        {
            (new Regex("^/receipt/"), "http://localhost:5060"),
            (new Regex(".*"), "http://localhost:5005"),
            // (new Regex("^/receipt/"), "http://host.docker.internal:5060"),
            // (new Regex(".*"), "http://host.docker.internal:5005"),
        };

        static readonly HttpClient _client = new HttpClient(new HttpClientHandler{UseCookies=false, AllowAutoRedirect=false });

        public async Task Invoke(HttpContext context)
        {
            var path = context.Request.Path.Value;
            foreach (var noProxy in _noProxies)
            {
                if (noProxy.IsMatch(path))
                {
                    await _nextMiddleware(context);
                    return;
                }
            }
            foreach (var (regex, host) in _proxies)
            {
                if (regex.IsMatch(path))
                {
                    await ProxyRequest(context, host);
                    return;
                }
            }
            await _nextMiddleware(context);
        }

        public async Task ProxyRequest(HttpContext context, string newHost)
        {
            var request = CreateTargetMessage(context, newHost);
            context.Response.Headers.Add("X-Altinn-localtest-redirect", request.RequestUri.ToString());
            using var response = await _client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            context.Response.StatusCode = (int)response.StatusCode;
            CopyFromTargetResponseHeaders(context, response);
            await response.Content.CopyToAsync(context.Response.Body);
        }

        private static HttpRequestMessage CreateTargetMessage(HttpContext context, string newHost)
        {
            HttpRequestMessage requestMessage = new()
            {
                RequestUri = new($"{newHost}{context.Request.Path}{context.Request.QueryString}"),
                Method = new HttpMethod(context.Request.Method),
            };

            if (RequestMethodUsesBody(context.Request.Method))
            {
                var streamContent = new StreamContent(context.Request.Body);
                requestMessage.Content = streamContent;
            }

            foreach (var header in context.Request.Headers)
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                if (requestMessage.Content is not null &&
                    (
                        header.Key == "Content-Type" ||
                        header.Key == "Content-Disposition"
                    ))
                {
                    requestMessage.Content.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }
            requestMessage.Headers.Host = new Uri(newHost).Host;
            return requestMessage;
        }

        private static bool RequestMethodUsesBody(string method) => !(HttpMethods.IsGet(method) ||
              HttpMethods.IsHead(method) ||
              HttpMethods.IsDelete(method) ||
              HttpMethods.IsTrace(method));


        private static void CopyFromTargetResponseHeaders(HttpContext context, HttpResponseMessage responseMessage)
        {
            foreach (var header in responseMessage.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }

            foreach (var header in responseMessage.Content.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }
            context.Response.Headers.Remove("transfer-encoding");
        }
    }
}

