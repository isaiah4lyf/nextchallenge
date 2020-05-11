using bot.Helpers;
using nextchallengeWebAPI.Models;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Web;

namespace bot.Scripts
{
    class play
    {
        public void performTask(FindElement findElement)
        {

            Thread.Sleep(5000);
            findElement.ByAttribute("/play").Click();
            Thread.Sleep(3000);
            findElement.ByClassName("custom-col").Click();
            Thread.Sleep(3000);
            IList<IWebElement> serverSesssions = findElement.ByClassNames("custom-col");
            IList<IWebElement> serverSesssionsNumbers = findElement.ByClassNames("custom-col-button");
            //IList<IWebElement> serverSesssionsResume = findElement.ByClassNames("server-session-connected-text");
            for (int i = 0; i < serverSesssions.Count; i++)
            {
                if (serverSesssionsNumbers.ElementAt(i).GetAttribute("innerText") != "10/10"/* || serverSesssionsResume.ElementAt(i).GetAttribute("innerText") == "Resume"*/)
                {
                    serverSesssions.ElementAt(i).Click();
                    break;
                }
            }

            Thread.Sleep(10000);

            List<DefaultSessionChallenge> challengesPull = new List<DefaultSessionChallenge>();
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri("http://www.nextchallenge.co.za/api/api/index/retrievedefaultsessionchallengeall");
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpResponseMessage response = client.GetAsync("").Result;
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    challengesPull = response.Content.ReadAsAsync<List<DefaultSessionChallenge>>().Result;
                    Console.WriteLine(challengesPull.Count);

                }
                catch (Exception ex)
                {
                    ex.ToString();
                }
            }
            while (true)
            {
                IList<IWebElement> challenges = findElement.ByClassNames("challenge-question");
                //IList<IWebElement> challengesClue = findElement.ByClassNames("challenge-clue");
                string answer = "";
                for (int i = 0; i < challengesPull.Count; i++)
                {
                    if (challenges.ElementAt(challenges.Count - 1).GetAttribute("innerText").Contains(challengesPull.ElementAt(i).Question) || challengesPull.ElementAt(i).Question.Contains(challenges.ElementAt(challenges.Count - 1).GetAttribute("innerText")))
                        answer = challengesPull.ElementAt(i).Answer;
                }
                findElement.ById("exampleTextarea").SendKeys(answer);
                Thread.Sleep(500);
                findElement.ByClassName("ion-ios-paperplane").Click();
                IList<IWebElement> challengesCheck = findElement.ByClassNames("challenge-question");
                while (challengesCheck.Count == challenges.Count)
                {
                    challengesCheck = findElement.ByClassNames("challenge-question");
                    Thread.Sleep(1000);
                }
            }

        }
    }
}
