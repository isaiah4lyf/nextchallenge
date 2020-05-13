using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Prize
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public int Position { get; set; }
        public string Weekly { set; get; }
        public string Weekend { set; get; }
    }
    public class PrizesDetailed
    {
        public List<Prize> Prizes { set; get; }
        public PrizeDetails PrizeDetatils { set; get; }
    }
    public class PrizePost
    {
        [XmlIgnore]
        public string _id { get; set; }
        public int Position { get; set; }
        public string Weekly { set; get; }
        public string Weekend { set; get; }
    }
    public class PrizeDetails
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public ObjectId UserId { get; set; }
        public int PrizeMethod { get; set; }
        public string Phone { set; get; }
        public string eWalletPhone { set; get; }
        public string Network { set; get; }
        public string PhoneEmail { set; get; }
        public string BankAccount { set; get; }
        public string Bank { set; get; }
        public string BranchCode { set; get; }
    }
    public class PrizeDetailsPost
    {
        public string _id { get; set; }
        public string UserId { get; set; }
        public int PrizeMethod { get; set; }
        public string eWalletPhone { set; get; }
        public string Phone { set; get; }
        public string Network { set; get; }
        public string PhoneEmail { set; get; }
        public string BankAccount { set; get; }
        public string Bank { set; get; }
        public string BranchCode { set; get; }
    }
    public class PrizeConverter 
    {
        public Prize Convert(PrizePost prize)
        {
            return new Prize()
            {
                _id = prize._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(prize._id),
                Position = prize.Position,
                Weekly = prize.Weekly,
                Weekend = prize.Weekend
            };
        }
        public List<Prize> ConvertMany(List<PrizePost> prizes)
        {
            List<Prize> prizesConverted = new List<Prize>();
            foreach (PrizePost prize in prizes)
                prizesConverted.Add(Convert(prize));
            return prizesConverted;
        }
    }
    public class PrizeDetailsConverter
    {
        public PrizeDetails Convert(PrizeDetailsPost detail)
        {
            return new PrizeDetails()
            {
                _id = detail._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(detail._id),
                UserId = detail.UserId == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(detail.UserId),
                PrizeMethod = detail.PrizeMethod,
                eWalletPhone = detail.eWalletPhone,
                Phone = detail.Phone,
                Network = detail.Network,
                PhoneEmail = detail.PhoneEmail,
                BankAccount = detail.BankAccount,
                Bank = detail.Bank,
                BranchCode = detail.BranchCode
            };
        }
    }
}