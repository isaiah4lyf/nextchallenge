using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Notification
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public string Type { set; get; }
        public bool Read { set; get; }
        public DateTime CreateDateTime { set; get; }
        public string Content { set; get; } //Generic
    }
    public class NotificationDetailed
    {
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public string Type { set; get; }
        public bool Read { set; get; }
        public DateTime CreateDateTime { set; get; }
        public string Content { set; get; } //Generic
        public DateTime DateTimeNow { set; get; }
    }
    public class NotificationPost 
    {
        public string _id { set; get; }
        public string UserID { set; get; }
        public string Type { set; get; }
        public bool Read { set; get; }
        public DateTime CreateDateTime { set; get; }
        public string Content { set; get; } //Generic
    }
    public class NotificationConverter
    { 
        public Notification Convert(NotificationPost notification)
        {
            return new Notification()
            {
                _id = notification._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(notification._id),
                UserID = notification.UserID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(notification.UserID),
                Type = notification.Type,
                Read = notification.Read,
                CreateDateTime = notification.CreateDateTime,
                Content = notification.Content
            };
        }
    }
}