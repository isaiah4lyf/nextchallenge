using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using taskRunnerConsole.Models;

namespace taskRunnerConsole
{
    class Program
    {
        static void Main(string[] args)
        {
            while (true)
            {
                try
                {
                    List<AdminTask> tasks = new List<AdminTask>();
                    HttpResponseMessage response = httpClient().GetAsync("retrieveadmintasks").Result;
                    if (response.IsSuccessStatusCode)
                    {
                        try
                        {
                            tasks = response.Content.ReadAsAsync<List<AdminTask>>().Result;
                            DateTime time = DateTime.Now;
                            foreach (AdminTask task in tasks)
                            {
                                if (task.Daily)
                                    runTaskAtTime(task, time);
                                if (task.Weekly)
                                    if (task.Days.Any(x => x == (int)time.DayOfWeek))
                                        runTaskAtTime(task, time);
                                if (task.Monthly)
                                    if (task.Months.Any(x => x == time.Month))
                                        if (task.Days.Any(x => x == (int)time.DayOfWeek))
                                            runTaskAtTime(task, time);
                            }

                            Console.WriteLine(time.Hour);
                        }
                        catch (Exception ex)
                        {
                            ex.ToString();
                        }
                    }
                }
                catch (Exception ex)
                {
                    ex.ToString();
                }              
                Thread.Sleep(5000);
            }
        }
        static void runTaskAtTime(AdminTask task, DateTime time)
        {
            try
            {
                if (task.AtHour == time.Hour && task.AtMinute == time.Minute && Math.Abs(time.Second - task.AtSecond) < 3)
                {
                    task.LastRan = DateTime.Now;
                    HttpResponseMessage responseRun = httpClient().GetAsync(task.Action).Result;
                    if (responseRun.IsSuccessStatusCode)
                    {
                        HttpResponseMessage response = httpClient().PutAsJsonAsync("updateadmintask", new List<AdminTask>() { task }).Result;
                        if (response.IsSuccessStatusCode) { }
                    }
                    Console.WriteLine(responseRun);
                }
            }
            catch (Exception ex)
            {
                ex.ToString();
            }
        }
        static HttpClient httpClient()
        {
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri(System.Configuration.ConfigurationManager.AppSettings["WebUrl"]);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return client;
        }
    }
}
