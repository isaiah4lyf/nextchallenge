using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Message
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId FromUserID { get; set; }
        public ObjectId ToUserID { get; set; }
        public string MessageContent { get; set; }
        public string FileType { set; get; }
        public bool MessageRead { set; get; }
        public DateTime CreateDateTime { set; get; }
        public List<FileUpload> Files { get; set; }
        public string DeleteFor { set; get; }
    }
    public class MessageDetailed
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId FromUserID { get; set; }
        public ObjectId ToUserID { get; set; }
        public string MessageContent { get; set; }
        public string FileType { set; get; }
        public bool MessageRead { set; get; }
        public DateTime CreateDateTime { set; get; }
        public List<FileUpload> Files { get; set; }
        public List<UserMinInfo> FromUsers { get; set; }
        public List<UserMinInfo> ToUsers { get; set; }
        public DateTime DateTimeNow { get; set; }
        public string DeleteFor { set; get; }

    }
}