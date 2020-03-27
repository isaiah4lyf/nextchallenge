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
        static string atNextMail = "@gmail.com"; //To be replaced with @nextchallenge.co.za

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
            var collectionLeaderboards = database.GetCollection<Leaderboard>("Leaderboards");
            var collection = database.GetCollection<User>("Users");
            collection.InsertOne(user);

            Leaderboard leaderboard = new Leaderboard() { UserID = user._id };
            collectionLeaderboards.InsertOne(leaderboard);

            return user;
        }
        [Route("api/index/retrieveuser")]
        [HttpGet]
        public User retrieveuser(string name)
        {
            var collection = database.GetCollection<User>("Users");
            User user = collection.Find(x => x.Email == name + atNextMail).FirstOrDefault();
            if (user != null) user.Password = null;
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

            return Request.CreateResponse(HttpStatusCode.OK, "success");
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
    }
}
