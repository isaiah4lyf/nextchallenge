package services;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.List;

import com.google.gson.*;

import java.lang.reflect.Type;
import com.google.gson.reflect.TypeToken;

import session.models.*;

public class SessionService {
	public HttpClient client = HttpClient.newHttpClient();
	public String apiUrl = "http://www.nextchallenge.co.za/api/api/index/";
	//public String apiUrl = "http://localhost:44357/api/index/";
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
	public User retrieveuser(String userid) {
		User user = new User();
		HttpResponse<String> response;
		try {
			response = client.send(getRequest("retrieveusermininfo?userid=" + userid), BodyHandlers.ofString());
			user = new Gson().fromJson(response.body(), User.class);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return user;
	}
	public void updateattempts(String userid,int attemptscount) {
		try {
			client.send(putRequest("updateattempts?userid=" + userid + "&attemptscount=" + attemptscount,""), BodyHandlers.ofString());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public int retrieveattemptscount(String userid) {
		int attempts = 0;
		HttpResponse<String> response;
		try {
			response = client.send(getRequest("retrieveattemptscount?userid=" + userid), BodyHandlers.ofString());
			attempts = Integer.parseInt(response.body());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return attempts;
	}
	public List<DefaultSessionChallenge> retrievedefaultchallenges(int level) {
		Type listType = new TypeToken<List<DefaultSessionChallenge>>() {}.getType();
		List<DefaultSessionChallenge> challenges = null;
		HttpResponse<String> response;
		try {
			response = client.send(getRequest("retrievedefaultsessionchallengebylevel?level=" + level), BodyHandlers.ofString());
			challenges = new Gson().fromJson(response.body(), listType);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return challenges;
	}
	public Leaderboard retrieveleaderboard(String userid) {
		Leaderboard leaderboard = new Leaderboard();
		HttpResponse<String> response;
		try {
			response = client.send(getRequest("retrieveleaderboard?userid=" + userid), BodyHandlers.ofString());
			leaderboard = new Gson().fromJson(response.body(), Leaderboard.class);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return leaderboard;
	}
	public void updateleaderboard(Leaderboard leaderboard) {
		try {
			HttpResponse<String> response = client.send(postRequest("updateleaderboard",new Gson().toJson(leaderboard)), BodyHandlers.ofString());
			leaderboard = new Gson().fromJson(response.body(), Leaderboard.class);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public void updatechallengesanswered(String userid, int challengesanswered) {
		try {
			client.send(putRequest("updatechallengesanswered?userid=" + userid + "&challengesanswered=" + challengesanswered,""), BodyHandlers.ofString());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public int retrievechallengesanswered(String userid) {
		int value = 0;
		HttpResponse<String> response;
		try {
			response = client.send(getRequest("retrievechallengesanswered?userid=" + userid), BodyHandlers.ofString());
			value = Integer.parseInt(response.body());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return value;
	}
	public List<Level> retrievelevels() {
		Type listType = new TypeToken<List<Level>>() {}.getType();
		List<Level> levels = null;
		HttpResponse<String> response;
		try {
			response = client.send(getRequest("retrievelevels"), BodyHandlers.ofString());
			levels = new Gson().fromJson(response.body(), listType);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return levels;
	}
}
