using bot.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace bot.Scripts
{
    class login
    {
        public void performTask(FindElement findElement)
        {
            Console.Write("Enter username: ");
            findElement.ById("signin-email").SendKeys(Console.ReadLine());
            Console.Write("Enter password: ");
            findElement.ById("signin-password").SendKeys(Console.ReadLine());
            findElement.ByClassName("btn-primary").Click();
        }
    }
}
