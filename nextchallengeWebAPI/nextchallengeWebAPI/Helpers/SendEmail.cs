using nextchallengeWebAPI.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Web;

namespace nextchallengeWebAPI.Helpers
{
	public class SendEmail
	{
		public string Send(EmailConfiguration config)
		{

			try
			{
				SmtpClient client = new SmtpClient();
				client.Port = config.Port;
				client.Host = config.SMTPHost;
				client.EnableSsl = true;
				client.Timeout = 10000;
				client.DeliveryMethod = SmtpDeliveryMethod.Network;
				client.UseDefaultCredentials = true;
				client.Credentials = new System.Net.NetworkCredential(config.DomainEmail, config.DomainEmailPass);
				MailMessage mail = new MailMessage();
				mail.BodyEncoding = UTF8Encoding.UTF8;
				mail.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;
				mail.IsBodyHtml = true;
				mail.From = new MailAddress(config.DomainEmail);
				mail.To.Add(config.EmailTo);
				mail.Subject = config.EmailSubject;
				mail.AlternateViews.Add(BodyGeneric(config));
				client.Send(mail);
				return "Successful";
			}
			catch (Exception ex) { 
				return ex.ToString(); 
			};
		}
		public AlternateView BodyGeneric(EmailConfiguration config)
		{
			string htmlBody = String.Empty;
			using (StreamReader sr = File.OpenText(config.EmailFilePath))
			{
				for (int i = 0; i < 129; i++)
					htmlBody += sr.ReadLine();
			}
			htmlBody = htmlBody.Replace("fav.png", config.IconUrl);
			htmlBody = htmlBody.Replace("{{next-web-link}}", config.IconLink);
			htmlBody = htmlBody.Replace("{{email-body-title}}", config.EmailBodyTitle);
			htmlBody = htmlBody.Replace("{{email-body}}", config.EmailBody);
			htmlBody = htmlBody.Replace("{{button-link}}", config.ButtonLink);
			htmlBody = htmlBody.Replace("{{button-text}}", config.ButtonText);
			AlternateView alternateView = AlternateView.CreateAlternateViewFromString(htmlBody, null, MediaTypeNames.Text.Html);
			return alternateView;
		}

	}
}