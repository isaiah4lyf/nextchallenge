using MediaToolkit;
using MediaToolkit.Model;
using MediaToolkit.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using nextchallengeWebAPI.Helpers;
using nextchallengeWebAPI.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;


namespace nextchallengeWebAPI.Controllers
{
    public class indexController : ApiController
    {
        static MongoClient client = new MongoClient("mongodb://localhost:27017");
        static IMongoDatabase database = client.GetDatabase("nextchallenge");
        static string atNextMail = "@nextchallenge.co.za";

        [Route("api/index/checkregistrationemail")]
        [HttpGet]
        public bool checkregistrationemail(string email)
        {
            return database.GetCollection<User>("Users").Find(u => u.EmailRegistration == email).ToList().Count() > 0;
        }
        [Route("api/index/createuser")]
        [HttpPost]
        public User createuser([FromBody]User user)
        {
            var collection = database.GetCollection<User>("Users");
            var collectionLeaderboards = database.GetCollection<Leaderboard>("Leaderboards");
            if (collection.Find(u => u.EmailRegistration == user.EmailRegistration).ToList().Count() > 0)
                return null;
            string Email = user.FirstName.ToLower() + "." + user.LastName.ToLower();
            int EmailIncreament = 1;
            while (true)
            {
                if (collection.Find(u => u.Email == Email + atNextMail).ToList().Count() == 0)
                    break;
                Email = user.FirstName.ToLower() + "." + user.LastName.ToLower() + "." + EmailIncreament.ToString();
                EmailIncreament++;
            }
            user.Email = Email + atNextMail;
            collection.InsertOne(user);
            Leaderboard leaderboard = new Leaderboard() { UserID = user._id };
            collectionLeaderboards.InsertOne(leaderboard);
            var collectionDefault = database.GetCollection<DefaultSetting>("DefaultSettings");
            List<DefaultSetting> settingsTemplate = collectionDefault.Find(new BsonDocument()).ToList();
            List<Setting> newUserSettings = new List<Setting>();
            foreach (DefaultSetting setting in settingsTemplate)
                newUserSettings.Add(new Setting()
                {
                    UserID = user._id,
                    Name = setting.Name,
                    Label = setting.Label,
                    Type = setting.Type,
                    Description = setting.Description,
                    Value = setting.Value,
                    ValueNum = setting.ValueNum
                });
            database.GetCollection<Setting>("Settings").InsertMany(newUserSettings);
            return user;
        }
        [Route("api/index/checkemail")]
        [HttpGet]
        public bool checkemail(string email, string userid) {
            var collection = database.GetCollection<User>("Users");
            if (collection.Find(u => u.EmailRegistration == email && u._id != ObjectId.Parse(userid)).ToList().Count() > 0)
                return true;
            return false;
        }
        [Route("api/index/updatebasicinfo")]
        [HttpPost]
        public User updatebasicinfo([FromBody]UserPost user)
        {
            var collection = database.GetCollection<User>("Users");
            User usertemp = new UserConverter().Convert(user);
            User useroldData = collection.Find(u => u._id == usertemp._id).FirstOrDefault();
            usertemp.Password = useroldData.Password;
            usertemp.ProfilePic = useroldData.ProfilePic;
            usertemp.ProfileCoverPic = useroldData.ProfileCoverPic;
            usertemp.Attempts = useroldData.Attempts;
            usertemp.ChallengesAnswered = useroldData.ChallengesAnswered;
            usertemp.ChatStatus = useroldData.ChatStatus;
            string Email = usertemp.FirstName.ToLower() + "." + usertemp.LastName.ToLower();
            if ((Email + atNextMail) != user.Email)
            {
                int EmailIncreament = 1;
                while (true)
                {
                    if (collection.Find(u => u.Email == Email + atNextMail).ToList().Count() == 0)
                        break;
                    Email = usertemp.FirstName.ToLower() + "." + usertemp.LastName.ToLower() + "." + EmailIncreament.ToString();
                    EmailIncreament++;
                }
                usertemp.Email = Email + atNextMail;
            }
            collection.ReplaceOne(u => u._id == usertemp._id, usertemp);
            return usertemp;
        }
        [Route("api/index/updatechatstatus")]
        [HttpPut]
        public long updatechatstatus(string userid, string chatstatus)
        {
            var collection = database.GetCollection<User>("Users");
            var update = Builders<User>.Update.Set(u => u.ChatStatus, chatstatus);
            return collection.UpdateOne(u => u._id == ObjectId.Parse(userid), update).ModifiedCount;
        }
        [Route("api/index/updateattempts")]
        [HttpPut]
        public long updateattempts(string userid, int attemptscount)
        {
            var collection = database.GetCollection<User>("Users");
            var update = Builders<User>.Update.Set(u => u.Attempts, attemptscount);
            return collection.UpdateOne(u => u._id == ObjectId.Parse(userid), update).ModifiedCount;
        }
        [Route("api/index/retrieveattemptscount")]
        [HttpGet]
        public int retrieveattemptscount(string userid)
        {
            var collection = database.GetCollection<User>("Users");
            User user = (from u in collection.AsQueryable()
                         where u._id == ObjectId.Parse(userid)
                         select u).FirstOrDefault();
            return user.Attempts;
        }
        [Route("api/index/updatechallengesanswered")]
        [HttpPut]
        public long updatechallengesanswered(string userid, int challengesanswered)
        {
            var collection = database.GetCollection<User>("Users");
            var update = Builders<User>.Update.Set(u => u.ChallengesAnswered, challengesanswered);
            return collection.UpdateOne(u => u._id == ObjectId.Parse(userid), update).ModifiedCount;
        }
        [Route("api/index/retrievechallengesanswered")]
        [HttpGet]
        public int retrievechallengesanswered(string userid)
        {
            var collection = database.GetCollection<User>("Users");
            User user = (from u in collection.AsQueryable()
                         where u._id == ObjectId.Parse(userid)
                         select u).FirstOrDefault();
            return user.ChallengesAnswered;
        }
        [Route("api/index/updateprofilepic")]
        [HttpPost]
        public async Task<HttpResponseMessage> updateprofilepic()
        {
            var collection = database.GetCollection<User>("Users");
            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);
            await Request.Content.ReadAsMultipartAsync(provider);
            User user = collection.Find(u => u._id == ObjectId.Parse(provider.FormData["UserID"])).FirstOrDefault();
            user.ProfilePic = new FileManager().UploadFiles(provider, database, root, provider.FormData["FileType"], provider.FormData["UserID"]).ElementAt(0);
            collection.ReplaceOne(u => u._id == ObjectId.Parse(provider.FormData["UserID"]), user);
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.SerializeObject(user));
        }
        [Route("api/index/updateprofilecoverpic")]
        [HttpPost]
        public async Task<HttpResponseMessage> updateprofilecoverpic()
        {
            var collection = database.GetCollection<User>("Users");
            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);
            await Request.Content.ReadAsMultipartAsync(provider);
            User user = collection.Find(u => u._id == ObjectId.Parse(provider.FormData["UserID"])).FirstOrDefault();
            user.ProfileCoverPic = new FileManager().UploadFiles(provider, database, root, provider.FormData["FileType"], provider.FormData["UserID"]).ElementAt(0);
            collection.ReplaceOne(u => u._id == ObjectId.Parse(provider.FormData["UserID"]), user);
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.SerializeObject(user));
        }
        [Route("api/index/login")]
        [HttpGet]
        public UserDetailed login(string email, string password)
        {
            var collection = database.GetCollection<User>("Users");
            var collectionFriendship = database.GetCollection<Friendship>("Friendships");
            UserDetailed user = (from u in collection.AsQueryable()
                                 where (u.EmailRegistration == email || u.Email == email) && u.Password == password
                                 select new UserDetailed()
                                 {
                                     _id = u._id,
                                     FirstName = u.FirstName,
                                     LastName = u.LastName,
                                     Email = u.Email,
                                     EmailRegistration = u.EmailRegistration,
                                     DateOfBirth = u.DateOfBirth,
                                     Gender = u.Gender,
                                     City = u.City,
                                     AboutMe = u.AboutMe,
                                     ChatStatus = u.ChatStatus,
                                     Attempts = u.Attempts,
                                     ChallengesAnswered = u.ChallengesAnswered,
                                     ProfilePic = u.ProfilePic,
                                     ProfileCoverPic = u.ProfileCoverPic
                                 }).FirstOrDefault();
            if (user != null)
            {
                user.FriendsCount = Convert.ToInt32(collectionFriendship.CountDocuments(f => f.FriendshipApproved && (f.FriendshipStarterUserId == user._id || f.FriendUserId == user._id)));
                user.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == user._id orderby c.CreateDateTime descending select c).FirstOrDefault();
                user.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == user._id orderby c.CreateDateTime descending select c).FirstOrDefault();
            }

            return user;
        }
        [Route("api/index/sendemail")]
        [HttpGet]
        public string sendemail()
        {
            return new SendEmail().Send();
        }
        [Route("api/index/retrievelogonupdate")]
        [HttpGet]
        public UserDetailed retrievelogonupdate(string userid)
        {
            var collection = database.GetCollection<User>("Users");
            var collectionFriendship = database.GetCollection<Friendship>("Friendships");
            UserDetailed user = (from u in collection.AsQueryable()
                                 where u._id == ObjectId.Parse(userid)
                                 select new UserDetailed()
                                 {
                                     _id = u._id,
                                     FirstName = u.FirstName,
                                     LastName = u.LastName,
                                     Email = u.Email,
                                     EmailRegistration = u.EmailRegistration,
                                     DateOfBirth = u.DateOfBirth,
                                     Gender = u.Gender,
                                     City = u.City,
                                     AboutMe = u.AboutMe,
                                     ChatStatus = u.ChatStatus,
                                     Attempts = u.Attempts,
                                     ChallengesAnswered = u.ChallengesAnswered,
                                     ProfilePic = u.ProfilePic,
                                     ProfileCoverPic = u.ProfileCoverPic
                                 }).FirstOrDefault();
            user.FriendsCount = Convert.ToInt32(collectionFriendship.CountDocuments(f => f.FriendshipApproved && (f.FriendshipStarterUserId == user._id || f.FriendUserId == user._id)));
            user.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == user._id orderby c.CreateDateTime descending select c).FirstOrDefault();
            user.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == user._id orderby c.CreateDateTime descending select c).FirstOrDefault();
            return user;
        }
        [Route("api/index/retrieveuser")]
        [HttpGet]
        public UserViewProfile retrieveuser(string name, string viewername)
        {
            var collection = database.GetCollection<User>("Users");
            var collectionFriendship = database.GetCollection<Friendship>("Friendships");
            User viewed = collection.Find(u => u.Email == name + atNextMail).FirstOrDefault();
            User viewer = collection.Find(u => u.Email == viewername + atNextMail).FirstOrDefault();
            if (viewed == null || viewer == null) return null;
            var objects = new ObjectId[] { viewed._id, viewer._id };
            UserViewProfile user = (from u in collection.AsQueryable()
                                    where u._id == viewed._id
                                    select new UserViewProfile()
                                    {
                                        _id = u._id,
                                        FirstName = u.FirstName,
                                        LastName = u.LastName,
                                        Email = u.Email,
                                        EmailRegistration = u.EmailRegistration,
                                        DateOfBirth = u.DateOfBirth,
                                        Gender = u.Gender,
                                        City = u.City,
                                        AboutMe = u.AboutMe,
                                        ChatStatus = u.ChatStatus,
                                        ProfilePic = u.ProfilePic,
                                        ProfileCoverPic = u.ProfileCoverPic
                                    }).FirstOrDefault();
            user.friendships = collectionFriendship.Find(f => objects.Contains(f.FriendshipStarterUserId) && objects.Contains(f.FriendUserId)).ToList();
            user.FriendsCount = Convert.ToInt32(collectionFriendship.CountDocuments(f => f.FriendshipApproved && (f.FriendshipStarterUserId == user._id || f.FriendUserId == user._id)));
            user.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == user._id orderby c.CreateDateTime descending select c).FirstOrDefault();
            user.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == user._id orderby c.CreateDateTime descending select c).FirstOrDefault();
            return user;
        }
        [Route("api/index/retrieveusermininfo")]
        [HttpGet]
        public UserMinInfo retrieveusermininfo(string userid)
        {
            var collection = database.GetCollection<User>("Users");
            return (from u in collection.AsQueryable()
                    where u._id == ObjectId.Parse(userid)
                    select new UserMinInfo()
                    {
                        _id = u._id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        ChatStatus = u.ChatStatus,
                        ProfilePic = u.ProfilePic,
                        ProfileCoverPic = u.ProfileCoverPic
                    }).FirstOrDefault();
        }
        [Route("api/index/updateschools")]
        [HttpPost]
        public List<School> updateschools([FromBody]List<SchoolPost> schools)
        {
            var collectionSchools = database.GetCollection<School>("Schools");
            List<School> schoolsConverted = new SchoolConverter().ConvertMany(schools);
            foreach (School school in schoolsConverted)
            {
                if (school._id == ObjectId.Parse("000000000000000000000000"))
                    collectionSchools.InsertOne(school);
                if (school._id != ObjectId.Parse("000000000000000000000000"))
                    collectionSchools.ReplaceOne(s => s._id == school._id, school);
            }
            return schoolsConverted;
        }
        [Route("api/index/retrieveschools")]
        [HttpGet]
        public List<School> retrieveschools(string userid)
        {
            return database.GetCollection<School>("Schools").Find(s => s.UserID == ObjectId.Parse(userid)).ToList();
        }
        [Route("api/index/deleteschool")]
        [HttpDelete]
        public string deleteschool(string schoolid)
        {
            database.GetCollection<School>("Schools").DeleteOne(s => s._id == ObjectId.Parse(schoolid));
            return "success";
        }
        [Route("api/index/updatecompanies")]
        [HttpPost]
        public List<Company> updatecompanies([FromBody]List<CompanyPost> companies)
        {
            var collectionSchools = database.GetCollection<Company>("Companies");
            List<Company> companiesConverted = new CompanyConverter().ConvertMany(companies);
            foreach (Company company in companiesConverted)
            {
                if (company._id == ObjectId.Parse("000000000000000000000000"))
                    collectionSchools.InsertOne(company);
                if (company._id != ObjectId.Parse("000000000000000000000000"))
                    collectionSchools.ReplaceOne(s => s._id == company._id, company);
            }
            return companiesConverted;
        }
        [Route("api/index/retrievecompanies")]
        [HttpGet]
        public List<Company> retrievecompanies(string userid)
        {
            return database.GetCollection<Company>("Companies").Find(s => s.UserID == ObjectId.Parse(userid)).ToList();
        }
        [Route("api/index/deletecompany")]
        [HttpDelete]
        public string deletecompany(string companyid)
        {
            database.GetCollection<Company>("Companies").DeleteOne(s => s._id == ObjectId.Parse(companyid));
            return "success";
        }
        [Route("api/index/createinterest")]
        [HttpPost]
        public Interest createinterest([FromBody]InterestPost interest)
        {
            Interest interestConverted = new InterestConverter().Convert(interest);
            var collection = database.GetCollection<Interest>("Interests");
            collection.InsertOne(interestConverted);
            return interestConverted;
        }
        [Route("api/index/retrieveinterests")]
        [HttpGet]
        public List<Interest> retrieveinterests(string userid)
        {
            return database.GetCollection<Interest>("Interests").Find(i => i.UserID == ObjectId.Parse(userid)).ToList();
        }
        [Route("api/index/deleteinterest")]
        [HttpDelete]
        public string deleteinterest(string interestid)
        {
            database.GetCollection<Interest>("Interests").DeleteOne(i => i._id == ObjectId.Parse(interestid));
            return "success";
        }
        [Route("api/index/retrieveabout")]
        [HttpGet]
        public About retrieveabout(string userid)
        {
            return new About()
            {
                BasicInfo = (from u in database.GetCollection<User>("Users").AsQueryable()
                             where u._id == ObjectId.Parse(userid)
                             select new UserBasicInfo()
                             {
                                 _id = u._id,
                                 FirstName = u.FirstName,
                                 LastName = u.LastName,
                                 Email = u.Email,
                                 EmailRegistration = u.EmailRegistration,
                                 DateOfBirth = u.DateOfBirth,
                                 Gender = u.Gender,
                                 City = u.City,
                                 AboutMe = u.AboutMe
                             }).FirstOrDefault(),
                Work = retrievecompanies(userid),
                Education = retrieveschools(userid),
                Interests = retrieveinterests(userid)
            };
        }
        [Route("api/index/createpost")]
        [HttpPost]
        public async Task<HttpResponseMessage> createpost()
        {

            var collectionPosts = database.GetCollection<Post>("Posts");
            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);
            await Request.Content.ReadAsMultipartAsync(provider);
            Post post = new Post();
            post.PostContent = provider.FormData["PostContent"];
            post.Files = new FileManager().UploadFiles(provider, database, root, provider.FormData["FileType"], provider.FormData["UserID"]);
            post.FileType = provider.FormData["FileType"];
            post.UserID = ObjectId.Parse(provider.FormData["UserID"]);
            post.TimelineUserID = ObjectId.Parse(provider.FormData["TimelineUserID"]);
            post.PostOnTimeline = provider.FormData["PostOnTimeline"] == "true";
            post.CreateDateTime = DateTime.Now;
            collectionPosts.InsertOne(post);
            createactivity(new ActivityPost() {
                UserID = post.UserID.ToString(),
                Content = "published a challenge",
                ActivityType = "POST_PUBLISH",
                _redirect = post._id.ToString()
            }); ;
            return Request.CreateResponse(HttpStatusCode.OK, "success");
        }
        [Route("api/index/deletepost")]
        [HttpDelete]
        public string deletepost(string postid)
        {
            var collection = database.GetCollection<Post>("Posts");
            collection.DeleteOne(p => p._id == ObjectId.Parse(postid));
            return "success";
        }
        [Route("api/index/retrieveposts")]
        [HttpGet]
        public List<PostDetailed> retrieveposts(string userid)
        {
            var collectionPosts = database.GetCollection<Post>("Posts");
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionPostLikes = database.GetCollection<PostLike>("PostLikes");
            var collectionPostDisLikes = database.GetCollection<PostDisLike>("PostDisLikes");

            List<PostDetailed> posts = new List<PostDetailed>();

            List<Setting> settings = retrievesettings(userid);
            if (!settings.Find(s => s.Name == "VIEW_POSTS").Value)
            {
                List<FriendshipDetailed> friendships = retrievefriendshipsall(userid);
                ObjectId[] friendsids = new ObjectId[friendships.Count];
                for (int i = 0; i < friendships.Count; i++)
                {
                    if (friendships.ElementAt(i).FriendshipStarterUserId != ObjectId.Parse(userid))
                    {
                        friendsids[i] = friendships.ElementAt(i).FriendshipStarterUserId;
                    }
                    else
                    {
                        friendsids[i] = friendships.ElementAt(i).FriendUserId;
                    }
                }
                posts = (from p in collectionPosts.AsQueryable()
                         join u in collectionUsers.AsQueryable() on p.UserID equals u._id into user
                         where !p.PostOnTimeline && p.UserID != ObjectId.Parse(userid) && friendsids.Contains(p.UserID)
                         orderby p.CreateDateTime descending
                         select new PostDetailed()
                         {
                             _id = p._id,
                             PostContent = p.PostContent,
                             FileType = p.FileType,
                             UserID = p.UserID,
                             CreateDateTime = p.CreateDateTime,
                             DateTimeNow = DateTime.Now,
                             Files = p.Files,
                             TimelineUserID = p.TimelineUserID,
                             PostOnTimeline = p.PostOnTimeline,
                             Users = (List<User>)user
                         }).Take(4).ToList();
            }
            else
            {
                posts = (from p in collectionPosts.AsQueryable()
                         join u in collectionUsers.AsQueryable() on p.UserID equals u._id into user
                         where !p.PostOnTimeline && p.UserID != ObjectId.Parse(userid)
                         orderby p.CreateDateTime descending
                         select new PostDetailed()
                         {
                             _id = p._id,
                             PostContent = p.PostContent,
                             FileType = p.FileType,
                             UserID = p.UserID,
                             CreateDateTime = p.CreateDateTime,
                             DateTimeNow = DateTime.Now,
                             Files = p.Files,
                             TimelineUserID = p.TimelineUserID,
                             PostOnTimeline = p.PostOnTimeline,
                             Users = (List<User>)user
                         }).Take(4).ToList();
            }

            for (int i = 0; i < posts.Count; i++)
            {
                posts.ElementAt(i).Comments = retrievecomments(posts.ElementAt(i)._id.ToString());
                posts.ElementAt(i).CommentsCount = Convert.ToInt32(collectionComments.CountDocuments(c => c.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).LikesCount = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).DislikesCount = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).PostLiked = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id && d.UserID == ObjectId.Parse(userid))) > 0;
                posts.ElementAt(i).PostDisLiked = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id && d.UserID == ObjectId.Parse(userid))) > 0;
            }
            return posts;
        }
        [Route("api/index/retrievepostsafter")]
        [HttpGet]
        public List<PostDetailed> retrievepostsafter(string postid, string userid)
        {
            var collectionPosts = database.GetCollection<Post>("Posts");
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionPostLikes = database.GetCollection<PostLike>("PostLikes");
            var collectionPostDisLikes = database.GetCollection<PostDisLike>("PostDisLikes");
            ObjectId objecto = ObjectId.Parse(postid);
            Post post = collectionPosts.Find(new BsonDocument("_id", objecto)).FirstOrDefault();
            List<PostDetailed> posts = new List<PostDetailed>();
            List<Setting> settings = retrievesettings(userid);
            if (!settings.Find(s => s.Name == "VIEW_POSTS").Value)
            {
                List<FriendshipDetailed> friendships = retrievefriendshipsall(userid);
                ObjectId[] friendsids = new ObjectId[friendships.Count];
                for (int i = 0; i < friendships.Count; i++)
                {
                    if (friendships.ElementAt(i).FriendshipStarterUserId != ObjectId.Parse(userid))
                    {
                        friendsids[i] = friendships.ElementAt(i).FriendshipStarterUserId;
                    }
                    else
                    {
                        friendsids[i] = friendships.ElementAt(i).FriendUserId;
                    }
                }
                posts = (from p in collectionPosts.AsQueryable()
                         join u in collectionUsers.AsQueryable() on p.UserID equals u._id into user
                         where p.CreateDateTime < post.CreateDateTime && !p.PostOnTimeline && p.UserID != ObjectId.Parse(userid) && friendsids.Contains(p.UserID)
                         orderby p.CreateDateTime descending
                         select new PostDetailed()
                         {
                             _id = p._id,
                             PostContent = p.PostContent,
                             FileType = p.FileType,
                             UserID = p.UserID,
                             CreateDateTime = p.CreateDateTime,
                             DateTimeNow = DateTime.Now,
                             Files = p.Files,
                             TimelineUserID = p.TimelineUserID,
                             PostOnTimeline = p.PostOnTimeline,
                             Users = (List<User>)user
                         }).Take(4).ToList();
            }
            else
            {
                posts = (from p in collectionPosts.AsQueryable()
                         join u in collectionUsers.AsQueryable() on p.UserID equals u._id into user
                         where p.CreateDateTime < post.CreateDateTime && !p.PostOnTimeline && p.UserID != ObjectId.Parse(userid)
                         orderby p.CreateDateTime descending
                         select new PostDetailed()
                         {
                             _id = p._id,
                             PostContent = p.PostContent,
                             FileType = p.FileType,
                             UserID = p.UserID,
                             CreateDateTime = p.CreateDateTime,
                             DateTimeNow = DateTime.Now,
                             Files = p.Files,
                             TimelineUserID = p.TimelineUserID,
                             PostOnTimeline = p.PostOnTimeline,
                             Users = (List<User>)user
                         }).Take(4).ToList();
            }
            for (int i = 0; i < posts.Count; i++)
            {
                posts.ElementAt(i).Comments = retrievecomments(posts.ElementAt(i)._id.ToString());
                posts.ElementAt(i).CommentsCount = Convert.ToInt32(collectionComments.CountDocuments(c => c.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).LikesCount = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).DislikesCount = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).PostLiked = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id && d.UserID == ObjectId.Parse(userid))) > 0;
                posts.ElementAt(i).PostDisLiked = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id && d.UserID == ObjectId.Parse(userid))) > 0;

            }
            return posts;
        }
        [Route("api/index/retrievetimelineposts")]
        [HttpGet]
        public List<PostDetailed> retrievetimelineposts(string userid, string timelineuserid)
        {
            var collectionPosts = database.GetCollection<Post>("Posts");
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionPostLikes = database.GetCollection<PostLike>("PostLikes");
            var collectionPostDisLikes = database.GetCollection<PostDisLike>("PostDisLikes");

            List<PostDetailed> posts = (from p in collectionPosts.AsQueryable()
                                        join u in collectionUsers.AsQueryable() on p.UserID equals u._id into user
                                        where p.TimelineUserID == ObjectId.Parse(timelineuserid)
                                        orderby p.CreateDateTime descending
                                        select new PostDetailed()
                                        {
                                            _id = p._id,
                                            PostContent = p.PostContent,
                                            FileType = p.FileType,
                                            UserID = p.UserID,
                                            CreateDateTime = p.CreateDateTime,
                                            DateTimeNow = DateTime.Now,
                                            Files = p.Files,
                                            TimelineUserID = p.TimelineUserID,
                                            PostOnTimeline = p.PostOnTimeline,
                                            Users = (List<User>)user
                                        }).Take(4).ToList();
            for (int i = 0; i < posts.Count; i++)
            {
                posts.ElementAt(i).Comments = retrievecomments(posts.ElementAt(i)._id.ToString());
                posts.ElementAt(i).CommentsCount = Convert.ToInt32(collectionComments.CountDocuments(c => c.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).LikesCount = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).DislikesCount = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).PostLiked = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id && d.UserID == ObjectId.Parse(userid))) > 0;
                posts.ElementAt(i).PostDisLiked = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id && d.UserID == ObjectId.Parse(userid))) > 0;
            }
            return posts;
        }
        [Route("api/index/retrievetimelinepostsafter")]
        [HttpGet]
        public List<PostDetailed> retrievetimelinepostsafter(string postid, string userid, string timelineuserid)
        {
            var collectionPosts = database.GetCollection<Post>("Posts");
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionPostLikes = database.GetCollection<PostLike>("PostLikes");
            var collectionPostDisLikes = database.GetCollection<PostDisLike>("PostDisLikes");
            ObjectId objecto = ObjectId.Parse(postid);
            Post post = collectionPosts.Find(new BsonDocument("_id", objecto)).FirstOrDefault();

            List<PostDetailed> posts = (from p in collectionPosts.AsQueryable()
                                        join u in collectionUsers.AsQueryable() on p.UserID equals u._id into user
                                        where p.CreateDateTime < post.CreateDateTime && p.TimelineUserID == ObjectId.Parse(timelineuserid)
                                        orderby p.CreateDateTime descending
                                        select new PostDetailed()
                                        {
                                            _id = p._id,
                                            PostContent = p.PostContent,
                                            FileType = p.FileType,
                                            UserID = p.UserID,
                                            CreateDateTime = p.CreateDateTime,
                                            DateTimeNow = DateTime.Now,
                                            Files = p.Files,
                                            TimelineUserID = p.TimelineUserID,
                                            PostOnTimeline = p.PostOnTimeline,
                                            Users = (List<User>)user
                                        }).Take(4).ToList();
            for (int i = 0; i < posts.Count; i++)
            {
                posts.ElementAt(i).Comments = retrievecomments(posts.ElementAt(i)._id.ToString());
                posts.ElementAt(i).CommentsCount = Convert.ToInt32(collectionComments.CountDocuments(c => c.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).LikesCount = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).DislikesCount = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id));
                posts.ElementAt(i).PostLiked = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id && d.UserID == ObjectId.Parse(userid))) > 0;
                posts.ElementAt(i).PostDisLiked = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == posts.ElementAt(i)._id && d.UserID == ObjectId.Parse(userid))) > 0;

            }
            return posts;
        }
        [Route("api/index/retrievepost")]
        [HttpGet]
        public PostDetailed retrievepost(string postid, string userid)
        {
            var collectionPosts = database.GetCollection<Post>("Posts");
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionPostLikes = database.GetCollection<PostLike>("PostLikes");
            var collectionPostDisLikes = database.GetCollection<PostDisLike>("PostDisLikes");
            try
            {
                ObjectId objecto = ObjectId.Parse(postid);

                PostDetailed post = (from p in collectionPosts.AsQueryable()
                                     join u in collectionUsers.AsQueryable() on p.UserID equals u._id into user
                                     where p._id == objecto
                                     orderby p.CreateDateTime descending
                                     select new PostDetailed()
                                     {
                                         _id = p._id,
                                         PostContent = p.PostContent,
                                         FileType = p.FileType,
                                         UserID = p.UserID,
                                         CreateDateTime = p.CreateDateTime,
                                         DateTimeNow = DateTime.Now,
                                         Files = p.Files,
                                         TimelineUserID = p.TimelineUserID,
                                         PostOnTimeline = p.PostOnTimeline,
                                         Users = (List<User>)user
                                     }).FirstOrDefault();
                post.Comments = retrievecomments(post._id.ToString());
                post.CommentsCount = Convert.ToInt32(collectionComments.CountDocuments(c => c.PostID == post._id));
                post.LikesCount = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == post._id));
                post.DislikesCount = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == post._id));
                post.PostLiked = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == post._id && d.UserID == ObjectId.Parse(userid))) > 0;
                post.PostDisLiked = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == post._id && d.UserID == ObjectId.Parse(userid))) > 0;

                return post;
            }
            catch (Exception ex)
            {
                ex.ToString();
                return null;
            }

        }
        [Route("api/index/createcomment")]
        [HttpPost]
        public async Task<HttpResponseMessage> createcomment()
        {
            var collectionComments = database.GetCollection<Comment>("Comments");
            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);
            await Request.Content.ReadAsMultipartAsync(provider);
            Comment comment = new Comment();
            comment.PostID = ObjectId.Parse(provider.FormData["PostID"]);
            comment.CommentContent = provider.FormData["CommentContent"];
            comment.Files = new FileManager().UploadFiles(provider, database, root, provider.FormData["FileType"], provider.FormData["UserID"]);
            comment.FileType = provider.FormData["FileType"];
            comment.UserID = ObjectId.Parse(provider.FormData["UserID"]);
            comment.CreateDateTime = DateTime.Now;
            collectionComments.InsertOne(comment);

            return Request.CreateResponse(HttpStatusCode.OK, "success");
        }
        [Route("api/index/deletecomment")]
        [HttpDelete]
        public string deletecomment(string commentid)
        {
            var collection = database.GetCollection<Comment>("Comments");
            collection.DeleteOne(p => p._id == ObjectId.Parse(commentid));
            return "success";
        }
        [Route("api/index/retrievecomments")]
        [HttpGet]
        public List<CommentDetailed> retrievecomments(string postid)
        {
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionUsers = database.GetCollection<User>("Users");

            return (from c in collectionComments.AsQueryable()
                    join u in collectionUsers.AsQueryable() on c.UserID equals u._id into user
                    where c.PostID == ObjectId.Parse(postid)
                    orderby c.CreateDateTime descending
                    select new CommentDetailed()
                    {
                        _id = c._id,
                        PostID = c.PostID,
                        FileType = c.FileType,
                        CommentContent = c.CommentContent,
                        UserID = c.UserID,
                        CreateDateTime = c.CreateDateTime,
                        DateTimeNow = DateTime.Now,
                        Files = c.Files,
                        Users = (List<User>)user
                    }).Take(8).ToList();
        }
        [Route("api/index/retrievecommentsafter")]
        [HttpGet]
        public List<CommentDetailed> retrievecommentsafter(string commentid, string postid)
        {
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionUsers = database.GetCollection<User>("Users");
            ObjectId objecto = ObjectId.Parse(commentid);
            Comment comment = collectionComments.Find(new BsonDocument("_id", objecto)).FirstOrDefault();

            return (from c in collectionComments.AsQueryable()
                    join u in collectionUsers.AsQueryable() on c.UserID equals u._id into user
                    where c.PostID == ObjectId.Parse(postid) && c.CreateDateTime < comment.CreateDateTime
                    orderby c.CreateDateTime descending
                    select new CommentDetailed()
                    {
                        _id = c._id,
                        PostID = c.PostID,
                        FileType = c.FileType,
                        CommentContent = c.CommentContent,
                        UserID = c.UserID,
                        CreateDateTime = c.CreateDateTime,
                        DateTimeNow = DateTime.Now,
                        Files = c.Files,
                        Users = (List<User>)user
                    }).Take(8).ToList();
        }
        [Route("api/index/retrievecommentslatest")]
        [HttpGet]
        public List<CommentDetailed> retrievecommentslatest(string commentid, string postid)
        {
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionUsers = database.GetCollection<User>("Users");
            if (commentid != "none")
            {
                ObjectId objecto = ObjectId.Parse(commentid);
                Comment comment = collectionComments.Find(new BsonDocument("_id", objecto)).FirstOrDefault();

                return (from c in collectionComments.AsQueryable()
                        join u in collectionUsers.AsQueryable() on c.UserID equals u._id into user
                        where c.PostID == ObjectId.Parse(postid) && c.CreateDateTime > comment.CreateDateTime
                        orderby c.CreateDateTime descending
                        select new CommentDetailed()
                        {
                            _id = c._id,
                            PostID = c.PostID,
                            FileType = c.FileType,
                            CommentContent = c.CommentContent,
                            UserID = c.UserID,
                            CreateDateTime = c.CreateDateTime,
                            DateTimeNow = DateTime.Now,
                            Files = c.Files,
                            Users = (List<User>)user
                        }).ToList();
            }
            else
            {
                return (from c in collectionComments.AsQueryable()
                        join u in collectionUsers.AsQueryable() on c.UserID equals u._id into user
                        where c.PostID == ObjectId.Parse(postid)
                        orderby c.CreateDateTime descending
                        select new CommentDetailed()
                        {
                            _id = c._id,
                            PostID = c.PostID,
                            FileType = c.FileType,
                            CommentContent = c.CommentContent,
                            UserID = c.UserID,
                            CreateDateTime = c.CreateDateTime,
                            DateTimeNow = DateTime.Now,
                            Files = c.Files,
                            Users = (List<User>)user
                        }).ToList();

            }

        }
        [Route("api/index/retrievecommentlatest")]
        [HttpGet]
        public CommentDetailed retrievecommentlatest(string postid, string topofcommentid)
        {
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionUsers = database.GetCollection<User>("Users");
            ObjectId objecto = ObjectId.Parse(postid);
            if (topofcommentid == null || topofcommentid == "")
            {
                return (from c in collectionComments.AsQueryable()
                        join u in collectionUsers.AsQueryable() on c.UserID equals u._id into user
                        where c.PostID == objecto
                        orderby c.CreateDateTime descending
                        select new CommentDetailed()
                        {
                            _id = c._id,
                            PostID = c.PostID,
                            FileType = c.FileType,
                            CommentContent = c.CommentContent,
                            UserID = c.UserID,
                            CreateDateTime = c.CreateDateTime,
                            DateTimeNow = DateTime.Now,
                            Files = c.Files,
                            Users = (List<User>)user
                        }).Take(1).FirstOrDefault();
            }
            else
            {
                Comment comment = collectionComments.Find(c => c._id == ObjectId.Parse(topofcommentid)).FirstOrDefault();
                return (from c in collectionComments.AsQueryable()
                        join u in collectionUsers.AsQueryable() on c.UserID equals u._id into user
                        where c.PostID == objecto && c.CreateDateTime > comment.CreateDateTime
                        orderby c.CreateDateTime descending
                        select new CommentDetailed()
                        {
                            _id = c._id,
                            PostID = c.PostID,
                            FileType = c.FileType,
                            CommentContent = c.CommentContent,
                            UserID = c.UserID,
                            CreateDateTime = c.CreateDateTime,
                            DateTimeNow = DateTime.Now,
                            Files = c.Files,
                            Users = (List<User>)user
                        }).Take(1).FirstOrDefault();
            }

        }
        [Route("api/index/dislikepost")]
        [HttpPost]
        public int dislikepost(string postid, string userid)
        {
            var collectionPostDisLikes = database.GetCollection<PostDisLike>("PostDisLikes");
            collectionPostDisLikes.InsertOne(new PostDisLike() { PostID = ObjectId.Parse(postid), UserID = ObjectId.Parse(userid), CreateDateTime = DateTime.Now });
            return Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == ObjectId.Parse(postid)));
        }
        [Route("api/index/deletepostdislike")]
        [HttpDelete]
        public int deletepostdislike(string postid, string userid)
        {
            PostDisLike postDisLike = new PostDisLike() { PostID = ObjectId.Parse(postid), UserID = ObjectId.Parse(userid) };
            var collectionPostDisLikes = database.GetCollection<PostDisLike>("PostDisLikes");
            collectionPostDisLikes.DeleteOne(d => d.PostID == postDisLike.PostID && d.UserID == postDisLike.UserID);
            return Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == postDisLike.PostID));
        }
        [Route("api/index/likepost")]
        [HttpPost]
        public int likepost(string postid, string userid)
        {
            var collectionPostLikes = database.GetCollection<PostLike>("PostLikes");
            collectionPostLikes.InsertOne(new PostLike() { PostID = ObjectId.Parse(postid), UserID = ObjectId.Parse(userid), CreateDateTime = DateTime.Now });
            return Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == ObjectId.Parse(postid)));
        }
        [Route("api/index/deletepostlike")]
        [HttpDelete]
        public int deletepostlike(string postid, string userid)
        {
            PostLike postDisLike = new PostLike() { PostID = ObjectId.Parse(postid), UserID = ObjectId.Parse(userid) };
            var collectionPostLikes = database.GetCollection<PostLike>("PostLikes");
            collectionPostLikes.DeleteOne(d => d.PostID == postDisLike.PostID && d.UserID == postDisLike.UserID);
            return Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == postDisLike.PostID));
        }

        [Route("api/index/createmessage")]
        [HttpPost]
        public async Task<HttpResponseMessage> createmessage()
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);
            await Request.Content.ReadAsMultipartAsync(provider);
            Message message = new Message();
            message.MessageContent = provider.FormData["MessageContent"];
            message.Files = new FileManager().UploadFiles(provider, database, root, provider.FormData["FileType"], provider.FormData["FromUserID"]);
            message.FileType = provider.FormData["FileType"];
            message.FromUserID = ObjectId.Parse(provider.FormData["FromUserID"]);
            message.ToUserID = ObjectId.Parse(provider.FormData["ToUserID"]);
            message.CreateDateTime = DateTime.Now;
            message.MessageRead = false;
            collectionMessages.InsertOne(message);
            var collectionUsers = database.GetCollection<User>("Users");
            MessageDetailed detailedMessage = (from m in collectionMessages.AsQueryable()
                                               join u in collectionUsers.AsQueryable() on m.FromUserID equals u._id into fromusers
                                               join u2 in collectionUsers.AsQueryable() on m.ToUserID equals u2._id into tousers
                                               where m._id == message._id
                                               select new MessageDetailed()
                                               {
                                                   _id = m._id,
                                                   MessageRead = m.MessageRead,
                                                   FileType = m.FileType,
                                                   MessageContent = m.MessageContent,
                                                   FromUserID = m.FromUserID,
                                                   ToUserID = m.ToUserID,
                                                   CreateDateTime = m.CreateDateTime,
                                                   DateTimeNow = DateTime.Now,
                                                   Files = m.Files,
                                                   FromUsers = (List<UserMinInfo>)fromusers,
                                                   ToUsers = (List<UserMinInfo>)tousers
                                               }).FirstOrDefault();
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.SerializeObject(detailedMessage));
        }
        [Route("api/index/markmessagesasread")]
        [HttpPut]
        public long markmessagesasread(string from, string to)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            var collectionUsers = database.GetCollection<User>("Users");
            User fromuser = collectionUsers.Find(u => u.Email == from + atNextMail).FirstOrDefault();
            User touser = collectionUsers.Find(u => u.Email == to + atNextMail).FirstOrDefault();
            var update = Builders<Message>.Update.Set(m => m.MessageRead, true);
            return collectionMessages.UpdateMany(m => m.FromUserID == fromuser._id && m.ToUserID == touser._id, update).ModifiedCount;
        }
        [Route("api/index/markmessageasdeleted")]
        [HttpPut]
        public string markmessageasdeleted(string messageid, string deletefor)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            Message message = collectionMessages.Find(m => m._id == ObjectId.Parse(messageid)).FirstOrDefault();
            if (message != null)
            {
                if (message.DeleteFor != null || !message.MessageRead)
                {
                    collectionMessages.DeleteOne(m => m._id == ObjectId.Parse(messageid));
                }
                else
                {
                    var update = Builders<Message>.Update.Set(m => m.DeleteFor, deletefor);
                    collectionMessages.UpdateOne(m => m._id == ObjectId.Parse(messageid), update);
                }
            }
            return "success";
        }
        [Route("api/index/retrievemessages")]
        [HttpGet]
        public List<MessageDetailed> retrievemessages(string userone, string usertwo, string retriever)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            var collectionUsers = database.GetCollection<UserMinInfo>("Users");
            UserMinInfo user = collectionUsers.Find(u => u.Email == userone + atNextMail).FirstOrDefault();
            UserMinInfo user2 = collectionUsers.Find(u => u.Email == usertwo + atNextMail).FirstOrDefault();
            if (user._id == null || user2._id == null) return new List<MessageDetailed>();
            var inq = new ObjectId[] { user._id, user2._id };
            List<MessageDetailed> messages = (from m in collectionMessages.AsQueryable()
                                              join u in collectionUsers.AsQueryable() on m.FromUserID equals u._id into fromusers
                                              join u2 in collectionUsers.AsQueryable() on m.ToUserID equals u2._id into tousers
                                              where inq.Contains(m.FromUserID) && inq.Contains(m.ToUserID) && m.DeleteFor != retriever
                                              orderby m.CreateDateTime descending
                                              select new MessageDetailed()
                                              {
                                                  _id = m._id,
                                                  MessageRead = m.MessageRead,
                                                  FileType = m.FileType,
                                                  MessageContent = m.MessageContent,
                                                  FromUserID = m.FromUserID,
                                                  ToUserID = m.ToUserID,
                                                  CreateDateTime = m.CreateDateTime,
                                                  DateTimeNow = DateTime.Now,
                                                  Files = m.Files,
                                                  FromUsers = (List<UserMinInfo>)fromusers,
                                                  ToUsers = (List<UserMinInfo>)tousers
                                              }).Take(12).ToList().OrderBy(m => m.CreateDateTime).ToList();
            return messages;
        }
        [Route("api/index/retrievemessagesafter")]
        [HttpGet]
        public List<MessageDetailed> retrievemessagesafter(string userone, string usertwo, string lastmessageid, string retriever)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            var collectionUsers = database.GetCollection<UserMinInfo>("Users");
            UserMinInfo user = collectionUsers.Find(u => u.Email == userone + atNextMail).FirstOrDefault();
            UserMinInfo user2 = collectionUsers.Find(u => u.Email == usertwo + atNextMail).FirstOrDefault();
            if (user._id == null || user2._id == null) return new List<MessageDetailed>();
            var inq = new ObjectId[] { user._id, user2._id };
            Message message = collectionMessages.Find(m => m._id == ObjectId.Parse(lastmessageid)).FirstOrDefault();
            List<MessageDetailed> messages = (from m in collectionMessages.AsQueryable()
                                              join u in collectionUsers.AsQueryable() on m.FromUserID equals u._id into fromusers
                                              join u2 in collectionUsers.AsQueryable() on m.ToUserID equals u2._id into tousers
                                              where inq.Contains(m.FromUserID) && inq.Contains(m.ToUserID) && message.CreateDateTime > m.CreateDateTime && m.DeleteFor != retriever
                                              orderby m.CreateDateTime descending
                                              select new MessageDetailed()
                                              {
                                                  _id = m._id,
                                                  MessageRead = m.MessageRead,
                                                  FileType = m.FileType,
                                                  MessageContent = m.MessageContent,
                                                  FromUserID = m.FromUserID,
                                                  ToUserID = m.ToUserID,
                                                  CreateDateTime = m.CreateDateTime,
                                                  DateTimeNow = DateTime.Now,
                                                  Files = m.Files,
                                                  FromUsers = (List<UserMinInfo>)fromusers,
                                                  ToUsers = (List<UserMinInfo>)tousers
                                              }).Take(12).ToList().OrderBy(m => m.CreateDateTime).ToList();
            return messages;
        }
        [Route("api/index/retrieveundreadmessagescount")]
        [HttpGet]
        public int retrieveundreadmessagescount(string userone, string usertwo)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            return (from m in collectionMessages.AsQueryable()
                    where m.FromUserID == ObjectId.Parse(userone) && m.ToUserID == ObjectId.Parse(usertwo) && !m.MessageRead
                    select m._id
                   ).Count();
        }
        [Route("api/index/retrievelatestmessagebetween")]
        [HttpGet]
        public Message retrievelatestmessagebetween(string userone, string usertwo, string retriever)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            Message messageFrom = (from m in collectionMessages.AsQueryable()
                                   where m.FromUserID == ObjectId.Parse(userone) && m.ToUserID == ObjectId.Parse(usertwo) && m.DeleteFor != retriever
                                   orderby m.CreateDateTime descending
                                   select new Message()
                                   {
                                       _id = m._id,
                                       MessageRead = m.MessageRead,
                                       FileType = m.FileType,
                                       MessageContent = m.MessageContent,
                                       FromUserID = m.FromUserID,
                                       ToUserID = m.ToUserID,
                                       CreateDateTime = m.CreateDateTime,
                                       Files = m.Files
                                   }).FirstOrDefault();
            return messageFrom;
        }
        [Route("api/index/retrieveactivechats")]
        [HttpGet]
        public List<ActiveChat> retrieveactivechats(string userid)
        {
            var collectionUsers = database.GetCollection<UserMinInfo>("Users");
            var collectionMessages = database.GetCollection<Message>("Messages");
            List<ActiveChat> chats = (from m in collectionMessages.AsQueryable()
                                      join u in collectionUsers.AsQueryable() on m.FromUserID equals u._id into fromusers
                                      join u2 in collectionUsers.AsQueryable() on m.ToUserID equals u2._id into tousers
                                      where m.DeleteFor != userid && (m.FromUserID == ObjectId.Parse(userid) || m.ToUserID == ObjectId.Parse(userid))
                                      select new ActiveChat()
                                      {
                                          FromUserId = m.FromUserID,
                                          ToUserId = m.ToUserID,
                                          FromUsers = (List<UserMinInfo>)fromusers,
                                          ToUsers = (List<UserMinInfo>)tousers,
                                          DateTimeNow = DateTime.Now
                                      }
                    ).Distinct().ToList();
            for (int i = 0; i < chats.Count; i++)
            {
                chats.ElementAt(i).LatestMessage = retrievelatestmessagebetween(chats.ElementAt(i).FromUserId.ToString(), chats.ElementAt(i).ToUserId.ToString(), userid);
                chats.ElementAt(i).LastMessageDate = chats.ElementAt(i).LatestMessage.CreateDateTime;
            }
            chats = chats.OrderByDescending(c => c.LastMessageDate).ToList();
            List<ActiveChat> ActiveChat = new List<ActiveChat>();
            foreach (ActiveChat chat in chats)
            {
                var inq = new ObjectId[] { chat.FromUserId, chat.ToUserId };
                if (!ActiveChat.Any(item => inq.Contains(item.FromUserId) && inq.Contains(item.ToUserId)))
                    ActiveChat.Add(chat);
            }

            for (int i = 0; i < ActiveChat.Count; i++)
                if (!chats.ElementAt(i).LatestMessage.FromUserID.ToString().Equals(userid))
                    ActiveChat.ElementAt(i).UnreadMessagesCount = retrieveundreadmessagescount(chats.ElementAt(i).LatestMessage.FromUserID.ToString(), userid);
            return ActiveChat;
        }

        [Route("api/index/createdefaultsessionchallenge")]
        [HttpPost]
        public async Task<HttpResponseMessage> createdefaultsessionchallenge()
        {
            var collectionChallenges = database.GetCollection<DefaultSessionChallenge>("Challenges");
            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);
            await Request.Content.ReadAsMultipartAsync(provider);
            List<FileUpload> files = new FileManager().UploadFiles(provider, database, root, provider.FormData["FileType"], provider.FormData["ChallengeCreatorID"]);
            DateTime datetime = DateTime.Now;
            DefaultSessionChallenge challenge = new DefaultSessionChallenge();
            challenge.Answer = provider.FormData["Answer"];
            challenge.Category = provider.FormData["Category"];
            challenge.CreateDateTime = datetime;
            challenge.Points = Convert.ToInt32(provider.FormData["Points"]);
            challenge.Question = provider.FormData["Question"];
            challenge.ChallengeType = provider.FormData["ChallengeType"];
            challenge._Levels = JsonConvert.DeserializeObject<List<_Level>>(provider.FormData["_Levels"]);
            challenge.MultipleAnswers = JsonConvert.DeserializeObject<List<string>>(provider.FormData["multipleChoice"]);
            challenge.TimeInSeconds = Convert.ToInt32(provider.FormData["TimeInSeconds"]);
            Clue clue = new Clue();
            clue.Type = files.Count > 0 ? files.ElementAt(0).FileType : "none";
            clue.Description = provider.FormData["Description"];
            clue.Files = files;
            clue.Source = provider.FormData["Source"];
            clue.By = provider.FormData["By"];
            clue.Licence = provider.FormData["Licence"];
            clue.LicenceReference = provider.FormData["LicenceReference"];
            challenge.Clue = clue;
            string challengeId = provider.FormData["_id"];
            if (challengeId.Length == 24)
            {
                challenge._id = ObjectId.Parse(challengeId);
                DefaultSessionChallenge challlenge = collectionChallenges.Find(c => c._id == challenge._id).FirstOrDefault();
                if (clue.Files.Count == 0 && clue.Description.ToLower() != "none" && clue.Description.ToLower() != "none.")
                {
                    Clue oldClue = challlenge.Clue;
                    oldClue.Description = clue.Description;
                    oldClue.Source = provider.FormData["Source"];
                    oldClue.By = provider.FormData["By"];
                    oldClue.Licence = provider.FormData["Licence"];
                    oldClue.LicenceReference = provider.FormData["LicenceReference"];
                    challenge.Clue = oldClue;
                }
                challenge.Active = challlenge.Active;
                collectionChallenges.ReplaceOne(c => c._id == challenge._id, challenge);
                return Request.CreateResponse(HttpStatusCode.OK, "success");
            }
            collectionChallenges.InsertOne(challenge);
            return Request.CreateResponse(HttpStatusCode.OK, "success");
        }
        [Route("api/index/deletedefaultsessionchallenge")]
        [HttpDelete]
        public string deletedefaultsessionchallenge(string challengeid)
        {
            var collectionChallenges = database.GetCollection<DefaultSessionChallenge>("Challenges");
            collectionChallenges.DeleteOne(c => c._id == ObjectId.Parse(challengeid));
            return "success";
        }
        [Route("api/index/changedefaultsessionchallengestatus")]
        [HttpPut]
        public string changedefaultsessionchallengestatus(string challengeid, bool status)
        {
            var collectionChallenges = database.GetCollection<DefaultSessionChallenge>("Challenges");
            var update = Builders<DefaultSessionChallenge>.Update.Set(n => n.Active, status);
            collectionChallenges.UpdateOne(n => n._id == ObjectId.Parse(challengeid), update);
            return "success";
        }
        [Route("api/index/changedefaultsessionchallengesstatus")]
        [HttpPut]
        public string changedefaultsessionchallengesstatus(bool status)
        {
            var collectionChallenges = database.GetCollection<DefaultSessionChallenge>("Challenges");
            var update = Builders<DefaultSessionChallenge>.Update.Set(n => n.Active, status);
            collectionChallenges.UpdateMany(n => n.Active != status, update);
            return "success";
        }
        [Route("api/index/retrievedefaultsessionchallengeall")]
        [HttpGet]
        public List<DefaultSessionChallenge> retrievedefaultsessionchallengeall()
        {
            var collectionChallenges = database.GetCollection<DefaultSessionChallenge>("Challenges");
            return collectionChallenges.Find(new BsonDocument()).ToList();
        }
        [Route("api/index/retrievedefaultsessionchallenge")]
        [HttpGet]
        public List<DefaultSessionChallenge> retrievedefaultsessionchallenge()
        {
            var collectionChallenges = database.GetCollection<DefaultSessionChallenge>("Challenges");
            return collectionChallenges.Find(c => c.Active).ToList();
        }
        [Route("api/index/retrievedefaultsessionchallengestats")]
        [HttpGet]
        public DefaultSessionChallengeStats retrievedefaultsessionchallengestats(string challengeid, string userid)
        {
            var collectionPostLikes = database.GetCollection<PostLike>("PostLikes");
            var collectionPostDisLikes = database.GetCollection<PostDisLike>("PostDisLikes");
            DefaultSessionChallengeStats stats = new DefaultSessionChallengeStats();
            stats.LikesCount = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == ObjectId.Parse(challengeid)));
            stats.DislikesCount = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == ObjectId.Parse(challengeid)));
            stats.PostLiked = Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == ObjectId.Parse(challengeid) && d.UserID == ObjectId.Parse(userid))) > 0;
            stats.PostDisLiked = Convert.ToInt32(collectionPostDisLikes.CountDocuments(d => d.PostID == ObjectId.Parse(challengeid) && d.UserID == ObjectId.Parse(userid))) > 0;
            return stats;
        }
        [Route("api/index/uploadfiles")]
        [HttpPost]
        public async Task<HttpResponseMessage> uploadfiles()
        {
            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);
            await Request.Content.ReadAsMultipartAsync(provider);
            List<FileUpload> files = new FileManager().UploadFiles(provider, database, root, provider.FormData["FileType"], provider.FormData["FileUploaderID"]);
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.SerializeObject(files));
        }
        [Route("api/index/deletefile")]
        [HttpDelete]
        public string deletefile(string fileid)
        {
            var collection = database.GetCollection<FileUpload>("Files");
            FileUpload file = collection.Find(f => f._id == ObjectId.Parse(fileid)).FirstOrDefault();
            if (file != null)
            {
                var collectionUser = database.GetCollection<User>("Users");
                User user = collectionUser.Find(u => u._id == file.UserID).FirstOrDefault();
                if (user.ProfilePic != null)
                    if (user.ProfilePic._id == file._id)
                    {
                        user.ProfilePic = null;
                        collectionUser.ReplaceOne(u => u._id == user._id, user);
                    }
                if (user.ProfileCoverPic != null)
                    if (user.ProfileCoverPic._id == file._id)
                    {
                        user.ProfileCoverPic = null;
                        collectionUser.ReplaceOne(u => u._id == user._id, user);
                    }
                collection.DeleteOne(f => f._id == file._id);
            }
            return "success";
        }
        [Route("api/index/updateleaderboard")]
        [HttpPost]
        public Leaderboard updateleaderboard([FromBody]LeaderboardPost leaderboard)
        {
            var collectionLeaderboards = database.GetCollection<Leaderboard>("Leaderboards");
            Leaderboard leaderboardConverted = new LeaderboardConverter().convert(leaderboard);
            if (leaderboardConverted._id == ObjectId.Parse("000000000000000000000000"))
                collectionLeaderboards.InsertOne(leaderboardConverted);
            if (leaderboardConverted._id != ObjectId.Parse("000000000000000000000000"))
                collectionLeaderboards.ReplaceOne(l => l._id == leaderboardConverted._id, leaderboardConverted);
            return leaderboardConverted;
        }
        [Route("api/index/retrieveleaderboard")]
        [HttpGet]
        public Leaderboard retrieveleaderboard(string userid)
        {
            return database.GetCollection<Leaderboard>("Leaderboards").Find(l => l.UserID == ObjectId.Parse(userid)).FirstOrDefault();
        }
        [Route("api/index/retrieveleaderboards")]
        [HttpPost]
        public List<LeaderboardDetailed> retrieveleaderboards(string userid, string orderby, int page, [FromBody]List<string> notinusersid)
        {
            var collectionLeaderboards = database.GetCollection<Leaderboard>("Leaderboards");
            var collectionUsers = database.GetCollection<UserMinInfo>("Users");
            var inq = new ObjectId[notinusersid.Count];
            for (int i = 0; i < notinusersid.Count; i++)
            {
                inq[i] = ObjectId.Parse(notinusersid.ElementAt(i));
            }
            List<LeaderboardDetailed> leaderboards = new List<LeaderboardDetailed>();
            if (orderby == "total")
                leaderboards = (from l in collectionLeaderboards.AsQueryable()
                                join u in collectionUsers.AsQueryable() on l.UserID equals u._id into user
                                where !inq.Contains(l.UserID)
                                orderby l.TotalScore descending, l._id descending
                                select new LeaderboardDetailed()
                                {
                                    _id = l._id,
                                    UserID = l.UserID,
                                    TotalScore = l.TotalScore,
                                    WeeklyScore = l.WeeklyScore,
                                    WeekendScore = l.WeekendScore,
                                    HighestStreak = l.HighestStreak,
                                    users = (List<UserMinInfo>)user
                                }).Take(10).ToList();
            if (orderby == "weekly")
                leaderboards = (from l in collectionLeaderboards.AsQueryable()
                                join u in collectionUsers.AsQueryable() on l.UserID equals u._id into user
                                where !inq.Contains(l.UserID)
                                orderby l.WeeklyScore descending, l._id descending
                                select new LeaderboardDetailed()
                                {
                                    _id = l._id,
                                    UserID = l.UserID,
                                    TotalScore = l.TotalScore,
                                    WeeklyScore = l.WeeklyScore,
                                    WeekendScore = l.WeekendScore,
                                    HighestStreak = l.HighestStreak,
                                    users = (List<UserMinInfo>)user
                                }).Take(10).ToList();
            if (orderby == "weekend")
                leaderboards = (from l in collectionLeaderboards.AsQueryable()
                                join u in collectionUsers.AsQueryable() on l.UserID equals u._id into user
                                where !inq.Contains(l.UserID)
                                orderby l.WeekendScore descending, l._id descending
                                select new LeaderboardDetailed()
                                {
                                    _id = l._id,
                                    UserID = l.UserID,
                                    TotalScore = l.TotalScore,
                                    WeeklyScore = l.WeeklyScore,
                                    WeekendScore = l.WeekendScore,
                                    HighestStreak = l.HighestStreak,
                                    users = (List<UserMinInfo>)user
                                }).Take(10).ToList();
            if (orderby == "streak")
                leaderboards = (from l in collectionLeaderboards.AsQueryable()
                                join u in collectionUsers.AsQueryable() on l.UserID equals u._id into user
                                where !inq.Contains(l.UserID)
                                orderby l.HighestStreak descending, l._id descending
                                select new LeaderboardDetailed()
                                {
                                    _id = l._id,
                                    UserID = l.UserID,
                                    TotalScore = l.TotalScore,
                                    WeeklyScore = l.WeeklyScore,
                                    WeekendScore = l.WeekendScore,
                                    HighestStreak = l.HighestStreak,
                                    users = (List<UserMinInfo>)user
                                }).Take(10).ToList();
            int pager = page == 0 ? 1 : page * 10;
            List<LeaderboardDetailed> PrevPagesleaderboards = new List<LeaderboardDetailed>();
            if (orderby == "total")
                PrevPagesleaderboards = (from l in collectionLeaderboards.AsQueryable()
                                         orderby l.TotalScore descending, l._id descending
                                         select new LeaderboardDetailed()
                                         {
                                             _id = l._id,
                                             UserID = l.UserID,
                                             TotalScore = l.TotalScore,
                                             WeeklyScore = l.WeeklyScore,
                                             WeekendScore = l.WeekendScore,
                                             HighestStreak = l.HighestStreak,
                                         }).Take(pager).ToList();
            if (orderby == "weekly")
                PrevPagesleaderboards = (from l in collectionLeaderboards.AsQueryable()
                                         orderby l.WeeklyScore descending, l._id descending
                                         select new LeaderboardDetailed()
                                         {
                                             _id = l._id,
                                             UserID = l.UserID,
                                             TotalScore = l.TotalScore,
                                             WeeklyScore = l.WeeklyScore,
                                             WeekendScore = l.WeekendScore,
                                             HighestStreak = l.HighestStreak,
                                         }).Take(pager).ToList();
            if (orderby == "weekend")
                PrevPagesleaderboards = (from l in collectionLeaderboards.AsQueryable()
                                         orderby l.WeekendScore descending, l._id descending
                                         select new LeaderboardDetailed()
                                         {
                                             _id = l._id,
                                             UserID = l.UserID,
                                             TotalScore = l.TotalScore,
                                             WeeklyScore = l.WeeklyScore,
                                             WeekendScore = l.WeekendScore,
                                             HighestStreak = l.HighestStreak,
                                         }).Take(pager).ToList();
            if (orderby == "streak")
                PrevPagesleaderboards = (from l in collectionLeaderboards.AsQueryable()
                                         orderby l.HighestStreak descending, l._id descending
                                         select new LeaderboardDetailed()
                                         {
                                             _id = l._id,
                                             UserID = l.UserID,
                                             TotalScore = l.TotalScore,
                                             WeeklyScore = l.WeeklyScore,
                                             WeekendScore = l.WeekendScore,
                                             HighestStreak = l.HighestStreak,
                                         }).Take(pager).ToList();
            foreach (LeaderboardDetailed leaderboard in PrevPagesleaderboards)
            {
                int position = retrieveuserleaderboardposition(leaderboard, orderby);
                while (true)
                {
                    if (PrevPagesleaderboards.Any(l => l.Position == position))
                    {
                        position++;
                    }
                    else
                    {
                        break;
                    }
                }
                leaderboard.Position = position;
            }
            if (PrevPagesleaderboards.Count == 1) PrevPagesleaderboards = leaderboards;
            foreach (LeaderboardDetailed leaderboard in leaderboards)
            {
                int position = retrieveuserleaderboardposition(leaderboard, orderby);
                while (true)
                {
                    if (PrevPagesleaderboards.Any(l => l.Position == position) || leaderboards.Any(l => l.Position == position))
                    {
                        position++;
                    }
                    else
                    {
                        break;
                    }
                }
                leaderboard.Position = position;
            }
            if (!leaderboards.Any(l => l.UserID == ObjectId.Parse(userid)))
            {
                LeaderboardDetailed currentUser = new LeaderboardDetailed();
                if (PrevPagesleaderboards.Any(l => l.UserID == ObjectId.Parse(userid)))
                {
                    currentUser = PrevPagesleaderboards.Single(l => l.UserID == ObjectId.Parse(userid));
                    currentUser.users = new List<UserMinInfo>() { collectionUsers.Find(u => u._id == ObjectId.Parse(userid)).FirstOrDefault() };
                    currentUser.AddedLast = true;
                }
                else
                {
                    if (orderby == "total")
                        currentUser = (from l in collectionLeaderboards.AsQueryable()
                                       join u in collectionUsers.AsQueryable() on l.UserID equals u._id into user
                                       where l.UserID == ObjectId.Parse(userid)
                                       orderby l.TotalScore descending, l._id descending
                                       select new LeaderboardDetailed()
                                       {
                                           _id = l._id,
                                           UserID = l.UserID,
                                           TotalScore = l.TotalScore,
                                           WeeklyScore = l.WeeklyScore,
                                           WeekendScore = l.WeekendScore,
                                           HighestStreak = l.HighestStreak,
                                           users = (List<UserMinInfo>)user
                                       }).FirstOrDefault();
                    if (orderby == "weekly")
                        currentUser = (from l in collectionLeaderboards.AsQueryable()
                                       join u in collectionUsers.AsQueryable() on l.UserID equals u._id into user
                                       where l.UserID == ObjectId.Parse(userid)
                                       orderby l.WeeklyScore descending, l._id descending
                                       select new LeaderboardDetailed()
                                       {
                                           _id = l._id,
                                           UserID = l.UserID,
                                           TotalScore = l.TotalScore,
                                           WeeklyScore = l.WeeklyScore,
                                           WeekendScore = l.WeekendScore,
                                           HighestStreak = l.HighestStreak,
                                           users = (List<UserMinInfo>)user
                                       }).FirstOrDefault();
                    if (orderby == "weekend")
                        currentUser = (from l in collectionLeaderboards.AsQueryable()
                                       join u in collectionUsers.AsQueryable() on l.UserID equals u._id into user
                                       where l.UserID == ObjectId.Parse(userid)
                                       orderby l.WeekendScore descending, l._id descending
                                       select new LeaderboardDetailed()
                                       {
                                           _id = l._id,
                                           UserID = l.UserID,
                                           TotalScore = l.TotalScore,
                                           WeeklyScore = l.WeeklyScore,
                                           WeekendScore = l.WeekendScore,
                                           HighestStreak = l.HighestStreak,
                                           users = (List<UserMinInfo>)user
                                       }).FirstOrDefault();
                    if (orderby == "streak")
                        currentUser = (from l in collectionLeaderboards.AsQueryable()
                                       join u in collectionUsers.AsQueryable() on l.UserID equals u._id into user
                                       where l.UserID == ObjectId.Parse(userid)
                                       orderby l.HighestStreak descending, l._id descending
                                       select new LeaderboardDetailed()
                                       {
                                           _id = l._id,
                                           UserID = l.UserID,
                                           TotalScore = l.TotalScore,
                                           WeeklyScore = l.WeeklyScore,
                                           WeekendScore = l.WeekendScore,
                                           HighestStreak = l.HighestStreak,
                                           users = (List<UserMinInfo>)user
                                       }).FirstOrDefault();
                    currentUser.AddedLast = true;
                    int position = retrieveuserleaderboardposition(currentUser, orderby);
                    while (true)
                    {
                        if (PrevPagesleaderboards.Any(l => l.Position == position) || leaderboards.Any(l => l.Position == position))
                        {
                            position++;
                        }
                        else
                        {
                            break;
                        }
                    }
                    currentUser.Position = position;
                }
                leaderboards.Add(currentUser);
            }
            return leaderboards;
        }
        [Route("api/index/searchleaderboards")]
        [HttpGet]
        public List<LeaderboardDetailed> searchleaderboards(string query, string orderby)
        {
            var querySplit = query.Split(' ');
            var collectionUsers = database.GetCollection<UserMinInfo>("Users");
            var collectionLeaderboards = database.GetCollection<Leaderboard>("Leaderboards");
            List<UserMinInfo> searches = (from u in collectionUsers.AsQueryable()
                                          where querySplit.Contains(u.FirstName) && querySplit.Contains(u.LastName)
                                          select u).ToList();
            if (querySplit.Length > 1)
            {
                List<UserMinInfo> searchesTemp = (from u in collectionUsers.AsQueryable()
                                                  where (u.FirstName.ToLower().Contains(querySplit[0]) && u.LastName.ToLower().Contains(querySplit[1])) || (u.FirstName.ToLower().Contains(querySplit[1]) && u.LastName.ToLower().Contains(querySplit[0]))
                                                  select u).Take(15).ToList();
                foreach (UserMinInfo search in searchesTemp)
                {
                    if (searches.Count > 15) break;
                    if (!searches.Any(s => s._id == search._id)) searches.Add(search);
                }
            }
            else
            {
                List<UserMinInfo> searchesTemp = (from u in collectionUsers.AsQueryable()
                                                  where u.FirstName.ToLower().Contains(query) || u.LastName.ToLower().Contains(query)
                                                  select u).Take(15).ToList();
                foreach (UserMinInfo search in searchesTemp)
                {
                    if (searches.Count > 15) break;
                    if (!searches.Any(s => s._id == search._id)) searches.Add(search);
                }
            }
            List<LeaderboardDetailed> leaderboards = new List<LeaderboardDetailed>();
            foreach (UserMinInfo search in searches)
            {
                LeaderboardDetailed leaderboard = (from l in collectionLeaderboards.AsQueryable()
                                                   where l.UserID == search._id
                                                   orderby l.HighestStreak descending, l._id descending
                                                   select new LeaderboardDetailed()
                                                   {
                                                       _id = l._id,
                                                       UserID = l.UserID,
                                                       TotalScore = l.TotalScore,
                                                       WeeklyScore = l.WeeklyScore,
                                                       WeekendScore = l.WeekendScore,
                                                       HighestStreak = l.HighestStreak
                                                   }).FirstOrDefault();
                leaderboard.users = new List<UserMinInfo> { search };
                int position = retrieveuserleaderboardposition(leaderboard, orderby);
                while (true)
                {
                    if (leaderboards.Any(l => l.Position == position) || leaderboards.Any(l => l.Position == position))
                    {
                        position++;
                    }
                    else
                    {
                        break;
                    }
                }
                leaderboard.Position = position;
                leaderboards.Add(leaderboard);
            }
            leaderboards = leaderboards.OrderBy(l => l.Position).ToList();
            return leaderboards;
        }
        public int retrieveuserleaderboardposition(LeaderboardDetailed leaderboard, string orderby)
        {
            var collectionLeaderboards = database.GetCollection<Leaderboard>("Leaderboards");
            if (orderby == "total")
                return (from l in collectionLeaderboards.AsQueryable()
                        where l.TotalScore > leaderboard.TotalScore
                        orderby l.TotalScore descending, l._id descending
                        select new LeaderboardDetailed()
                        {
                            _id = l._id,
                            UserID = l.UserID,
                            TotalScore = l.TotalScore,
                            WeeklyScore = l.WeeklyScore,
                            WeekendScore = l.WeekendScore,
                            HighestStreak = l.HighestStreak
                        }).Count() + 1;
            if (orderby == "weekly")
                return (from l in collectionLeaderboards.AsQueryable()
                        where l.WeeklyScore > leaderboard.WeeklyScore
                        orderby l.WeeklyScore descending, l._id descending
                        select new LeaderboardDetailed()
                        {
                            _id = l._id,
                            UserID = l.UserID,
                            TotalScore = l.TotalScore,
                            WeeklyScore = l.WeeklyScore,
                            WeekendScore = l.WeekendScore,
                            HighestStreak = l.HighestStreak
                        }).Count() + 1;
            if (orderby == "weekend")
                return (from l in collectionLeaderboards.AsQueryable()
                        where l.WeekendScore > leaderboard.WeekendScore
                        orderby l.WeekendScore descending, l._id descending
                        select new LeaderboardDetailed()
                        {
                            _id = l._id,
                            UserID = l.UserID,
                            TotalScore = l.TotalScore,
                            WeeklyScore = l.WeeklyScore,
                            WeekendScore = l.WeekendScore,
                            HighestStreak = l.HighestStreak
                        }).Count() + 1;
            return (from l in collectionLeaderboards.AsQueryable()
                    where l.HighestStreak > leaderboard.HighestStreak
                    orderby l.HighestStreak descending, l._id descending
                    select new LeaderboardDetailed()
                    {
                        _id = l._id,
                        UserID = l.UserID,
                        TotalScore = l.TotalScore,
                        WeeklyScore = l.WeeklyScore,
                        WeekendScore = l.WeekendScore,
                        HighestStreak = l.HighestStreak
                    }).Count() + 1;
        }

        [Route("api/index/createfriendship")]
        [HttpPost]
        public Friendship createfriendship([FromBody]FriendshipPost friendship)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            friendship.CreateDateTime = DateTime.Now;
            Friendship friendship1 = new FriendshipConverter().Convert(friendship);
            ObjectId[] objects = new ObjectId[] { friendship1.FriendshipStarterUserId, friendship1.FriendUserId };
            Friendship friendshipSearch = collectionFriendships.Find(f => objects.Contains(f.FriendshipStarterUserId) && objects.Contains(f.FriendUserId)).FirstOrDefault();
            if (friendshipSearch != null)
            {
                friendshipSearch.CreateDateTime = DateTime.Now;
                collectionFriendships.ReplaceOne(f => f._id == friendshipSearch._id, friendshipSearch);
                return null;
            }
            else
            {
                collectionFriendships.InsertOne(friendship1);
                return friendship1;
            }
        }
        [Route("api/index/approvefriendship")]
        [HttpPost]
        public Friendship approvefriendship(string friendshipid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            Friendship friendship = collectionFriendships.Find(f => f._id == ObjectId.Parse(friendshipid)).FirstOrDefault();
            friendship.FriendshipApproved = true;
            friendship.FriendshipApproveDatetime = DateTime.Now;
            collectionFriendships.ReplaceOne(f => f._id == friendship._id, friendship);
            return friendship;
        }
        [Route("api/index/deletefriendship")]
        [HttpDelete]
        public string deletefriendship(string friendshipid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            collectionFriendships.DeleteOne(f => f._id == ObjectId.Parse(friendshipid));
            return "success";
        }
        [Route("api/index/retrievefriendships")]
        [HttpGet]
        public List<FriendshipDetailed> retrievefriendships(string userid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            var collectionUsers = database.GetCollection<UserMinInfo>("Users");
            List<FriendshipDetailed> friendships = (from f in collectionFriendships.AsQueryable()
                                                    join u in collectionUsers.AsQueryable() on f.FriendshipStarterUserId equals u._id into starter
                                                    join u2 in collectionUsers.AsQueryable() on f.FriendUserId equals u2._id into friend
                                                    where f.FriendshipApproved && (f.FriendUserId == ObjectId.Parse(userid) || f.FriendshipStarterUserId == ObjectId.Parse(userid))
                                                    orderby f.CreateDateTime descending
                                                    select new FriendshipDetailed()
                                                    {
                                                        _id = f._id,
                                                        FriendshipStarterUserId = f.FriendshipStarterUserId,
                                                        FriendUserId = f.FriendUserId,
                                                        CreateDateTime = f.CreateDateTime,
                                                        FriendshipApproved = f.FriendshipApproved,
                                                        FriendshipApproveDatetime = f.FriendshipApproveDatetime,
                                                        FriendshipStarter = (List<UserMinInfo>)starter,
                                                        FriendUser = (List<UserMinInfo>)friend
                                                    }).Take(12).ToList();
            foreach (FriendshipDetailed friendshipRet in friendships)
            {
                if (friendshipRet.FriendshipStarterUserId != ObjectId.Parse(userid))
                {
                    friendshipRet.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == friendshipRet.FriendshipStarterUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                    friendshipRet.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == friendshipRet.FriendshipStarterUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                }
                else
                {
                    friendshipRet.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == friendshipRet.FriendUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                    friendshipRet.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == friendshipRet.FriendUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                }
            }
            return friendships;
        }
        [Route("api/index/retrievefriendshipsall")]
        [HttpGet]
        public List<FriendshipDetailed> retrievefriendshipsall(string userid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            var collectionUsers = database.GetCollection<UserMinInfo>("Users");
            List<FriendshipDetailed> friendships = (from f in collectionFriendships.AsQueryable()
                                                    join u in collectionUsers.AsQueryable() on f.FriendshipStarterUserId equals u._id into starter
                                                    join u2 in collectionUsers.AsQueryable() on f.FriendUserId equals u2._id into friend
                                                    where f.FriendshipApproved && (f.FriendUserId == ObjectId.Parse(userid) || f.FriendshipStarterUserId == ObjectId.Parse(userid))
                                                    orderby f.CreateDateTime descending
                                                    select new FriendshipDetailed()
                                                    {
                                                        _id = f._id,
                                                        FriendshipStarterUserId = f.FriendshipStarterUserId,
                                                        FriendUserId = f.FriendUserId,
                                                        CreateDateTime = f.CreateDateTime,
                                                        FriendshipApproved = f.FriendshipApproved,
                                                        FriendshipApproveDatetime = f.FriendshipApproveDatetime,
                                                        FriendshipStarter = (List<UserMinInfo>)starter,
                                                        FriendUser = (List<UserMinInfo>)friend
                                                    }).ToList();
            return friendships;
        }
        [Route("api/index/retrievefriendshipsafter")]
        [HttpGet]
        public List<FriendshipDetailed> retrievefriendshipsafter(string userid, string lastfriendshipid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            var collectionUsers = database.GetCollection<UserMinInfo>("Users");
            Friendship friendship = collectionFriendships.Find(f => f._id == ObjectId.Parse(lastfriendshipid)).FirstOrDefault();
            List<FriendshipDetailed> friendships = (from f in collectionFriendships.AsQueryable()
                                                    join u in collectionUsers.AsQueryable() on f.FriendshipStarterUserId equals u._id into starter
                                                    join u2 in collectionUsers.AsQueryable() on f.FriendUserId equals u2._id into friend
                                                    where f.FriendshipApproved && friendship.CreateDateTime > f.CreateDateTime && (f.FriendUserId == ObjectId.Parse(userid) || f.FriendshipStarterUserId == ObjectId.Parse(userid))
                                                    orderby f.CreateDateTime descending
                                                    select new FriendshipDetailed()
                                                    {
                                                        _id = f._id,
                                                        FriendshipStarterUserId = f.FriendshipStarterUserId,
                                                        FriendUserId = f.FriendUserId,
                                                        CreateDateTime = f.CreateDateTime,
                                                        FriendshipApproved = f.FriendshipApproved,
                                                        FriendshipApproveDatetime = f.FriendshipApproveDatetime,
                                                        FriendshipStarter = (List<UserMinInfo>)starter,
                                                        FriendUser = (List<UserMinInfo>)friend
                                                    }).Take(12).ToList();
            foreach (FriendshipDetailed friendshipRet in friendships)
            {
                if (friendshipRet.FriendshipStarterUserId != ObjectId.Parse(userid))
                {
                    friendshipRet.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == friendshipRet.FriendshipStarterUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                    friendshipRet.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == friendshipRet.FriendshipStarterUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                }
                else
                {
                    friendshipRet.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == friendshipRet.FriendUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                    friendshipRet.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == friendshipRet.FriendUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                }
            }
            return friendships;
        }
        [Route("api/index/retrievefriendshiprequests")]
        [HttpGet]
        public List<FriendshipDetailed> retrievefriendshiprequests(string userid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            var collectionUsers = database.GetCollection<User>("Users");
            List<FriendshipDetailed> friendships = (from f in collectionFriendships.AsQueryable()
                                                    join u in collectionUsers.AsQueryable() on f.FriendshipStarterUserId equals u._id into starter
                                                    join u2 in collectionUsers.AsQueryable() on f.FriendUserId equals u2._id into friend
                                                    where f.FriendUserId == ObjectId.Parse(userid) && !f.FriendshipApproved
                                                    orderby f.CreateDateTime descending
                                                    select new FriendshipDetailed()
                                                    {
                                                        _id = f._id,
                                                        FriendshipStarterUserId = f.FriendshipStarterUserId,
                                                        FriendUserId = f.FriendUserId,
                                                        CreateDateTime = f.CreateDateTime,
                                                        FriendshipApproved = f.FriendshipApproved,
                                                        FriendshipApproveDatetime = f.FriendshipApproveDatetime,
                                                        FriendshipStarter = (List<UserMinInfo>)starter,
                                                        FriendUser = (List<UserMinInfo>)friend
                                                    }).Take(12).ToList();
            foreach (FriendshipDetailed friendship in friendships)
            {
                if (friendship.FriendshipStarterUserId != ObjectId.Parse(userid))
                {
                    friendship.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == friendship.FriendshipStarterUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                    friendship.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == friendship.FriendshipStarterUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                }
                else
                {
                    friendship.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == friendship.FriendUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                    friendship.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == friendship.FriendUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                }
            }
            return friendships;
        }
        [Route("api/index/retrievefriendshiprequestsafter")]
        [HttpGet]
        public List<FriendshipDetailed> retrievefriendshiprequestsafter(string userid, string lastfriendshipid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            var collectionUsers = database.GetCollection<User>("Users");
            Friendship friendship = collectionFriendships.Find(f => f._id == ObjectId.Parse(lastfriendshipid)).FirstOrDefault();
            List<FriendshipDetailed> friendships = (from f in collectionFriendships.AsQueryable()
                                                    join u in collectionUsers.AsQueryable() on f.FriendshipStarterUserId equals u._id into starter
                                                    join u2 in collectionUsers.AsQueryable() on f.FriendUserId equals u2._id into friend
                                                    where f.FriendUserId == ObjectId.Parse(userid) && !f.FriendshipApproved && friendship.CreateDateTime > f.CreateDateTime
                                                    orderby f.CreateDateTime descending
                                                    select new FriendshipDetailed()
                                                    {
                                                        _id = f._id,
                                                        FriendshipStarterUserId = f.FriendshipStarterUserId,
                                                        FriendUserId = f.FriendUserId,
                                                        CreateDateTime = f.CreateDateTime,
                                                        FriendshipApproved = f.FriendshipApproved,
                                                        FriendshipApproveDatetime = f.FriendshipApproveDatetime,
                                                        FriendshipStarter = (List<UserMinInfo>)starter,
                                                        FriendUser = (List<UserMinInfo>)friend
                                                    }).Take(12).ToList();
            foreach (FriendshipDetailed friendshipRet in friendships)
            {
                if (friendshipRet.FriendshipStarterUserId != ObjectId.Parse(userid))
                {
                    friendshipRet.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == friendshipRet.FriendshipStarterUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                    friendshipRet.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == friendshipRet.FriendshipStarterUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                }
                else
                {
                    friendshipRet.LatestWork = (from c in database.GetCollection<Company>("Companies").AsQueryable() where c.UserID == friendshipRet.FriendUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                    friendshipRet.LatestEducation = (from c in database.GetCollection<School>("Schools").AsQueryable() where c.UserID == friendshipRet.FriendUserId orderby c.CreateDateTime descending select c).FirstOrDefault();
                }
            }
            return friendships;
        }
        [Route("api/index/search")]
        [HttpGet]
        public List<Search> search(string query)
        {
            var querySplit = query.Split(' ');
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionPosts = database.GetCollection<Post>("Posts");
            List<Search> searches = (from u in collectionUsers.AsQueryable()
                                     where querySplit.Contains(u.FirstName) && querySplit.Contains(u.LastName)
                                     select new Search()
                                     {
                                         _redirect = u.Email,
                                         SearchContent = u.FirstName + " " + u.LastName,
                                         SearchType = "user"
                                     }).ToList();
            query = query.ToLower();
            querySplit = query.Split(' ');
            if (querySplit.Length > 1)
            {
                List<Search> searchesTemp = (from u in collectionUsers.AsQueryable()
                                             where (u.FirstName.ToLower().Contains(querySplit[0]) && u.LastName.ToLower().Contains(querySplit[1])) || (u.FirstName.ToLower().Contains(querySplit[1]) && u.LastName.ToLower().Contains(querySplit[0]))
                                             select new Search()
                                             {
                                                 _redirect = u.Email,
                                                 SearchContent = u.FirstName + " " + u.LastName,
                                                 SearchType = "user"
                                             }).ToList();
                foreach (Search search in searchesTemp)
                {
                    if (!searches.Any(s => s._redirect == search._redirect))
                        searches.Add(search);
                }
            }
            else
            {
                List<Search> searchesTemp = (from u in collectionUsers.AsQueryable()
                                             where u.FirstName.ToLower().Contains(query) || u.LastName.ToLower().Contains(query)
                                             select new Search()
                                             {
                                                 _redirect = u.Email,
                                                 SearchContent = u.FirstName + " " + u.LastName,
                                                 SearchType = "user"
                                             }).Take(5).ToList();
                foreach (Search search in searchesTemp)
                {
                    if (!searches.Any(s => s._redirect == search._redirect))
                        searches.Add(search);
                }
            }
            searches = searches.Concat((from p in collectionPosts.AsQueryable()
                                        where p.PostContent.ToLower().Contains(query) && !p.PostContent.Contains("<img class=")
                                        select new Search()
                                        {
                                            _redirect = p._id.ToString(),
                                            SearchContent = p.PostContent,
                                            SearchType = "post"
                                        }).Take(5).ToList()).ToList();
            for (int i = 0; i < searches.Count; i++)
                searches.ElementAt(i).SearchContent = searches.ElementAt(i).SearchContent.Replace("<div><br></div>", " ");

            return searches.Take(10).ToList();
        }
        [Route("api/index/createsearchhistory")]
        [HttpPost]
        public Search createsearchhistory([FromBody]SearchPost search)
        {
            Search searchConverted = new SearchConverter().Convert(search);
            searchConverted.CreateDateTime = DateTime.Now;
            var collection = database.GetCollection<Search>("SearchHistory");
            List<Search> searchList = collection.Find(s => s._redirect == searchConverted._redirect && s.UserID == searchConverted.UserID).ToList();
            if (searchList.Count > 0)
            {
                searchList.ElementAt(0).CreateDateTime = DateTime.Now;
                collection.ReplaceOne(s => s._id == searchList.ElementAt(0)._id, searchList.ElementAt(0));
                searchConverted = searchList.ElementAt(0);
                return null;
            }
            else
            {
                collection.InsertOne(searchConverted);
            }
            return searchConverted;
        }
        [Route("api/index/retrievesearchhistory")]
        [HttpGet]
        public List<Search> retrievesearchhistory(string userid)
        {
            var collection = database.GetCollection<Search>("SearchHistory");
            List<Search> searches = (from s in collection.AsQueryable()
                                     where s.UserID == ObjectId.Parse(userid)
                                     orderby s.CreateDateTime descending
                                     select s).Take(10).ToList();
            for (int i = 0; i < searches.Count; i++)
                searches.ElementAt(i).SearchContent = searches.ElementAt(i).SearchContent.Replace("<div><br></div>", " ");
            return searches;
        }
        [Route("api/index/retrievegalleryfiles")]
        [HttpGet]
        public List<FileUpload> retrievegalleryfiles(string userid)
        {
            var collectionFiles = database.GetCollection<FileUpload>("Files");
            var collectionMessages = database.GetCollection<Message>("Messages");
            var messages = (from m in collectionMessages.AsQueryable()
                            where (m.FromUserID == ObjectId.Parse(userid) || m.ToUserID == ObjectId.Parse(userid)) && m.FileType != "none"
                            select m.Files).ToList();
            List<FileUpload> files = new List<FileUpload>();
            foreach (var message in messages)
                if (message.ToList().Count > 0)
                    files.Add((FileUpload)message.ElementAt(0));
            var objs = new ObjectId[files.Count];
            for (int i = 0; i < files.Count; i++)
                objs[i] = files.ElementAt(i)._id;
            return (from f in collectionFiles.AsQueryable()
                    where !objs.Contains(f._id) && f.UserID == ObjectId.Parse(userid)
                    orderby f.UploadDateTime descending
                    select f).Take(12).ToList();
        }
        [Route("api/index/retrievegalleryfilesafter")]
        [HttpGet]
        public List<FileUpload> retrievegalleryfilesafter(string userid, string lastfile)
        {
            var collectionFiles = database.GetCollection<FileUpload>("Files");
            var collectionMessages = database.GetCollection<Message>("Messages");
            var messages = (from m in collectionMessages.AsQueryable()
                            where (m.FromUserID == ObjectId.Parse(userid) || m.ToUserID == ObjectId.Parse(userid)) && m.FileType != "none"
                            select m.Files).ToList();
            List<FileUpload> files = new List<FileUpload>();
            foreach (var message in messages)
                if (message.ToList().Count > 0)
                    files.Add((FileUpload)message.ElementAt(0));
            var objs = new ObjectId[files.Count];
            for (int i = 0; i < files.Count; i++)
                objs[i] = files.ElementAt(i)._id;
            FileUpload lastFile = collectionFiles.Find(s => s._id == ObjectId.Parse(lastfile)).FirstOrDefault();
            return (from f in collectionFiles.AsQueryable()
                    where !objs.Contains(f._id) && f.UserID == ObjectId.Parse(userid) && lastFile.UploadDateTime > f.UploadDateTime
                    orderby f.UploadDateTime descending
                    select f).Take(12).ToList();
        }
        [Route("api/index/createserver")]
        [HttpPost]
        public Server createserver([FromBody]ServerPost server)
        {
            var collectionServers = database.GetCollection<Server>("Servers");
            Server serverConverted = new ServerConverter().Convert(server);
            Server serverWithID = collectionServers.Find(s => s._id == serverConverted._id).FirstOrDefault();
            Server serverWithName = collectionServers.Find(s => s.Name == serverConverted.Name).FirstOrDefault();
            serverWithName = serverWithName == null ? new Server() : serverWithName;
            if (serverConverted._id != ObjectId.Parse("000000000000000000000000") && (serverWithName.Name == null || serverWithName._id == serverWithID._id))
                collectionServers.ReplaceOne(s => s._id == serverConverted._id, serverConverted);
            if (serverConverted._id != ObjectId.Parse("000000000000000000000000") && serverWithName._id != serverConverted._id && serverWithName.Name != null)
                return serverWithID;
            if (serverConverted._id == ObjectId.Parse("000000000000000000000000") && serverWithName.Name == null)
                collectionServers.InsertOne(serverConverted);
            return serverConverted._id == ObjectId.Parse("000000000000000000000000") ? null : serverConverted;
        }
        [Route("api/index/retrieveserver")]
        [HttpGet]
        public Server retrieveserver(string name)
        {
            return database.GetCollection<Server>("Servers").Find(s => s.Name == name).FirstOrDefault();
        }
        [Route("api/index/retrieveservers")]
        [HttpGet]
        public List<Server> retrieveservers(string role)
        {
            return database.GetCollection<Server>("Servers").Find(s => s.Roles.Contains(role)).ToList();
        }
        [Route("api/index/updatenotification")]
        [HttpPost]
        public Notification updatenotification([FromBody]NotificationPost notification)
        {
            var collection = database.GetCollection<Notification>("Notifications");
            Notification notificationConverted = new NotificationConverter().Convert(notification);
            notificationConverted.CreateDateTime = DateTime.Now;
            if (notificationConverted._id == ObjectId.Parse("000000000000000000000000"))
                collection.InsertOne(notificationConverted);

            if (notificationConverted._id != ObjectId.Parse("000000000000000000000000"))
                collection.ReplaceOne(l => l._id == notificationConverted._id, notificationConverted);

            return notificationConverted;
        }
        [Route("api/index/markallnotificationsasseen")]
        [HttpPut]
        public string markallnotificationsasseen(string userid)
        {
            var collection = database.GetCollection<Notification>("Notifications");
            var update = Builders<Notification>.Update.Set(n => n.Read, true);
            collection.UpdateMany(n => n.UserID == ObjectId.Parse(userid) && n.Read == false, update);
            return "success";
        }
        [Route("api/index/deletenotification")]
        [HttpDelete]
        public string deletenotification(string notificationid)
        {
            var collection = database.GetCollection<Notification>("Notifications");
            collection.DeleteOne(n => n._id == ObjectId.Parse(notificationid));
            return "success";
        }
        [Route("api/index/deletenotifications")]
        [HttpPut]
        public string deletenotifications(string userid)
        {
            var collection = database.GetCollection<Notification>("Notifications");
            collection.DeleteMany(n => n.UserID == ObjectId.Parse(userid));
            return "success";
        }
        [Route("api/index/retrievenotifications")]
        [HttpGet]
        public List<NotificationDetailed> retrievenotifications(string userid)
        {
            var collection = database.GetCollection<Notification>("Notifications");
            return (from n in collection.AsQueryable()
                    where n.UserID == ObjectId.Parse(userid)
                    orderby n.CreateDateTime descending
                    select new NotificationDetailed()
                    {
                        _id = n._id,
                        UserID = n.UserID,
                        Type = n.Type,
                        Read = n.Read,
                        CreateDateTime = n.CreateDateTime,
                        Content = n.Content,
                        DateTimeNow = DateTime.Now

                    }).Take(12).ToList();
        }
        [Route("api/index/retrievenotificationsafter")]
        [HttpGet]
        public List<NotificationDetailed> retrievenotificationsafter(string userid, string lastnotificationid)
        {
            var collection = database.GetCollection<Notification>("Notifications");
            Notification notification = collection.Find(n => n._id == ObjectId.Parse(lastnotificationid)).FirstOrDefault();
            return (from n in collection.AsQueryable()
                    where n.UserID == ObjectId.Parse(userid) && notification.CreateDateTime > n.CreateDateTime
                    orderby n.CreateDateTime descending
                    select new NotificationDetailed()
                    {
                        _id = n._id,
                        UserID = n.UserID,
                        Type = n.Type,
                        Read = n.Read,
                        CreateDateTime = n.CreateDateTime,
                        Content = n.Content,
                        DateTimeNow = DateTime.Now

                    }).Take(12).ToList();
        }
        [Route("api/index/retrieveheaderstats")]
        [HttpGet]
        public HeaderStats retrieveheaderstats(string userid)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            var collectionFriends = database.GetCollection<Friendship>("Friendships");
            var collectionNotifications = database.GetCollection<Notification>("Notifications");
            return new HeaderStats()
            {
                FriendRequests = (from f in collectionFriends.AsQueryable()
                                  where f.FriendUserId == ObjectId.Parse(userid) && !f.FriendshipApproved
                                  select f._id).Count(),
                Notifications = (from n in collectionNotifications.AsQueryable()
                                 where n.UserID == ObjectId.Parse(userid) && !n.Read
                                 select n._id).Count(),
                Messages = (from m in collectionMessages.AsQueryable()
                            where m.ToUserID == ObjectId.Parse(userid) && !m.MessageRead
                            select m._id).Count()

            };
        }
        [Route("api/index/retrievesuggestions")]
        [HttpGet]
        public List<UserMinInfo> retrievesuggestions(string userid)
        {
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionSearch = database.GetCollection<Search>("SearchHistory");
            var collectionFriendship = database.GetCollection<Friendship>("Friendships");
            var collectionLeaderboards = database.GetCollection<Leaderboard>("Leaderboards");

            User currentuser = collectionUsers.Find(u => u._id == ObjectId.Parse(userid)).FirstOrDefault();
            Leaderboard leaderboardcurrent = collectionLeaderboards.Find(l => l.UserID == ObjectId.Parse(userid)).FirstOrDefault();
            List<Search> searches = (from s in collectionSearch.AsQueryable()
                                     where s.UserID == ObjectId.Parse(userid) || s._redirect == currentuser.Email
                                     orderby s.CreateDateTime descending
                                     select s).Take(10).ToList();
            List<Leaderboard> _similarLeaderboards = (from l in collectionLeaderboards.AsQueryable()
                                                      where l.WeeklyScore == leaderboardcurrent.WeeklyScore
                                                      || l.HighestStreak == leaderboardcurrent.HighestStreak
                                                      || l.TotalScore == leaderboardcurrent.TotalScore
                                                      select l).Take(5).ToList();
            var _inuserids = new ObjectId[searches.Count];
            var _inuseremails = new string[searches.Count];
            for (int i = 0; i < searches.Count; i++)
            {
                _inuserids[i] = searches.ElementAt(i).UserID;
                _inuseremails[i] = searches.ElementAt(i)._redirect;
            }

            List<User> _similarUsers = (from u in collectionUsers.AsQueryable()
                                        where _inuserids.Contains(u._id)
                                        || _inuseremails.Contains(u.Email)
                                        || currentuser.LastName == u.LastName
                                        select u).Take(10).ToList();

            var _userfiltered = new ObjectId[_similarUsers.Count + _similarLeaderboards.Count];
            for (int i = 0; i < _similarUsers.Count; i++)
                _userfiltered[i] = _similarUsers.ElementAt(i)._id;

            int index = 0;
            for (int i = _similarUsers.Count; i < _userfiltered.Length; i++)
            {
                _userfiltered[i] = _similarLeaderboards.ElementAt(index).UserID;
                index++;
            }
            List<UserMinInfo> users = (from u in collectionUsers.AsQueryable()
                                       where _userfiltered.Contains(u._id) && u._id != currentuser._id
                                       select new UserMinInfo()
                                       {
                                           _id = u._id,
                                           FirstName = u.FirstName,
                                           LastName = u.LastName,
                                           Email = u.Email,
                                           ChatStatus = u.ChatStatus,
                                           ProfilePic = u.ProfilePic,
                                           ProfileCoverPic = u.ProfileCoverPic
                                       }).ToList();
            List<UserMinInfo> suggestions = new List<UserMinInfo>();
            foreach (UserMinInfo user in users)
            {
                var _inids = new ObjectId[] { ObjectId.Parse(userid), user._id };
                List<Friendship> friendships = collectionFriendship.Find(f => _inids.Contains(f.FriendshipStarterUserId) && _inids.Contains(f.FriendUserId)).ToList();
                if (friendships.Count == 0)
                {
                    suggestions.Add(user);
                }
            }
            Random rnd = new Random();
            return suggestions.OrderBy<UserMinInfo, int>((item) => rnd.Next()).Take(5).ToList();
        }
        [Route("api/index/createactivity")]
        [HttpPost]
        public Activity createactivity([FromBody]ActivityPost activity)
        {
            var collection = database.GetCollection<Activity>("Activities");
            Activity activityConverted = new ActivityConverter().Convert(activity);
            activityConverted.CreateDateTime = DateTime.Now;
            collection.InsertOne(activityConverted);
            return activityConverted;
        }
        [Route("api/index/retrieveactivities")]
        [HttpGet]
        public List<Activity> retrieveactivities(string userid)
        {
            var collection = database.GetCollection<Activity>("Activities");
            return (from a in collection.AsQueryable()
                    where a.UserID == ObjectId.Parse(userid)
                    orderby a.CreateDateTime descending
                    select new Activity()
                    {
                        _id = a._id,
                        UserID = a.UserID,
                        Content = a.Content,
                        ActivityType = a.ActivityType,
                        _redirect = a._redirect,
                        CreateDateTime = a.CreateDateTime,
                        DateTimeNow = DateTime.Now
                    }).Take(5).ToList();
        }
        [Route("api/index/updateconfiguration")]
        [HttpPut]
        public List<Configuration> updateconfiguration([FromBody]List<ConfigurationPost> configurations)
        {
            var collection = database.GetCollection<Configuration>("Configurations");
            List<Configuration> configurationsConverted = new ConfigurationConverter().ConvertMany(configurations);
            foreach (Configuration configurationConverted in configurationsConverted)
            {
                configurationConverted.CreateDateTime = DateTime.Now;
                if (configurationConverted._id == ObjectId.Parse("000000000000000000000000"))
                    collection.InsertOne(configurationConverted);
                if (configurationConverted._id != ObjectId.Parse("000000000000000000000000"))
                    collection.ReplaceOne(l => l._id == configurationConverted._id, configurationConverted);
            }
            return configurationsConverted;
        }
        [Route("api/index/retrieveconfigurations")]
        [HttpGet]
        public List<Configuration> retrieveconfigurations()
        {
            var collection = database.GetCollection<Configuration>("Configurations");
            return collection.Find(new BsonDocument()).ToList();
        }
        [Route("api/index/updateattemptsprice")]
        [HttpPut]
        public AttemptsPrice updateattemptsprice([FromBody]AttemptsPricePost price)
        {
            var collection = database.GetCollection<AttemptsPrice>("AttemptsPrices");
            AttemptsPrice priceConverted = new AttemptsPriceConverter().Convert(price);
            if (priceConverted._id == ObjectId.Parse("000000000000000000000000"))
                collection.InsertOne(priceConverted);
            if (priceConverted._id != ObjectId.Parse("000000000000000000000000"))
                collection.ReplaceOne(l => l._id == priceConverted._id, priceConverted);
            return priceConverted;
        }
        [Route("api/index/retrieveattemptsprices")]
        [HttpGet]
        public List<AttemptsPrice> retrieveattemptsprices()
        {
            var collection = database.GetCollection<AttemptsPrice>("AttemptsPrices");
            return (from a in collection.AsQueryable()
                    orderby a.Price ascending
                    select a).ToList();
        }
        [Route("api/index/updateattemptpuchase")]
        [HttpPut]
        public AttemptsPurchase updateattemptpuchase([FromBody]AttemptsPurchasePost purchase)
        {
            var collection = database.GetCollection<AttemptsPurchase>("AttemptsPurchases");
            AttemptsPurchase purchaseConverted = new AttemptsPurchaseConverter().Convert(purchase);
            purchaseConverted.PurchaseDateTime = DateTime.Now;
            if (purchaseConverted._id == ObjectId.Parse("000000000000000000000000"))
                collection.InsertOne(purchaseConverted);
            if (purchaseConverted._id != ObjectId.Parse("000000000000000000000000"))
                collection.ReplaceOne(l => l._id == purchaseConverted._id, purchaseConverted);
            return purchaseConverted;
        }

        [Route("api/index/retrieveattemptpuchase")]
        [HttpGet]
        public AttemptsPurchaseDetailed retrieveattemptpuchase(string purchaseid)
        {
            try
            {
                var collection = database.GetCollection<AttemptsPurchase>("AttemptsPurchases");
                var collectionPrices = database.GetCollection<AttemptsPrice>("AttemptsPrices");
                return (from p in collection.AsQueryable()
                        join a in collectionPrices.AsQueryable() on p.AttemptsPriceID equals a._id into prices
                        where p._id == ObjectId.Parse(purchaseid)
                        select new AttemptsPurchaseDetailed()
                        {
                            _id = p._id,
                            UserID = p.UserID,
                            AttemptsPriceID = p.AttemptsPriceID,
                            Status = p.Status,
                            PurchaseDateTime = p.PurchaseDateTime,
                            Prices = (List<AttemptsPrice>)prices
                        }).FirstOrDefault();
            }
            catch (Exception ex)
            {
                ex.ToString();
                return null;
            }

        }
        [Route("api/index/completeattemptpuchase")]
        [HttpPost]
        public IHttpActionResult completeattemptpuchase()
        {
            var collection = database.GetCollection<AttemptsPurchase>("AttemptsPurchases");
            var status = HttpContext.Current.Request.Params["payment_status"];
            var paymentid = HttpContext.Current.Request.Params["m_payment_id"];
            var update = Builders<AttemptsPurchase>.Update.Set(p => p.Status, status);
            collection.UpdateOne(u => u._id == ObjectId.Parse(paymentid), update);
            if (status.Equals("COMPLETE"))
            {
                var collectionPrices = database.GetCollection<AttemptsPrice>("AttemptsPrices");
                AttemptsPurchase purchase = collection.Find(p => p._id == ObjectId.Parse(paymentid)).FirstOrDefault();
                AttemptsPrice price = collectionPrices.Find(p => p._id == purchase.AttemptsPriceID).FirstOrDefault();
                int attemptsCount = retrieveattemptscount(purchase.UserID.ToString());
                updateattempts(purchase.UserID.ToString(), attemptsCount + price.AttemptsCount);
            }
            return Ok("ok");
        }
        [Route("api/index/createsetting")]
        [HttpPost]
        public string createsetting([FromBody]SettingPost setting)
        {
            var collection = database.GetCollection<Setting>("Settings");
            var collectionDefault = database.GetCollection<DefaultSetting>("DefaultSettings");
            var collectionUsers = database.GetCollection<User>("Users");
            List<ObjectId> userids = (from u in collectionUsers.AsQueryable()
                                      select u._id).ToList();
            List<Setting> settingsForAll = new List<Setting>();
            foreach (ObjectId objectId in userids)
                settingsForAll.Add(new Setting()
                {
                    UserID = objectId,
                    Name = setting.Name,
                    Label = setting.Label,
                    Type = setting.Type,
                    Description = setting.Description,
                    Value = setting.Value,
                    ValueNum = setting.ValueNum
                });
            collection.InsertMany(settingsForAll);
            collectionDefault.InsertOne(new DefaultSetting()
            {
                Name = setting.Name,
                Label = setting.Label,
                Type = setting.Type,
                Description = setting.Description,
                Value = setting.Value,
                ValueNum = setting.ValueNum
            });
            return "success";
        }
        [Route("api/index/updatesettings")]
        [HttpPut]
        public string updatesettings([FromBody]Setting setting, string name)
        {
            var collection = database.GetCollection<Setting>("Settings");
            var collectionDefault = database.GetCollection<DefaultSetting>("DefaultSettings");
            var update = Builders<Setting>.Update.Set(s => s.Name, setting.Name)
                                                 .Set(s => s.Label, setting.Label)
                                                 .Set(s => s.Description, setting.Description)
                                                 .Set(s => s.Value, setting.Value)
                                                 .Set(s => s.ValueNum, setting.ValueNum)
                                                 .Set(s => s.Type, setting.Type);
            var updateDefault = Builders<DefaultSetting>.Update.Set(s => s.Name, setting.Name)
                                                               .Set(s => s.Label, setting.Label)
                                                               .Set(s => s.Description, setting.Description)
                                                               .Set(s => s.Value, setting.Value)
                                                               .Set(s => s.ValueNum, setting.ValueNum)
                                                               .Set(s => s.Type, setting.Type);
            collection.UpdateMany(s => s.Name == name, update);
            collectionDefault.UpdateOne(s => s.Name == name, updateDefault);
            return "success";
        }
        [Route("api/index/updatesetting")]
        [HttpPut]
        public Setting updatesetting([FromBody]SettingPost setting)
        {
            var collection = database.GetCollection<Setting>("Settings");
            Setting settingConverted = new SettingConverter().Convert(setting);
            collection.ReplaceOne(s => s._id == settingConverted._id, settingConverted);
            return settingConverted;
        }
        [Route("api/index/retrievesettings")]
        [HttpGet]
        public List<Setting> retrievesettings(string userid)
        {
            var collection = database.GetCollection<Setting>("Settings");
            return collection.Find(s => s.UserID == ObjectId.Parse(userid)).ToList();
        }
        [Route("api/index/updatehelpitems")]
        [HttpPut]
        public List<HelpItem> updatehelpitems([FromBody]List<HelpItemPost> items)
        {
            var collection = database.GetCollection<HelpItem>("Help");
            List<HelpItem> itemsConverted = new HelpItemConverter().ConvertMany(items);
            foreach (HelpItem item in itemsConverted)
            {
                if (item._id == ObjectId.Parse("000000000000000000000000"))
                    collection.InsertOne(item);
                if (item._id != ObjectId.Parse("000000000000000000000000"))
                    collection.ReplaceOne(s => s._id == item._id, item);
            }
            return itemsConverted;
        }
        [Route("api/index/deletehelpitem")]
        [HttpDelete]
        public string deletehelpitem(string helpitemid)
        {
            var collection = database.GetCollection<HelpItem>("Help");
            collection.DeleteOne(h => h._id == ObjectId.Parse(helpitemid));
            return "success";
        }
        [Route("api/index/retrievehelpitems")]
        [HttpGet]
        public Help retrievehelpitems()
        {
            var collection = database.GetCollection<HelpItem>("Help");
            return new Help()
            {
                General = collection.Find(h => h.HelpTab == "General").ToList().OrderBy(h => h.SortBy).ToList(),
                Account = collection.Find(h => h.HelpTab == "Account").ToList().OrderBy(h => h.SortBy).ToList(),
                Privacy = collection.Find(h => h.HelpTab == "Privacy").ToList().OrderBy(h => h.SortBy).ToList(),
                Other = collection.Find(h => h.HelpTab == "Other").ToList().OrderBy(h => h.SortBy).ToList()
            };
        }
        [Route("api/index/createhelpinstruction")]
        [HttpPost]
        public async Task<HttpResponseMessage> createhelpinstruction()
        {
            var collectionHelp = database.GetCollection<HelpItem>("Help");
            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);
            await Request.Content.ReadAsMultipartAsync(provider);
            List<FileUpload> files = new FileManager().UploadFiles(provider, database, root, provider.FormData["Type"], provider.FormData["InstructionCreatorID"]);
            Instruction instruction = new Instruction();
            instruction.Type = provider.FormData["Type"];
            instruction.Description = provider.FormData["Description"];
            instruction.SortBy = Convert.ToInt32(provider.FormData["SortBy"]);
            instruction.Value = instruction.Type == "Text" ? provider.FormData["Value"] : files.ElementAt(0).FileBaseUrls.ElementAt(0);
            HelpItem help = collectionHelp.Find(h => h._id == ObjectId.Parse(provider.FormData["HelpItemId"])).FirstOrDefault();
            help.Instructions.Add(instruction);
            collectionHelp.ReplaceOne(h => h._id == help._id, help);
            return Request.CreateResponse(HttpStatusCode.OK, "success");
        }
        [Route("api/index/deletehelpinstruction")]
        [HttpDelete]
        public string deletehelpinstruction(string helpitemid, int instructionsortby)
        {
            var collection = database.GetCollection<HelpItem>("Help");
            HelpItem help = collection.Find(h => h._id == ObjectId.Parse(helpitemid)).FirstOrDefault();
            help.Instructions.Remove(help.Instructions.Find(i => i.SortBy == instructionsortby));
            collection.ReplaceOne(h => h._id == help._id, help);
            return "success";
        }
        [Route("api/index/updateadmintask")]
        [HttpPut]
        public List<AdminTask> updateadmintask([FromBody]List<AdminTaskPost> taskposts)
        {
            var collection = database.GetCollection<AdminTask>("AdminTasks");
            List<AdminTask> tasks = new AdminTaskConverter().ConvertMany(taskposts);
            foreach (AdminTask task in tasks)
            {
                task.LastRan = DateTime.Now;
                if (task._id == ObjectId.Parse("000000000000000000000000"))
                    collection.InsertOne(task);
                if (task._id != ObjectId.Parse("000000000000000000000000"))
                    collection.ReplaceOne(s => s._id == task._id, task);
            }
            return tasks;
        }
        [Route("api/index/deleteadmintask")]
        [HttpDelete]
        public string deleteadmintask(string taskid)
        {
            var collection = database.GetCollection<AdminTask>("AdminTasks");
            collection.DeleteOne(t => t._id == ObjectId.Parse(taskid));
            return "success";
        }
        [Route("api/index/retrieveadmintasks")]
        [HttpGet]
        public List<AdminTask> retrieveadmintasks()
        {
            var collection = database.GetCollection<AdminTask>("AdminTasks");
            return collection.Find(new BsonDocument()).ToList();
        }
        [Route("api/index/runattemptsupdatetask")]
        [HttpGet]
        public long runattemptsupdatetask()
        {
            var collection = database.GetCollection<User>("Users");
            var collectionConfig = database.GetCollection<Configuration>("Configurations");
            int attemptsUpdate = Convert.ToInt32(collectionConfig.Find(x => x.Name == "Daily_Attempts").FirstOrDefault().Value);
            var update = Builders<User>.Update.Set(u => u.Attempts, attemptsUpdate);
            return collection.UpdateMany(u => u.Attempts < attemptsUpdate, update).ModifiedCount;
        }
        [Route("api/index/runweeklyscoreupdatetask")]
        [HttpGet]
        public long runweeklyscoreupdatetask()
        {
            var collection = database.GetCollection<Leaderboard>("Leaderboards");
            var update = Builders<Leaderboard>.Update.Set(l => l.WeeklyScore, 0);
            return collection.UpdateMany(l => l.WeeklyScore > 0, update).ModifiedCount;
        }
        [Route("api/index/runweekendscoreupdatetask")]
        [HttpGet]
        public long runweekendscoreupdatetask()
        {
            var collection = database.GetCollection<Leaderboard>("Leaderboards");
            var update = Builders<Leaderboard>.Update.Set(l => l.WeekendScore, 0);
            return collection.UpdateMany(l => l.WeekendScore > 0, update).ModifiedCount;
        }
        [Route("api/index/updatelevels")]
        [HttpPut]
        public List<Level> updatelevels([FromBody]List<LevelPost> levels)
        {
            var collection = database.GetCollection<Level>("Levels");
            List<Level> levelsConverted = new LevelConverter().ConvertMany(levels);
            foreach (Level level in levelsConverted)
            {
                level.CreateDateTime = DateTime.Now;
                if (level._id == ObjectId.Parse("000000000000000000000000"))
                    collection.InsertOne(level);
                if (level._id != ObjectId.Parse("000000000000000000000000"))
                    collection.ReplaceOne(s => s._id == level._id, level);
            }
            return levelsConverted;
        }
        [Route("api/index/deletelevel")]
        [HttpDelete]
        public string deletelevel(string levelid)
        {
            var collection = database.GetCollection<Level>("Levels");
            collection.DeleteOne(l => l._id == ObjectId.Parse(levelid));
            return "success";
        }
        [Route("api/index/retrievelevels")]
        [HttpGet]
        public List<Level> retrievelevels()
        {
            var collection = database.GetCollection<Level>("Levels");
            return collection.Find(new BsonDocument()).ToList();
        }
    }
}
