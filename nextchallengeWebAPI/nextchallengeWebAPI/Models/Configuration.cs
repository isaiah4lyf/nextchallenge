using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Configuration
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public string Group { set; get; }
        public string Name { set; get; }
        public string Description { set; get; }
        public string Value { set; get; }
        public DateTime CreateDateTime { set; get; }
    }
    public class ConfigurationPost
    {
        public string _id { set; get; }
        public string Group { set; get; }
        public string Name { set; get; }
        public string Description { set; get; }
        public string Value { set; get; }
        public DateTime CreateDateTime { set; get; }
    }
    public class ConfigurationConverter 
    {
        public Configuration Convert(ConfigurationPost configuration)
        {
            return new Configuration()
            {
                _id = configuration._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(configuration._id),
                Group = configuration.Group,
                Name = configuration.Name,
                Description = configuration.Description,
                Value = configuration.Value,
                CreateDateTime = configuration.CreateDateTime
            };
        }
        public List<Configuration> ConvertMany(List<ConfigurationPost> configs)
        {
            List<Configuration> configsConverted = new List<Configuration>();
            foreach (ConfigurationPost config in configs)
                configsConverted.Add(Convert(config));
            return configsConverted;
        }
    }

}