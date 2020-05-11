using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Friendship
    {
		[XmlIgnore]
		public ObjectId _id { get; set; }
		public ObjectId FriendshipStarterUserId { get; set; }
		public ObjectId FriendUserId { get; set; }
		public DateTime CreateDateTime { get; set; }
		public bool FriendshipApproved { get; set; }
		public DateTime FriendshipApproveDatetime { get; set; }
	}
	public class FriendshipPost
	{
		public string _id { get; set; }
		public string FriendshipStarterUserId { get; set; }
		public string FriendUserId { get; set; }
		public DateTime CreateDateTime { get; set; }
		public bool FriendshipApproved { get; set; }
		public DateTime FriendshipApproveDatetime { get; set; }
	}
	public class FriendshipDetailed
	{
		[XmlIgnore]
		public ObjectId _id { get; set; }
		public ObjectId FriendshipStarterUserId { get; set; }
		public ObjectId FriendUserId { get; set; }
		public DateTime CreateDateTime { get; set; }
		public bool FriendshipApproved { get; set; }
		public DateTime FriendshipApproveDatetime { get; set; }
		public List<UserMinInfo> FriendshipStarter { set; get; }
		public List<UserMinInfo> FriendUser { set; get; }
		public Company LatestWork { set; get; }
		public School LatestEducation { set; get; }
	}
	public class FriendshipConverter 
	{
		public Friendship Convert(FriendshipPost friendship)
		{
			return new Friendship()
			{
				_id = friendship._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(friendship._id),
				FriendshipStarterUserId = friendship.FriendshipStarterUserId == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(friendship.FriendshipStarterUserId),
				FriendUserId = friendship.FriendUserId == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(friendship.FriendUserId),
				CreateDateTime = friendship.CreateDateTime,
				FriendshipApproved = friendship.FriendshipApproved,
				FriendshipApproveDatetime = friendship.FriendshipApproveDatetime
			};
		}
	}
}