using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class User
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailRegistration { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public DateOfBirth DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string City { get; set; }
        public string AboutMe { get; set; }
        public string ChatStatus { get; set; }
        public int Attempts { get; set; }
        public FileUpload ProfilePic { get; set; }
        public FileUpload ProfileCoverPic { get; set; }
    }
    public class UserMinInfo
    {
        public ObjectId _id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        [JsonIgnore, XmlIgnore]
        public string EmailRegistration { set { } get { return null; }  }
        public string Email { get; set; }
        [JsonIgnore, XmlIgnore]
        public string Password { set { } get { return null; } }
        [JsonIgnore, XmlIgnore]
        public DateOfBirth DateOfBirth { set { } get { return null; } }
        [JsonIgnore, XmlIgnore]
        public string Gender { set { } get { return null; } }
        [JsonIgnore, XmlIgnore]
        public string City { set { } get { return null; } }
        [JsonIgnore, XmlIgnore]
        public string AboutMe { set { } get { return null; } }
        public string ChatStatus { get; set; }
        [JsonIgnore, XmlIgnore]
        public int Attempts { set { } get { return 0; } }
        public FileUpload ProfilePic { get; set; }
        public FileUpload ProfileCoverPic { get; set; }
    }
    public class UserPost
    {
        public string _id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailRegistration { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public DateOfBirth DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string City { get; set; }
        public string AboutMe { get; set; }
        public string ChatStatus { get; set; }
        public int Attempts { get; set; }
        public FileUpload ProfilePic { get; set; }
        public FileUpload ProfileCoverPic { get; set; }
    }
    public class DateOfBirth {
        public int Day;
        public string Month;
        public int Year;
    }
    public class UserBasicInfo
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public DateOfBirth DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string City { get; set; }
        public string AboutMe { get; set; }

    }
    public class UserViewProfile
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public List<Friendship> friendships { get; set; }
        public DateOfBirth DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string City { get; set; }
        public string AboutMe { get; set; }
        public string ChatStatus { get; set; }
        public FileUpload ProfilePic { get; set; }
        public FileUpload ProfileCoverPic { get; set; }

    }
    public class UserConverter 
    {
        public User Convert(UserPost userPost)
        {
            return new User()
            {
                _id = ObjectId.Parse(userPost._id),
                FirstName = userPost.FirstName,
                LastName = userPost.LastName,
                EmailRegistration = userPost.EmailRegistration,
                Email = userPost.Email,
                Password = userPost.Password,
                DateOfBirth = userPost.DateOfBirth,
                Gender = userPost.Gender,
                City = userPost.City,
                AboutMe = userPost.AboutMe,
                ChatStatus = userPost.ChatStatus,
                ProfilePic = userPost.ProfilePic,
                ProfileCoverPic = userPost.ProfileCoverPic
            };
        }
    }
}