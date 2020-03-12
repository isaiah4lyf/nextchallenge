using MongoDB.Bson;
using MongoDB.Driver;
using nextchallengeWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace nextchallengeWebAPI.Controllers
{
    public class indexController : ApiController
    {
        static MongoClient client = new MongoClient("mongodb://localhost:27017");
        static IMongoDatabase database = client.GetDatabase("nextchallenge");

        //public List<User> getusers()
        //{
        //    var collection = database.GetCollection<User>("Users");
        //    List<User> list = collection.Find(
        //        new BsonDocument("FirstName", "afa")
        //        ).ToList();
        //    return list;
        //}
        [HttpGet]
        public List<User> login(string email, string password)
        {
            var collection = database.GetCollection<User>("Users");

            return collection.Find(new BsonDocument("$or", "[{'Email': 'afwa'}, {'Email': 'afwa'}]")).ToList();
        }

        public User createuser([FromBody]User user)
        {
            var collection = database.GetCollection<User>("Users");
            collection.InsertOne(user);
            return user;
        }

    }
}
