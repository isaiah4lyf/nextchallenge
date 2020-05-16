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
    }
    public class ConfirmationDetailsDetailed
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId UserId { get; set; }
        public bool EmailConfirmed { set; get; }
        public DateTime ConfirmedDateTime { get; set; }
        public List<EmailConfirmation> EmailConfirmations { set; get; }
    }
    public class EmailConfirmation
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId UserId { get; set; }
        public string Link { get; set; }
        public bool Confirmed { get; set; }
        public DateTime ConfirmedDateTime { get; set; }
        public DateTime CreateDateTime { get; set; }
    }
    public class EmailConfirmationPost
    {
        public string _id { get; set; }
        public string UserId { get; set; }
        public string Link { get; set; }
        public bool Confirmed { get; set; }
        public DateTime ConfirmedDateTime { get; set; }
        public DateTime CreateDateTime { get; set; }
    }
    public class EmailConfirmationConverter
    {
        public EmailConfirmation Convert(EmailConfirmationPost confirm)
        {
            return new EmailConfirmation()
            {
                _id = confirm._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(confirm._id),
                UserId = confirm.UserId == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(confirm.UserId),
                Confirmed = confirm.Confirmed,
                CreateDateTime = confirm.CreateDateTime,
                Link = confirm.Link
            };
        }
    }
}