using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using CloudSwyft.CloudLabs.Models;
using Newtonsoft.Json;
using System.Web.Configuration;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CloudSwyft.CloudLabs.Helpers
{
    public class CsApi
    {
        private static string ApiCall(string baseUrl, string url, string accessToken)
        {
            try
            {

                var client = new HttpClient { BaseAddress = new Uri(baseUrl) };
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                var response = client.GetAsync(url).Result;

                if (!response.IsSuccessStatusCode) return response.ReasonPhrase;
                var responseContent = response.Content;
                var responseString = responseContent.ReadAsStringAsync().Result;

                return responseString;

            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public static string GetClientApi(string clientId, string accessToken)
        {
            TenantCode clientData = null;
            try
            {
                string baseUrl = WebConfigurationManager.AppSettings["CloudSwyftOAuthServerUrl"];
                string cloudServiceCallResponse = ApiCall(baseUrl, "api/Clients/GetClientApiByUser?clientId=" + clientId, accessToken);
                clientData = JsonConvert.DeserializeObject<TenantCode>(cloudServiceCallResponse);
                return clientData.ApiUrl;
            }
#pragma warning disable CS0168
            catch (Exception ex)
#pragma warning restore CS0168 
            {
                return "";
            }
        }

        public static string GetClientOnlyApi(string clientId, string accessToken)
        {
            TenantCode clientData = null;
            try
            {
                string baseUrl = WebConfigurationManager.AppSettings["CloudSwyftOAuthServerUrl"];
                string cloudServiceCallResponse = ApiCall(baseUrl, "api/Clients/GetApiByClient?clientId=" + clientId, accessToken);
                clientData = JsonConvert.DeserializeObject<TenantCode>(cloudServiceCallResponse);

                return clientData.ApiUrl;
            }
            catch (Exception ex)
            {
                return "";
            }
        }
    }
}