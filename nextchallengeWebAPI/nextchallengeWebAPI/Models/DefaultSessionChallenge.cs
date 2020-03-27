using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class DefaultSessionChallenge
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public string Answer { set; get; }
        public string Category { set; get; }
        public Clue Clue { set; get; }
        public DateTime CreateDateTime { set; get; }
        public int Points { set; get; }
        public string Question { set; get; }
        public int TimeInSeconds { set; get; }

    }
    public class Clue {
        public string Type { set; get; }
        public string Description { set; get; }
        public List<FileUpload> Files { set; get; } 
    }
}