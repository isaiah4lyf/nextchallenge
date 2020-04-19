using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Activity
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public string Content { set; get; }
        public string ActivityType { set; get; }
        public string _redirect { set; get; }
        public DateTime CreateDateTime { set; get; }
        public DateTime DateTimeNow { set; get; }
    }
    public class ActivityPost
    {
        public string _id { set; get; }
        public string UserID { set; get; }
        public string Content { set; get; }
        public string ActivityType { set; get; }
        public string _redirect { set; get; }
        public DateTime CreateDateTime { set; get; }
        public DateTime DateTimeNow { set; get; }
    }
    public class ActivityConverter 
    { 
        public Activity Convert(ActivityPost activity)
        {
            return new Activity()
            {
                _id = activity._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(activity._id),
                UserID = activity.UserID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(activity.UserID),
                Content = activity.Content,
                ActivityType = activity.ActivityType,
                _redirect = activity._redirect,
                CreateDateTime = activity.CreateDateTime,
                DateTimeNow = activity.DateTimeNow
            };
        }
    }
}