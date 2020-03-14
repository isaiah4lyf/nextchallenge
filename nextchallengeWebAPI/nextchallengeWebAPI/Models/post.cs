using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Post
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public string PostContent { get; set; }
        public string FileType { set; get; }
        public ObjectId UserID { set; get; }
        public DateTime CreateDateTime { set; get; }
        public List<FileUpload> Files { get; set; }
    }
}