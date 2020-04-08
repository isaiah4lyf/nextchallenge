using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using nextchallengeWebAPI.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
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
            return user;
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
        [Route("api/index/updateprofilepic")]
        [HttpPost]
        public async Task<HttpResponseMessage> updateprofilepic()
        {
            var collection = database.GetCollection<User>("Users");
            var collectionFiles = database.GetCollection<FileUpload>("Files");

            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);

            await Request.Content.ReadAsMultipartAsync(provider);

            List<FileUpload> files = new List<FileUpload>();
            DateTime datetime = DateTime.Now;
            foreach (MultipartFileData file in provider.FileData)
            {
                FileUpload fileUpload = new FileUpload();
                fileUpload.UserID = ObjectId.Parse(provider.FormData["UserID"]);
                fileUpload.FileType = provider.FormData["FileType"];
                fileUpload.FileName = file.Headers.ContentDisposition.FileName.Replace('\"'.ToString(), String.Empty).Replace('"'.ToString(), String.Empty);
                fileUpload.FileBaseUrls = new List<string> { Request.RequestUri.GetLeftPart(UriPartial.Authority) };
                fileUpload.UploadDateTime = datetime;
                collectionFiles.InsertOne(fileUpload);
                string fileName = fileUpload._id.ToString() + "." + file.Headers.ContentDisposition.FileName.Split('.')[file.Headers.ContentDisposition.FileName.Split('.').Length - 1].Replace('\"'.ToString(), String.Empty);
                File.Move(file.LocalFileName, Path.Combine(root, fileName));
                List<string> newUrls = new List<string>();
                foreach (string fileUpload1 in fileUpload.FileBaseUrls)
                    newUrls.Add(fileUpload1 + "/files/" + fileName);
                fileUpload.FileBaseUrls = newUrls;
                collectionFiles.ReplaceOne(f => f._id == fileUpload._id, fileUpload);
                files.Add(fileUpload);
            }
            User user = collection.Find(u => u._id == ObjectId.Parse(provider.FormData["UserID"])).FirstOrDefault();
            user.ProfilePic = files.ElementAt(0);
            collection.ReplaceOne(u => u._id == ObjectId.Parse(provider.FormData["UserID"]), user);
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.SerializeObject(user));
        }
        [Route("api/index/updateprofilecoverpic")]
        [HttpPost]
        public async Task<HttpResponseMessage> updateprofilecoverpic()
        {
            var collection = database.GetCollection<User>("Users");
            var collectionFiles = database.GetCollection<FileUpload>("Files");

            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);

            await Request.Content.ReadAsMultipartAsync(provider);

            List<FileUpload> files = new List<FileUpload>();
            DateTime datetime = DateTime.Now;
            foreach (MultipartFileData file in provider.FileData)
            {
                FileUpload fileUpload = new FileUpload();
                fileUpload.UserID = ObjectId.Parse(provider.FormData["UserID"]);
                fileUpload.FileType = provider.FormData["FileType"];
                fileUpload.FileName = file.Headers.ContentDisposition.FileName.Replace('\"'.ToString(), String.Empty).Replace('"'.ToString(), String.Empty);
                fileUpload.FileBaseUrls = new List<string> { Request.RequestUri.GetLeftPart(UriPartial.Authority) };
                fileUpload.UploadDateTime = datetime;
                collectionFiles.InsertOne(fileUpload);
                string fileName = fileUpload._id.ToString() + "." + file.Headers.ContentDisposition.FileName.Split('.')[file.Headers.ContentDisposition.FileName.Split('.').Length - 1].Replace('\"'.ToString(), String.Empty);
                File.Move(file.LocalFileName, Path.Combine(root, fileName));
                List<string> newUrls = new List<string>();
                foreach (string fileUpload1 in fileUpload.FileBaseUrls)
                    newUrls.Add(fileUpload1 + "/files/" + fileName);
                fileUpload.FileBaseUrls = newUrls;
                collectionFiles.ReplaceOne(f => f._id == fileUpload._id, fileUpload);
                files.Add(fileUpload);
            }
            User user = collection.Find(u => u._id == ObjectId.Parse(provider.FormData["UserID"])).FirstOrDefault();
            user.ProfileCoverPic = files.ElementAt(0);
            collection.ReplaceOne(u => u._id == ObjectId.Parse(provider.FormData["UserID"]), user);
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.SerializeObject(user));
        }
        [Route("api/index/login")]
        [HttpGet]
        public User login(string email, string password)
        {
            var collection = database.GetCollection<User>("Users");
            User user = collection.Find(x => (x.EmailRegistration == email || x.Email == email) && x.Password == password).FirstOrDefault();
            if (user != null) user.Password = null;
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
                                        DateOfBirth = u.DateOfBirth,
                                        Gender = u.Gender,
                                        City = u.City,
                                        AboutMe = u.AboutMe,
                                        ProfilePic = u.ProfilePic,
                                        ProfileCoverPic = u.ProfileCoverPic
                                    }).FirstOrDefault();
            user.friendships = collectionFriendship.Find(f => objects.Contains(f.FriendshipStarterUserId) && objects.Contains(f.FriendUserId)).ToList();
            return user;
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
            var collectionFiles = database.GetCollection<FileUpload>("Files");
            var collectionPosts = database.GetCollection<Post>("Posts");

            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);

            await Request.Content.ReadAsMultipartAsync(provider);

            List<FileUpload> files = new List<FileUpload>();
            DateTime datetime = DateTime.Now;
            foreach (MultipartFileData file in provider.FileData)
            {
                FileUpload fileUpload = new FileUpload();
                fileUpload.UserID = ObjectId.Parse(provider.FormData["UserID"]);
                fileUpload.FileType = provider.FormData["FileType"];
                fileUpload.FileName = file.Headers.ContentDisposition.FileName.Replace('\"'.ToString(), String.Empty).Replace('"'.ToString(), String.Empty);
                fileUpload.FileBaseUrls = new List<string> { Request.RequestUri.GetLeftPart(UriPartial.Authority) };
                fileUpload.UploadDateTime = datetime;
                collectionFiles.InsertOne(fileUpload);
                string fileName = fileUpload._id.ToString() + "." + file.Headers.ContentDisposition.FileName.Split('.')[file.Headers.ContentDisposition.FileName.Split('.').Length - 1].Replace('\"'.ToString(), String.Empty);
                File.Move(file.LocalFileName, Path.Combine(root, fileName));
                List<string> newUrls = new List<string>();
                foreach (string fileUpload1 in fileUpload.FileBaseUrls)
                    newUrls.Add(fileUpload1 + "/files/" + fileName);
                fileUpload.FileBaseUrls = newUrls;
                collectionFiles.ReplaceOne(f => f._id == fileUpload._id, fileUpload);
                files.Add(fileUpload);
            }
            Post post = new Post();
            post.PostContent = provider.FormData["PostContent"];
            post.Files = files;
            post.FileType = provider.FormData["FileType"];
            post.UserID = ObjectId.Parse(provider.FormData["UserID"]);
            post.CreateDateTime = datetime;
            collectionPosts.InsertOne(post);

            return Request.CreateResponse(HttpStatusCode.OK, "success");
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

            List<PostDetailed> posts = (from p in collectionPosts.AsQueryable()
                                        join u in collectionUsers.AsQueryable() on p.UserID equals u._id into user
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

            List<PostDetailed> posts = (from p in collectionPosts.AsQueryable()
                                        join u in collectionUsers.AsQueryable() on p.UserID equals u._id into user
                                        where p.CreateDateTime < post.CreateDateTime
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
        [Route("api/index/createcomment")]
        [HttpPost]
        public async Task<HttpResponseMessage> createcomment()
        {
            var collectionFiles = database.GetCollection<FileUpload>("Files");
            var collectionComments = database.GetCollection<Comment>("Comments");

            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);

            await Request.Content.ReadAsMultipartAsync(provider);

            List<FileUpload> files = new List<FileUpload>();
            DateTime datetime = DateTime.Now;
            foreach (MultipartFileData file in provider.FileData)
            {
                FileUpload fileUpload = new FileUpload();
                fileUpload.UserID = ObjectId.Parse(provider.FormData["UserID"]);
                fileUpload.FileType = provider.FormData["FileType"];
                fileUpload.FileName = file.Headers.ContentDisposition.FileName.Replace('\"'.ToString(), String.Empty).Replace('"'.ToString(), String.Empty);
                fileUpload.FileBaseUrls = new List<string> { Request.RequestUri.GetLeftPart(UriPartial.Authority) };
                fileUpload.UploadDateTime = datetime;
                collectionFiles.InsertOne(fileUpload);
                string fileName = fileUpload._id.ToString() + "." + file.Headers.ContentDisposition.FileName.Split('.')[file.Headers.ContentDisposition.FileName.Split('.').Length - 1].Replace('\"'.ToString(), String.Empty);
                File.Move(file.LocalFileName, Path.Combine(root, fileName));
                List<string> newUrls = new List<string>();
                foreach (string fileUpload1 in fileUpload.FileBaseUrls)
                    newUrls.Add(fileUpload1 + "/files/" + fileName);
                fileUpload.FileBaseUrls = newUrls;
                collectionFiles.ReplaceOne(f => f._id == fileUpload._id, fileUpload);
                files.Add(fileUpload);
            }
            Comment comment = new Comment();
            comment.PostID = ObjectId.Parse(provider.FormData["PostID"]);
            comment.CommentContent = provider.FormData["CommentContent"];
            comment.Files = files;
            comment.FileType = provider.FormData["FileType"];
            comment.UserID = ObjectId.Parse(provider.FormData["UserID"]);
            comment.CreateDateTime = datetime;
            collectionComments.InsertOne(comment);

            return Request.CreateResponse(HttpStatusCode.OK, "success");
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
            var collectionFiles = database.GetCollection<FileUpload>("Files");
            var collectionMessages = database.GetCollection<Message>("Messages");

            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);

            await Request.Content.ReadAsMultipartAsync(provider);

            List<FileUpload> files = new List<FileUpload>();
            DateTime datetime = DateTime.Now;
            foreach (MultipartFileData file in provider.FileData)
            {
                FileUpload fileUpload = new FileUpload();
                fileUpload.UserID = ObjectId.Parse(provider.FormData["FromUserID"]);
                fileUpload.FileType = provider.FormData["FileType"];
                fileUpload.FileName = file.Headers.ContentDisposition.FileName.Replace('\"'.ToString(), String.Empty).Replace('"'.ToString(), String.Empty);
                fileUpload.FileBaseUrls = new List<string> { Request.RequestUri.GetLeftPart(UriPartial.Authority) };
                fileUpload.UploadDateTime = datetime;
                collectionFiles.InsertOne(fileUpload);
                string fileName = fileUpload._id.ToString() + "." + file.Headers.ContentDisposition.FileName.Split('.')[file.Headers.ContentDisposition.FileName.Split('.').Length - 1].Replace('\"'.ToString(), String.Empty);
                File.Move(file.LocalFileName, Path.Combine(root, fileName));
                List<string> newUrls = new List<string>();
                foreach (string fileUpload1 in fileUpload.FileBaseUrls)
                    newUrls.Add(fileUpload1 + "/files/" + fileName);
                fileUpload.FileBaseUrls = newUrls;
                collectionFiles.ReplaceOne(f => f._id == fileUpload._id, fileUpload);
                files.Add(fileUpload);
            }
            Message message = new Message();
            message.MessageContent = provider.FormData["MessageContent"];
            message.Files = files;
            message.FileType = provider.FormData["FileType"];
            message.FromUserID = ObjectId.Parse(provider.FormData["FromUserID"]);
            message.ToUserID = ObjectId.Parse(provider.FormData["ToUserID"]);
            message.CreateDateTime = datetime;
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
                                                  FromUsers = (List<User>)fromusers,
                                                  ToUsers = (List<User>)tousers
                                              }).FirstOrDefault();
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.SerializeObject(detailedMessage));
        }
        [Route("api/index/retrievemessages")]
        [HttpGet]
        public List<MessageDetailed> retrievemessages(string userone, string usertwo)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            var collectionUsers = database.GetCollection<User>("Users");
            User user = collectionUsers.Find(u => u.Email == userone + atNextMail).FirstOrDefault();
            User user2 = collectionUsers.Find(u => u.Email == usertwo + atNextMail).FirstOrDefault();
            if (user._id == null || user2._id == null) return new List<MessageDetailed>();
            var inq = new ObjectId[] { user._id, user2._id };
            return (from m in collectionMessages.AsQueryable()
                    join u in collectionUsers.AsQueryable() on m.FromUserID equals u._id into fromusers
                    join u2 in collectionUsers.AsQueryable() on m.ToUserID equals u2._id into tousers
                    where inq.Contains(m.FromUserID) && inq.Contains(m.ToUserID)
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
                        FromUsers = (List<User>)fromusers,
                        ToUsers = (List<User>)tousers
                    }).Take(12).ToList().OrderBy(m => m.CreateDateTime).ToList();
        }
        [Route("api/index/retrievemessagesafter")]
        [HttpGet]
        public List<MessageDetailed> retrievemessagesafter(string userone, string usertwo, string lastmessageid)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            var collectionUsers = database.GetCollection<User>("Users");
            User user = collectionUsers.Find(u => u.Email == userone + atNextMail).FirstOrDefault();
            User user2 = collectionUsers.Find(u => u.Email == usertwo + atNextMail).FirstOrDefault();
            if (user._id == null || user2._id == null) return new List<MessageDetailed>();
            var inq = new ObjectId[] { user._id, user2._id };
            Message message = collectionMessages.Find(m => m._id == ObjectId.Parse(lastmessageid)).FirstOrDefault();
            return (from m in collectionMessages.AsQueryable()
                    join u in collectionUsers.AsQueryable() on m.FromUserID equals u._id into fromusers
                    join u2 in collectionUsers.AsQueryable() on m.ToUserID equals u2._id into tousers
                    where inq.Contains(m.FromUserID) && inq.Contains(m.ToUserID) && message.CreateDateTime > m.CreateDateTime
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
                        FromUsers = (List<User>)fromusers,
                        ToUsers = (List<User>)tousers
                    }).Take(12).ToList().OrderBy(m => m.CreateDateTime).ToList();
        }
        [Route("api/index/retrieveundreadmessagescount")]
        [HttpGet]
        public int retrieveundreadmessagescount(string userone, string usertwo)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");
            var inq = new ObjectId[] { ObjectId.Parse(userone), ObjectId.Parse(usertwo) };
            return (from m in collectionMessages.AsQueryable()
                    where inq.Contains(m.FromUserID) && inq.Contains(m.ToUserID) && !m.MessageRead
                    select m._id
                   ).Count();
        }
        [Route("api/index/retrievemessagebetween")]
        [HttpGet]
        public Message retrievemessagebetween(string userone, string usertwo)
        {
            var collectionMessages = database.GetCollection<Message>("Messages");

            return (from m in collectionMessages.AsQueryable()
                    where m.FromUserID == ObjectId.Parse(userone) && m.ToUserID == ObjectId.Parse(usertwo)
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
        }
        [Route("api/index/retrieveactivechats")]
        [HttpGet]
        public List<ActiveChats> retrieveactivechats(string userid)
        {
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionMessages = database.GetCollection<Message>("Messages");

            List<ActiveChats> chats = (from m in collectionMessages.AsQueryable()
                                       join u in collectionUsers.AsQueryable() on m.FromUserID equals u._id into fromusers
                                       join u2 in collectionUsers.AsQueryable() on m.ToUserID equals u2._id into tousers
                                       where m.FromUserID == ObjectId.Parse(userid) || m.ToUserID == ObjectId.Parse(userid)
                                       select new ActiveChats()
                                       {
                                           FromUserId = m.FromUserID,
                                           ToUserId = m.ToUserID,
                                           FromUsers = (List<User>)fromusers,
                                           ToUsers = (List<User>)tousers,
                                           DateTimeNow = DateTime.Now
                                       }
                    ).Distinct().ToList();
            for (int i = 0; i < chats.Count; i++)
            {
                chats.ElementAt(i).LatestMessage = retrievemessagebetween(chats.ElementAt(i).FromUserId.ToString(), chats.ElementAt(i).ToUserId.ToString());
                chats.ElementAt(i).LastMessageDate = chats.ElementAt(i).LatestMessage.CreateDateTime;
            }
            chats = chats.OrderByDescending(c => c.LastMessageDate).ToList();
            List<ActiveChats> activeChats = new List<ActiveChats>();
            foreach (ActiveChats chat in chats)
            {
                if (!activeChats.Any(item => item.FromUserId == chat.ToUserId && item.ToUserId == chat.FromUserId))
                    activeChats.Add(chat);
            }
            for (int i = 0; i < activeChats.Count; i++)
            {
                activeChats.ElementAt(i).UnreadMessagesCount = retrieveundreadmessagescount(chats.ElementAt(i).FromUserId.ToString(), chats.ElementAt(i).ToUserId.ToString());
            }
            return activeChats;
        }

        [Route("api/index/createdefaultsessionchallenge")]
        [HttpPost]
        public async Task<HttpResponseMessage> createdefaultsessionchallenge()
        {
            var collectionFiles = database.GetCollection<FileUpload>("Files");
            var collectionChallenges = database.GetCollection<DefaultSessionChallenge>("Challenges");

            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);

            await Request.Content.ReadAsMultipartAsync(provider);

            List<FileUpload> files = new List<FileUpload>();
            DateTime datetime = DateTime.Now;
            foreach (MultipartFileData file in provider.FileData)
            {
                FileUpload fileUpload = new FileUpload();
                fileUpload.UserID = ObjectId.Parse(provider.FormData["ChallengeCreatorID"]);
                fileUpload.FileType = provider.FormData["FileType"];
                fileUpload.FileName = file.Headers.ContentDisposition.FileName.Replace('\"'.ToString(), String.Empty).Replace('"'.ToString(), String.Empty);
                fileUpload.FileBaseUrls = new List<string> { Request.RequestUri.GetLeftPart(UriPartial.Authority) };
                fileUpload.UploadDateTime = datetime;
                collectionFiles.InsertOne(fileUpload);
                string fileName = fileUpload._id.ToString() + "." + file.Headers.ContentDisposition.FileName.Split('.')[file.Headers.ContentDisposition.FileName.Split('.').Length - 1].Replace('\"'.ToString(), String.Empty);
                File.Move(file.LocalFileName, Path.Combine(root, fileName));
                List<string> newUrls = new List<string>();
                foreach (string fileUpload1 in fileUpload.FileBaseUrls)
                    newUrls.Add(fileUpload1 + "/files/" + fileName);
                fileUpload.FileBaseUrls = newUrls;
                collectionFiles.ReplaceOne(f => f._id == fileUpload._id, fileUpload);
                files.Add(fileUpload);
            }
            DefaultSessionChallenge challenge = new DefaultSessionChallenge();
            challenge.Answer = provider.FormData["Answer"];
            challenge.Category = provider.FormData["Category"];
            challenge.CreateDateTime = datetime;
            challenge.Points = Convert.ToInt32(provider.FormData["Points"]);
            challenge.Question = provider.FormData["Question"];
            challenge.TimeInSeconds = Convert.ToInt32(provider.FormData["TimeInSeconds"]);
            Clue clue = new Clue();
            clue.Type = files.Count > 0 ? files.ElementAt(0).FileType : "none";
            clue.Description = provider.FormData["Description"];
            clue.Files = files;
            challenge.Clue = clue;
            collectionChallenges.InsertOne(challenge);

            return Request.CreateResponse(HttpStatusCode.OK, "success");
        }
        [Route("api/index/retrievedefaultsessionchallenge")]
        [HttpGet]
        public List<DefaultSessionChallenge> retrievedefaultsessionchallenge()
        {
            var collectionChallenges = database.GetCollection<DefaultSessionChallenge>("Challenges");
            return collectionChallenges.Find(new BsonDocument()).ToList();
        }

        [Route("api/index/uploadfiles")]
        [HttpPost]
        public async Task<HttpResponseMessage> uploadfiles()
        {
            var collectionFiles = database.GetCollection<FileUpload>("Files");

            string root = HttpContext.Current.Server.MapPath("~/Files");
            var provider = new MultipartFormDataStreamProvider(root);

            await Request.Content.ReadAsMultipartAsync(provider);
            List<FileUpload> files = new List<FileUpload>();
            DateTime datetime = DateTime.Now;
            foreach (MultipartFileData file in provider.FileData)
            {
                FileUpload fileUpload = new FileUpload();
                fileUpload.UserID = ObjectId.Parse(provider.FormData["FileUploaderID"]);
                fileUpload.FileType = provider.FormData["FileType"];
                fileUpload.FileName = file.Headers.ContentDisposition.FileName.Replace('\"'.ToString(), String.Empty).Replace('"'.ToString(), String.Empty);
                fileUpload.FileBaseUrls = new List<string> { Request.RequestUri.GetLeftPart(UriPartial.Authority) };
                fileUpload.UploadDateTime = datetime;
                collectionFiles.InsertOne(fileUpload);
                string fileName = fileUpload._id.ToString() + "." + file.Headers.ContentDisposition.FileName.Split('.')[file.Headers.ContentDisposition.FileName.Split('.').Length - 1].Replace('\"'.ToString(), String.Empty);
                File.Move(file.LocalFileName, Path.Combine(root, fileName));
                List<string> newUrls = new List<string>();
                foreach (string fileUpload1 in fileUpload.FileBaseUrls)
                    newUrls.Add(fileUpload1 + "/files/" + fileName);
                fileUpload.FileBaseUrls = newUrls;
                collectionFiles.ReplaceOne(f => f._id == fileUpload._id, fileUpload);
                files.Add(fileUpload);
            }
            return Request.CreateResponse(HttpStatusCode.OK, JsonConvert.SerializeObject(files));
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
            var collectionUsers = database.GetCollection<User>("Users");

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
                                    users = (List<User>)user
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
                                    users = (List<User>)user
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
                                    users = (List<User>)user
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
                                    users = (List<User>)user
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
                    currentUser.users = new List<User>() { collectionUsers.Find(u => u._id == ObjectId.Parse(userid)).FirstOrDefault() };
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
                                           users = (List<User>)user
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
                                           users = (List<User>)user
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
                                           users = (List<User>)user
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
                                           users = (List<User>)user
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
            collectionFriendships.InsertOne(friendship1);
            return friendship1;
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
            var collectionUsers = database.GetCollection<User>("Users");
            return (from f in collectionFriendships.AsQueryable()
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
                        FriendshipStarter = (List<User>)starter,
                        FriendUser = (List<User>)friend
                    }).Take(12).ToList();
        }
        [Route("api/index/retrievefriendshipsafter")]
        [HttpGet]
        public List<FriendshipDetailed> retrievefriendshipsafter(string userid, string lastfriendshipid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            var collectionUsers = database.GetCollection<User>("Users");
            Friendship friendship = collectionFriendships.Find(f => f._id == ObjectId.Parse(lastfriendshipid)).FirstOrDefault();
            return (from f in collectionFriendships.AsQueryable()
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
                        FriendshipStarter = (List<User>)starter,
                        FriendUser = (List<User>)friend
                    }).Take(12).ToList();
        }
        [Route("api/index/retrievefriendshiprequests")]
        [HttpGet]
        public List<FriendshipDetailed> retrievefriendshiprequests(string userid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            var collectionUsers = database.GetCollection<User>("Users");
            return (from f in collectionFriendships.AsQueryable()
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
                        FriendshipStarter = (List<User>)starter,
                        FriendUser = (List<User>)friend
                    }).Take(12).ToList();
        }
        [Route("api/index/retrievefriendshiprequestsafter")]
        [HttpGet]
        public List<FriendshipDetailed> retrievefriendshiprequestsafter(string userid, string lastfriendshipid)
        {
            var collectionFriendships = database.GetCollection<Friendship>("Friendships");
            var collectionUsers = database.GetCollection<User>("Users");
            Friendship friendship = collectionFriendships.Find(f => f._id == ObjectId.Parse(lastfriendshipid)).FirstOrDefault();
            return (from f in collectionFriendships.AsQueryable()
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
                        FriendshipStarter = (List<User>)starter,
                        FriendUser = (List<User>)friend
                    }).Take(12).ToList();
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
                                         _id = u.Email,
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
                                                 _id = u.Email,
                                                 SearchContent = u.FirstName + " " + u.LastName,
                                                 SearchType = "user"
                                             }).ToList();
                foreach (Search search in searchesTemp)
                {
                    if (!searches.Any(s => s._id == search._id))
                        searches.Add(search);
                }
            }
            else
            {
                List<Search> searchesTemp = (from u in collectionUsers.AsQueryable()
                                             where u.FirstName.ToLower().Contains(query) || u.LastName.ToLower().Contains(query)
                                             select new Search()
                                             {
                                                 _id = u.Email,
                                                 SearchContent = u.FirstName + " " + u.LastName,
                                                 SearchType = "user"
                                             }).Take(5).ToList();
                foreach (Search search in searchesTemp)
                {
                    if (!searches.Any(s => s._id == search._id))
                        searches.Add(search);
                }
            }
            searches = searches.Concat((from p in collectionPosts.AsQueryable()
                                        where p.PostContent.ToLower().Contains(query) && !p.PostContent.Contains("<img style=")
                                        select new Search()
                                        {
                                            _id = p._id.ToString(),
                                            SearchContent = p.PostContent,
                                            SearchType = "post"
                                        }).Take(5).ToList()).ToList();
            return searches.Take(10).ToList();
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
        public List<NotificationDetailed> retrievenotificationsafter(string userid,string lastnotificationid)
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
            return new HeaderStats() {
                FriendRequests = (from f in collectionFriends.AsQueryable()
                                  where f.FriendUserId == ObjectId.Parse(userid) && !f.FriendshipApproved
                                  select f._id).Count(),
                Notifications = (from n in collectionNotifications.AsQueryable()
                                 where n.UserID == ObjectId.Parse(userid) && n.Read
                                 select n._id).Count(),
                Messages = (from m in collectionMessages.AsQueryable()
                            where m.ToUserID == ObjectId.Parse(userid)
                            select m._id).Count()

            };
        }
    }
}
