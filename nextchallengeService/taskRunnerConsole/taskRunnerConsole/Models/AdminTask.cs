using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace taskRunnerConsole.Models
{
    public class AdminTask
    {
        public string _id { set; get; }
        public string Name { set; get; }
        public string Description { set; get; }
        public string Type { set; get; }
        public string Action { set; get; }
        public bool Daily { set; get; }
        public bool Weekly { set; get; }
        public bool Monthly { set; get; }
        public int AtSecond { set; get; }
        public int AtMinute { set; get; }
        public int AtHour { set; get; }
        public List<int> Days { set; get; }
        public List<int> Months { set; get; }
        public DateTime LastRan { set; get; }
    }
}
