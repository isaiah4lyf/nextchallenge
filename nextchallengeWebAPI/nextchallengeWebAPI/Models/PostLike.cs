using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;



namespace nextchallengeWebAPI.Models
{
    public class PostLike
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId PostID { get; set; }
        public ObjectId UserID { get; set; }
        public DateTime CreateDateTime { get; set; }
    }
}