using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace bot.Helpers
{
    class FindElement
    {
        public IWebDriver _driver { set; get; }
        public IWebElement ById(string id, int timeout = 15000, int delay = 1000)
        {
            Thread.Sleep(delay);

            IWebElement element = null;
            var timer = new Stopwatch();
            timer.Start();
            while (timer.Elapsed < TimeSpan.FromMilliseconds(timeout))
            {
                try
                {
                    element = _driver.FindElement(By.Id(id));
                    break;
                }
                catch (NoSuchElementException)
                {
                }
            }
            if (element != null)
            {
                var jsDriver = (IJavaScriptExecutor)_driver;
                string highlightJavascript = @"arguments[0].style.cssText = ""border-width: 1px; border-style: solid; border-color: yellow"";";
                jsDriver.ExecuteScript(highlightJavascript, new object[] { element });
            }
            timer.Stop();

            return element;
        }
        public IWebElement ByAttribute(string attribute, int timeout = 15000, int delay = 1000)
        {
            Thread.Sleep(delay);

            IWebElement element = null;
            var timer = new Stopwatch();
            timer.Start();
            while (timer.Elapsed < TimeSpan.FromMilliseconds(timeout))
            {
                try
                {
                    element = _driver.FindElement(By.XPath("//*[@routerlink='" + attribute + "']"));
                    break;
                }
                catch (NoSuchElementException)
                {
                }
            }
            if (element != null)
            {
                var jsDriver = (IJavaScriptExecutor)_driver;
                string highlightJavascript = @"arguments[0].style.cssText = ""border-width: 1px; border-style: solid; border-color: yellow"";";
                jsDriver.ExecuteScript(highlightJavascript, new object[] { element });
            }
            timer.Stop();

            return element;
        }
        public IWebElement ByClassName(string className, int timeout = 15000, int delay = 1000)
        {
            Thread.Sleep(delay);

            IWebElement element = null;
            var timer = new Stopwatch();
            timer.Start();
            while (timer.Elapsed < TimeSpan.FromMilliseconds(timeout))
            {
                try
                {
                    element = _driver.FindElement(By.ClassName(className));
                    break;
                }
                catch (NoSuchElementException)
                {
                }
            }
            if (element != null)
            {
                var jsDriver = (IJavaScriptExecutor)_driver;
                string highlightJavascript = @"arguments[0].style.cssText = ""border-width: 1px; border-style: solid; border-color: yellow"";";
                jsDriver.ExecuteScript(highlightJavascript, new object[] { element });
            }
            timer.Stop();
            return element;
        }

        public IList<IWebElement> ByClassNames(string className, int timeout = 15000, int delay = 1000)
        {
            Thread.Sleep(delay);

            IList<IWebElement> element = null;
            var timer = new Stopwatch();
            timer.Start();
            while (timer.Elapsed < TimeSpan.FromMilliseconds(timeout))
            {
                try
                {
                    element = _driver.FindElements(By.ClassName(className));
                    break;
                }
                catch (NoSuchElementException)
                {
                }
            }
            timer.Stop();
            return element;
        }

    }
}
