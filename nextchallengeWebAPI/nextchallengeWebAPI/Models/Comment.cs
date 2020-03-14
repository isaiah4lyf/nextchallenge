using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Comment
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId PostID { get; set; }
        public string CommentContent { get; set; }
        public string FileType { set; get; }
        public ObjectId UserID { set; get; }
        public DateTime CreateDateTime { set; get; }
        public List<FileUpload> Files { get; set; }
    }
}