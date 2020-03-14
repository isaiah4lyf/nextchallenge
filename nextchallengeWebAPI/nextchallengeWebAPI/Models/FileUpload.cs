using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;
namespace nextchallengeWebAPI.Models
{
    public class FileUpload
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public string FileName { set; get; }
        public ObjectId UserID { set; get; }
        public string FileType { set; get; }
        public DateTime UploadDateTime { set; get; }
        public List<string> FileBaseUrls { set; get; }
    }
}