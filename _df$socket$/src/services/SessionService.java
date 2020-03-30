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

import models.*;
public class SessionService {
	public HttpClient client = HttpClient.newHttpClient();
	public String apiUrl = "http://localhost:44357/api/index/";
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
	public User retrieveuser() {
		return new User();
	}
	public List<DefaultSessionChallenge> retrievedefaultchallenges() {
		Type listType = new TypeToken<List<DefaultSessionChallenge>>() {}.getType();
		List<DefaultSessionChallenge> challenges = null;
		HttpResponse<String> response;
		try {
			response = client.send(getRequest("retrievedefaultsessionchallenge"), BodyHandlers.ofString());
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
}
