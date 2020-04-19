using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;
namespace nextchallengeWebAPI.Models
{
    public class AttemptsPurchase
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public ObjectId AttemptsPriceID { set; get; }
        public string Status { set; get; }
        public DateTime PurchaseDateTime { set; get; }
    }
    public class AttemptsPurchaseDetailed
    {
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public ObjectId AttemptsPriceID { set; get; }
        public string Status { set; get; }
        public DateTime PurchaseDateTime { set; get; }
        public List<AttemptsPrice> Prices { set; get; }
    }
    public class AttemptsPurchasePost
    {
        public string _id { set; get; }
        public string UserID { set; get; }
        public string AttemptsPriceID { set; get; }
        public string Status { set; get; }
        public DateTime PurchaseDateTime { set; get; }
    }
    public class AttemptsPurchaseConverter
    {
        public AttemptsPurchase Convert(AttemptsPurchasePost purchase)
        {
            return new AttemptsPurchase()
            {
                _id = purchase._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(purchase._id),
                UserID = purchase.UserID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(purchase.UserID),
                AttemptsPriceID = purchase.AttemptsPriceID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(purchase.AttemptsPriceID),
                Status = purchase.Status,
                PurchaseDateTime = purchase.PurchaseDateTime
            };
        }
    }
}