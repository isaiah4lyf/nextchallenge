using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MongoDB.Bson;
using MongoDB.Driver;
using nextchallengeWebAPI.Models;

namespace nextchallengeWebAPI.Controllers
{
    public class ValuesController : ApiController
    {
        static MongoClient client = new MongoClient("mongodb://localhost:27017");
        static IMongoDatabase database = client.GetDatabase("ext");

        // GET api/values
        public List<Student> Get(string studentNumber)
        {
            var collection = database.GetCollection<Student>("Students");
            List<Student> list = collection.Find(new BsonDocument()).ToList();
            return list;
        }



        // PUT api/values/5
        public Student CreateStudent([FromBody]Student student)
        {
            var collection = database.GetCollection<Student>("Students");
            collection.InsertOne(student);
            return student;
        }
        // PUT api/values
        public void Put([FromBody]string value)
        {
        }
        // DELETE api/values/5
        public void Delete(int id)
        {
        }

    }
}
