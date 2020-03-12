using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class User
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public DateOfBirth DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string City { get; set; }

    }
    public class DateOfBirth {
        public int Day;
        public string Month;
        public int Year;
    }

}