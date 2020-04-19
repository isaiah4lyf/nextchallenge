using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Setting
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public ObjectId UserID { set; get; }
        public string Name { set; get; }
        public string Label { set; get; }
        public string Type { set; get; }
        public string Description { set; get; }
        public bool Value { set; get; }
        public int ValueNum { set; get; }
    }
    public class DefaultSetting
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public string Name { set; get; }
        public string Label { set; get; }
        public string Type { set; get; }
        public string Description { set; get; }
        public bool Value { set; get; }
        public int ValueNum { set; get; }
    }
    public class SettingPost
    {
        public string _id { set; get; }
        public string UserID { set; get; }
        public string Name { set; get; }
        public string Label { set; get; }
        public string Type { set; get; }
        public string Description { set; get; }
        public bool Value { set; get; }
        public int ValueNum { set; get; }
    }
    public class SettingConverter
    {
        public Setting Convert(SettingPost setting)
        {
            return new Setting()
            {
                _id = setting._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(setting._id),
                UserID = setting.UserID == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(setting.UserID),
                Name = setting.Name,
                Label = setting.Label,
                Type = setting.Type,
                Description = setting.Description,
                Value = setting.Value,
                ValueNum = setting.ValueNum
            };
        }
    }
}