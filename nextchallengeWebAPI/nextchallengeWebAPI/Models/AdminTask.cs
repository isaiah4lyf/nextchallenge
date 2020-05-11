using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class AdminTask
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
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
    public class AdminTaskPost
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
    public class AdminTaskConverter 
    {
        public AdminTask Convert(AdminTaskPost task)
        {
            return new AdminTask()
            {
                _id = task._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(task._id),
                Name = task.Name,
                Description = task.Description,
                Type = task.Type,
                Action = task.Action,
                Daily = task.Daily,
                Weekly = task.Weekly,
                Monthly = task.Monthly,
                AtSecond = task.AtSecond,
                AtMinute = task.AtMinute,
                AtHour = task.AtHour,
                Days = task.Days,
                Months = task.Months,
                LastRan = task.LastRan
            };
        }
        public List<AdminTask> ConvertMany(List<AdminTaskPost> items)
        {
            List<AdminTask> itemsConverted = new List<AdminTask>();
            foreach (AdminTaskPost item in items)
                itemsConverted.Add(Convert(item));
            return itemsConverted;
        }
    }
}