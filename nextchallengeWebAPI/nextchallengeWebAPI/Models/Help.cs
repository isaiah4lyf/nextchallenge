using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Help
    {
        public List<HelpItem> General { set; get; }
        public List<HelpItem> Account { set; get; }
        public List<HelpItem> Privacy { set; get; }
        public List<HelpItem> Other { set; get; }
    }
    public class HelpItem
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public string HelpTab { set; get; }
        public string Question { set; get; }
        public string Answer { set; get; }
        public int SortBy { set; get; }
        public List<Instruction> Instructions { set; get; }
    }
    public class HelpItemPost
    {
        public string _id { set; get; }
        public string HelpTab { set; get; }
        public string Question { set; get; }
        public string Answer { set; get; }
        public int SortBy { set; get; }
        public List<Instruction> Instructions { set; get; }
    }
    public class Instruction
    {
        public string Type { set; get; }
        public string Description { set; get; }
        public int SortBy { set; get; }
        public string Value { set; get; }
    }
    public class HelpItemConverter
    {
        public HelpItem Convert(HelpItemPost item)
        {
            return new HelpItem()
            {
                _id = item._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(item._id),
                HelpTab = item.HelpTab,
                Question = item.Question,
                Answer = item.Answer,
                SortBy = item.SortBy,
                Instructions = item.Instructions
            };
        }
        public List<HelpItem> ConvertMany(List<HelpItemPost> items)
        {
            List<HelpItem> itemsConverted = new List<HelpItem>();
            foreach (HelpItemPost item in items)
                itemsConverted.Add(Convert(item));
            return itemsConverted;
        }
    }
}