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
    public class PostDetailed
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public string PostContent { get; set; }
        public ObjectId UserID { set; get; }
        public string FileType { set; get; }
        public DateTime CreateDateTime { set; get; }
        public DateTime DateTimeNow { set; get; }
        public List<FileUpload> Files { get; set; }
        public List<User> Users { set; get; }
        public List<CommentDetailed> Comments { set; get; }
        public int CommentsCount { set; get; }
        public int DislikesCount { set; get; }
        public int LikesCount { set; get; }
        public bool PostLiked { set; get; }
        public bool PostDisLiked { set; get; }
    }
    public class PostLike
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId PostID { get; set; }
        public ObjectId UserID { get; set; }
        public DateTime CreateDateTime { get; set; }
    }
    public class PostDisLike
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId PostID { get; set; }
        public ObjectId UserID { get; set; }
        public DateTime CreateDateTime { get; set; }
    }
}