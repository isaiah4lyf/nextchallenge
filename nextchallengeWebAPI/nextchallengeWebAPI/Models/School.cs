using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class School
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public string Name { set; get; }
        public string From { set; get; }
        public string To { set; get; }
        public string Description { set; get; }
        public DateTime CreateDateTime { set; get; }
    }
    public class SchoolPost
    {
        public string _id { set; get; }
        public string UserID { set; get; }
        public string Name { set; get; }
        public string From { set; get; }
        public string To { set; get; }
        public string Description { set; get; }
        public DateTime CreateDateTime { set; get; }
    }
    public class SchoolConverter 
    { 
        public School Convert(SchoolPost school)
        {
            return new School()
            {
                _id = school._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(school._id),
                UserID = school.UserID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(school.UserID),
                Name = school.Name,
                From = school.From,
                To = school.To,
                Description= school.Description,
                CreateDateTime = DateTime.Now
            };
        }
        public List<School> ConvertMany(List<SchoolPost> schools)
        {
            List<School> schollsConverted = new List<School>();
            foreach (SchoolPost school in schools)
                schollsConverted.Add(Convert(school));
            return schollsConverted;
        }
    }

}