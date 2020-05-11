using nextchallengeService.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.ServiceProcess;
using System.Text;
using System.Threading;
using System.Timers;

namespace nextchallengeService
{
    public partial class Service1 : ServiceBase
    {
        System.Timers.Timer timer = new System.Timers.Timer(); // name space(using System.Timers;)  
        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            timer.Elapsed += new System.Timers.ElapsedEventHandler(OnElapsedTime);
            timer.Interval = 5000; //number in milisecinds  
            timer.Enabled = true;
        }
        private void OnElapsedTime(object source, System.Timers.ElapsedEventArgs e)
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
                        }
                        catch (Exception ex)
                        {
                            ex.ToString();
                        }
                    }
                    Thread.Sleep(5000);
                }
                catch (Exception ex)
                {
                    ex.ToString();
                }
            }
        }
        protected override void OnStop()
        {
        }
        protected void runTaskAtTime(AdminTask task, DateTime time)
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
        protected HttpClient httpClient()
        {
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri(System.Configuration.ConfigurationManager.AppSettings["WebUrl"]);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return client;
        }
    }
}
