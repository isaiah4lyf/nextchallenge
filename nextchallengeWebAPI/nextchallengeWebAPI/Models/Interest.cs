using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;


namespace nextchallengeWebAPI.Models
{
    public class Interest
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public string InterestName { set; get; }
        public string IconName { set; get; }
    }

    public class InterestPost
    {
        public string _id { set; get; }
        public string UserID { set; get; }
        public string InterestName { set; get; }
        public string IconName { set; get; }
    }
    public class InterestConverter
    {
        public Interest Convert(InterestPost company)
        {
            return new Interest()
            {
                _id = company._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(company._id),
                UserID = company.UserID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(company.UserID),
                InterestName = company.InterestName,
                IconName = company.IconName
            };
        }
    }
}