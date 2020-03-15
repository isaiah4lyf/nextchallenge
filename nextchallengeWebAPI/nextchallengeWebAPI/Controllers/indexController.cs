using MongoDB.Bson;
using MongoDB.Driver;
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

        [Route("api/index/login")]
        [HttpGet]
        public User login(string email, string password)
        {
            var collection = database.GetCollection<User>("Users");
            User user = collection.Find(x => x.Email == email && x.Password == password).FirstOrDefault();
            if (user != null) user.Password = null;
            return user;
        }
        [Route("api/index/createuser")]
        [HttpPost]
        public User createuser([FromBody]User user)
        {
            var collection = database.GetCollection<User>("Users");
            collection.InsertOne(user);
            return user;
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
        public List<PostDetailed> retrieveposts()
        {
            var collectionPosts = database.GetCollection<Post>("Posts");
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionPostLikes = database.GetCollection<PostLike>("PostLike");
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
            }
            return posts;
        }
        [Route("api/index/retrievepostsafter")]
        [HttpGet]
        public List<PostDetailed> retrievepostsafter(string postid)
        {
            var collectionPosts = database.GetCollection<Post>("Posts");
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionPostLikes = database.GetCollection<PostLike>("PostLike");
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
            }
            return posts;
        }
        [Route("api/index/retrievepost")]
        [HttpGet]
        public PostDetailed retrievepost(string postid)
        {
            var collectionPosts = database.GetCollection<Post>("Posts");
            var collectionUsers = database.GetCollection<User>("Users");
            var collectionComments = database.GetCollection<Comment>("Comments");
            var collectionPostLikes = database.GetCollection<PostLike>("PostLike");
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
        public CommentDetailed retrievecommentlatest(string postid,string topofcommentid)
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
        public int dislikepost(string postid,string userid)
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
            var collectionPostLikes = database.GetCollection<PostLike>("PostLike");
            collectionPostLikes.InsertOne(new PostLike() { PostID = ObjectId.Parse(postid), UserID = ObjectId.Parse(userid), CreateDateTime = DateTime.Now });
            return Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == ObjectId.Parse(postid)));
        }
        [Route("api/index/deletepostlike")]
        [HttpDelete]
        public int deletepostlike(string postid, string userid)
        {
            PostLike postDisLike = new PostLike() { PostID = ObjectId.Parse(postid), UserID = ObjectId.Parse(userid) };
            var collectionPostLikes = database.GetCollection<PostLike>("PostLike");
            collectionPostLikes.DeleteOne(d => d.PostID == postDisLike.PostID && d.UserID == postDisLike.UserID);
            return Convert.ToInt32(collectionPostLikes.CountDocuments(d => d.PostID == postDisLike.PostID));
        }
    }
}
