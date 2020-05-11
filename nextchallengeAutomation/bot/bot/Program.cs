using bot.Helpers;
using bot.Scripts;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace bot
{
    class Program
    {
        static void Main(string[] args)
        {
            IWebDriver driver = new ChromeDriver();
            FindElement findElement = new FindElement();
            findElement._driver = driver;

            driver.Navigate().GoToUrl("http://www.nextchallenge.co.za/");


            //Login here
            new login().performTask(findElement);


            //play
            new play().performTask(findElement);
        }
    }
}
