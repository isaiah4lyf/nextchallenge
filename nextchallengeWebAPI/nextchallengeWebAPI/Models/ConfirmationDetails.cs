using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class ConfirmationDetails
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId UserId { get; set; }
        public bool EmailConfirmed { set; get; }
        public DateTime ConfirmedDateTime { get; set; }
        public List<EmailConfirmation> EmailConfirmations { set; get; }
        public List<PasswordReset> PasswordResets { set; get; }
    }
    public class EmailConfirmation
    {
        public string Link { get; set; }
        public bool Confirmed { get; set; }
        public DateTime ConfirmedDateTime { get; set; }
        public DateTime CreateDateTime { get; set; }
    }
    public class PasswordReset
    {
        public string Link { get; set; }
        public bool Reseted { get; set; }
        public DateTime ResetedDateTime { get; set; }
        public DateTime CreateDateTime { get; set; }
    }
}