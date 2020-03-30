using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Company
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public string Name { set; get; }
        public string Designation { set; get; }
        public string From { set; get; }
        public string To { set; get; }
        public string CityOrTown { set; get; }
        public string Description { set; get; }
    }
    public class CompanyPost
    {
        public string _id { set; get; }
        public string UserID { set; get; }
        public string Name { set; get; }    
        public string Designation { set; get; }
        public string From { set; get; }
        public string To { set; get; }
        public string CityOrTown { set; get; }
        public string Description { set; get; }
    }
    public class CompanyConverter
    {
        public Company Convert(CompanyPost company)
        {
            return new Company()
            {
                _id = company._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(company._id),
                UserID = company.UserID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(company.UserID),
                Name = company.Name,
                Designation = company.Designation,
                From = company.From,
                To = company.To,
                CityOrTown = company.CityOrTown,
                Description = company.Description
            };
        }
        public List<Company> ConvertMany(List<CompanyPost> companies)
        {
            List<Company> companiesConverted = new List<Company>();
            foreach (CompanyPost company in companies)
                companiesConverted.Add(Convert(company));
            return companiesConverted;
        }
    }

}