package services;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;


public class NotificationsService {
	public HttpClient client = HttpClient.newHttpClient();
	public String apiUrl = "http://www.nextchallenge.co.za:93/api/index/";
	public HttpRequest getRequest(String actionParams) {
		return HttpRequest.newBuilder()
			      .uri(URI.create(apiUrl + actionParams))
			      .header("Content-Type", "application/json")
			      .GET()
			      .build();
	}
	public HttpRequest postRequest(String actionParams,String body) {
		return HttpRequest.newBuilder()
			      .uri(URI.create(apiUrl + actionParams))
			      .header("Content-Type", "application/json")
			      .POST(BodyPublishers.ofString(body))
			      .build();
	}
	public HttpRequest putRequest(String actionParams,String body) {
		return HttpRequest.newBuilder()
			      .uri(URI.create(apiUrl + actionParams))
			      .header("Content-Type", "application/json")
			      .PUT(BodyPublishers.ofString(body))
			      .build();
	}
	public void updateChatStatus(String UserID,String ChatStatus) {
		try {
			client.send(putRequest("updatechatstatus?userid=" + UserID + "&chatstatus=" + ChatStatus,""), BodyHandlers.ofString());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
