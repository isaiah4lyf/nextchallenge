using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Leaderboard
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public int TotalScore { set; get; }
        public int WeeklyScore { set; get; }
        public int WeekendScore { set; get; }
        public int HighestStreak { set; get; }
    }
    public class LeaderboardPost
    {
        public string _id { set; get; }
        public string UserID { set; get; }
        public int TotalScore { set; get; }
        public int WeeklyScore { set; get; }
        public int WeekendScore { set; get; }
        public int HighestStreak { set; get; }
    }

    public class LeaderboardDetailed
    {
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public int TotalScore { set; get; }
        public int WeeklyScore { set; get; }
        public int WeekendScore { set; get; }
        public int HighestStreak { set; get; }
        public int Position { set; get; }
        public bool AddedLast { set; get; }
        public List<UserMinInfo> users { set; get; }
    }

    public class LeaderboardConverter
    {
        public Leaderboard convert(LeaderboardPost leaderboard)
        {
            return new Leaderboard()
            {
                _id = leaderboard._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(leaderboard._id),
                UserID = leaderboard.UserID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(leaderboard.UserID),
                TotalScore = leaderboard.TotalScore,
                WeeklyScore = leaderboard.WeeklyScore,
                WeekendScore = leaderboard.WeekendScore,
                HighestStreak = leaderboard.HighestStreak
            };
        }
    }

}