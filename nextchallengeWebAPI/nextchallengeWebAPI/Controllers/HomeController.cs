using nextchallengeWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Cors;
using System.Web.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace nextchallengeWebAPI.Controllers
{
    public class HomeController : Controller
    {
        static MongoClient client = new MongoClient("mongodb://localhost:27017");
        static IMongoDatabase database = client.GetDatabase("nextchallenge");

        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }
        [HttpPost]
        public ActionResult completeattemptpuchase()
        {
            var collection = database.GetCollection<AttemptsPurchase>("AttemptsPurchases");
            string purchaseStatus = Request["payment_status"];
            string purchaseId = Request["m_payment_id"];

            var update = Builders<AttemptsPurchase>.Update.Set(p => p.Status, purchaseStatus);
            collection.UpdateOne(u => u._id == ObjectId.Parse(purchaseId), update);

            return Json("ok", JsonRequestBehavior.AllowGet);
        }
    }
}
