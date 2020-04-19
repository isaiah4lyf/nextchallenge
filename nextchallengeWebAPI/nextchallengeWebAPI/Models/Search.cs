using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;
namespace nextchallengeWebAPI.Models
{
    public class Search
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public string _redirect { set; get; }
        public string SearchType { set; get; }
        public string SearchContent { set; get; }
        public DateTime CreateDateTime { set; get; }
    }
    public class SearchPost
    {
        [XmlIgnore]
        public string _id { set; get; }
        public string UserID { set; get; }
        public string _redirect { set; get; }
        public string SearchType { set; get; }
        public string SearchContent { set; get; }
        public DateTime CreateDateTime { set; get; }
    }
    public class SearchConverter
    {
        public Search Convert(SearchPost search)
        {
            return new Search()
            {
                _id = search._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(search._id),
                UserID = search.UserID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(search.UserID),
                _redirect = search._redirect,
                SearchContent = search.SearchContent,
                SearchType = search.SearchType,
                CreateDateTime = search.CreateDateTime
            };
        }
    }
}