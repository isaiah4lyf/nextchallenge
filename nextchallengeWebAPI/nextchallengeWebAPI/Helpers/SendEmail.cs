using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Web;

namespace nextchallengeWebAPI.Helpers
{
	public class SendEmail
	{
		public string Send()
		{
			try
			{
				SmtpClient client = new SmtpClient();
				client.Host = "smtp.office365.com";
				//client.EnableSsl = true;
				client.TargetName = "STARTTLS/smtp.office365.com";
				client.Port = 587;
				//client.EnableSsl = true;
				client.Timeout = 10000;
				client.DeliveryMethod = SmtpDeliveryMethod.Network;
				client.UseDefaultCredentials = false;
				client.Credentials = new System.Net.NetworkCredential("matome@nextchallenge.co.za", "19960517Mi");

				MailMessage mail = new MailMessage();
				mail.BodyEncoding = UTF8Encoding.UTF8;
				mail.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;
				mail.IsBodyHtml = true;
				mail.From = new MailAddress("matome@nextchallenge.co.za");
				mail.To.Add("isaiah.ramafalo.5@gmail.com");
				mail.Subject = "registration";
				//mail.AlternateViews.Add(Body());
				client.Send(mail);
				return "Successful";
			}
			catch (Exception ex) { return ex.ToString(); };
		}
		private AlternateView Body()
		{
			string htmlBody = "<html>";
			htmlBody += "<head>";
			htmlBody += "</head>";
			htmlBody += "<body>";
//			htmlBody += "<div style='background-image: url(http://" + WebServiceServerAddress + "/Images/Theme.jpg);  background-repeat: no-repeat; background-position: center; background-size: cover; height: 400px; width: 100%;' >";
			htmlBody += "<div style='height: 75px; width:100%;' ></div>";
			htmlBody += "<table style='margin-left: auto; margin-right: auto; width: 85%; height: 250px; background-color: white;' >";
			htmlBody += "<tr style='height: 50px;'>";
			htmlBody += "<td>";
			htmlBody += "<img style='margin-top: -35px; width: 60%; height: 50px; margin-left:20%; margin-right:0%;' src='http:///Images/Capture.png' />";
			htmlBody += "</td>";
			htmlBody += "</tr>";
			htmlBody += "<tr style='height: 50px;' >";
			htmlBody += "<td>";
			htmlBody += "<p style='margin-top: -85px; text-align:center; width: 80%; height: 10px; margin-left:10%; margin-right:0%; color: black; font-weight: 300; font-size: 18px;' > We are glad you joined us, please click below to confirm your account.</p>";
			htmlBody += "</td>";
			htmlBody += "</tr>";
			htmlBody += "<tr style='height: 50px;' >";
			htmlBody += "<td>";
//			htmlBody += "<a style='margin-top: -85px; width: 30%; margin-left:35%; margin-right:0%; height: 26px; text-decoration: none; background: #0794C1; border: 0.5px solid #0794C1; font-size: 18px; color: white; text-align: center; display: block;' href='http://" + WebsiteServerAddress + "/Default/ConfirmEmail?ConfirmationCode=" + ConfirmationCode + "' ><span style='text-top: 45px;'>Confirm your email</span></a>";
			htmlBody += "</td>";
			htmlBody += "</tr>";
			htmlBody += "</table>";
			htmlBody += "</div>";
			htmlBody += "</body>";
			htmlBody += "</html>";
			AlternateView alternateView = AlternateView.CreateAlternateViewFromString(htmlBody, null, MediaTypeNames.Text.Html);
			return alternateView;
		}
	}
}