using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Level
    {
        [XmlIgnore]
        public ObjectId _id { get; set; }
        public int _level { set; get; }
        public int UnlockedAt{ set; get; }
        public DateTime CreateDateTime { set; get; } 
    }
    public class LevelPost
    {
        public string _id { get; set; }
        public int _level { set; get; }
        public int UnlockedAt { set; get; }
        public DateTime CreateDateTime { set; get; }
    }
    public class LevelConverter
    {
        public Level Convert(LevelPost level)
        {
            return new Level()
            {
                _id = level._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(level._id),
                _level = level._level,
                UnlockedAt = level.UnlockedAt,
                CreateDateTime = level.CreateDateTime
            };
        }
        public List<Level> ConvertMany(List<LevelPost> levels)
        {
            List<Level> levelsConverted = new List<Level>();
            foreach (LevelPost level in levels)
                levelsConverted.Add(Convert(level));
            return levelsConverted;
        }
    }
}