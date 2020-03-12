using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Student
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public string Name { set; get; }
        public string LastName { set; get; }
        public string Email { set; get; }
        public string StudentNumber { set; get; }
    }
}