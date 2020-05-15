using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
	public class EmailConfiguration
	{
		[XmlIgnore]
		public ObjectId _id { get; set; }
		public string EmailType { set; get; }
		public string EmailFilePath { set; get; }
		public int Port { set; get; }
		public string SMTPHost { set; get; }
		public string DomainEmail { set; get; }
		public string DomainEmailPass { set; get; }
		public int Timeout { set; get; }
		public string EmailTo { set; get; }
		public string EmailSubject { set; get; }
		public string IconLink { set; get; }
		public string EmailBodyTitle { set; get; }
		public string EmailBody { set; get; }
		public string IconUrl { set; get; }
		public string ButtonLink { set; get; }
		public string ButtonText { set; get; }
	}
	public class EmailConfigurationPost
	{
		public string _id { get; set; }
		public string EmailType { set; get; }
		public string EmailFilePath { set; get; }
		public int Port { set; get; }
		public string SMTPHost { set; get; }
		public string DomainEmail { set; get; }
		public string DomainEmailPass { set; get; }
		public int Timeout { set; get; }
		public string EmailTo { set; get; }
		public string EmailSubject { set; get; }
		public string IconLink { set; get; }
		public string EmailBodyTitle { set; get; }
		public string EmailBody { set; get; }
		public string IconUrl { set; get; }
		public string ButtonLink { set; get; }
		public string ButtonText { set; get; }
	}
	public class EmailConfigurationConverter
	{
		public EmailConfiguration Convert(EmailConfigurationPost config)
		{
			return new EmailConfiguration()
			{
				_id = config._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(config._id),
				EmailType = config.EmailType,
				EmailFilePath = config.EmailFilePath,
				Port = config.Port,
				SMTPHost = config.SMTPHost,
				DomainEmail = config.DomainEmail,
				DomainEmailPass = config.DomainEmailPass,
				Timeout = config.Timeout,
				EmailTo = config.EmailTo,
				EmailSubject = config.EmailSubject,
				IconLink = config.IconLink,
				EmailBodyTitle = config.EmailBodyTitle,
				EmailBody = config.EmailBody,
				IconUrl = config.IconUrl,
				ButtonLink = config.ButtonLink,
				ButtonText = config.ButtonText
			};
		}
		public List<EmailConfiguration> ConvertMany(List<EmailConfigurationPost> configs)
		{
			List<EmailConfiguration> configsConverted = new List<EmailConfiguration>();
			foreach (EmailConfigurationPost config in configs)
				configsConverted.Add(Convert(config));
			return configsConverted;
		}
	}
}