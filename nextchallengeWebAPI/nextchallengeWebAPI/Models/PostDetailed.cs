using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class PostDetailed
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public string PostContent { get; set; }
        public ObjectId UserID { set; get; }
        public DateTime CreateDateTime { set; get; }
        public List<FileUpload> Files { get; set; }
        public List<User> Users { set; get; }
        public List<CommentDetailed> Comments { set; get; }
    }

}