using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class ActiveChats
    {
        public ObjectId FromUserId { set; get;}
        public ObjectId ToUserId { set; get;}
        public List<User> FromUsers { get; set; }
        public List<User> ToUsers { get; set; }
        public DateTime LastMessageDate { set; get; }
        public Message LatestMessage { set; get; }
        public int UnreadMessagesCount { set; get; }
        public DateTime DateTimeNow { set; get; }
    }
}