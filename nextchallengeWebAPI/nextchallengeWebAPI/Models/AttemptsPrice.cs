using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class AttemptsPrice
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public int AttemptsCount { set; get; }
        public double Price { set; get; }
    }
    public class AttemptsPricePost
    {
        public string _id { set; get; }
        public int AttemptsCount { set; get; }
        public double Price { set; get; }
    }
    public class AttemptsPriceConverter 
    {
        public AttemptsPrice Convert(AttemptsPricePost price)
        {
            return new AttemptsPrice()
            {
                _id = price._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(price._id),
                AttemptsCount = price.AttemptsCount,
                Price = price.Price
            };
        }
    }

}