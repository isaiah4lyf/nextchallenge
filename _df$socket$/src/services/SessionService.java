package services;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.List;

import com.google.gson.*;

import java.io.IOException;
import java.lang.reflect.Type;
import com.google.gson.reflect.TypeToken;

import models.*;
public class SessionService {
	public HttpClient client = HttpClient.newHttpClient();
	public HttpRequest request = HttpRequest.newBuilder()
		      .uri(URI.create("http://localhost:44357/api/index/retrievedefaultsessionchallenge"))
		      .header("Content-Type", "application/json")
		      .GET()
		      .build();
	
	public User retrieveuser() {
		return new User();
	}
	public List<DefaultSessionChallenge> retrievedefaultchallenges() {
		Type listType = new TypeToken<List<DefaultSessionChallenge>>() {}.getType();
		List<DefaultSessionChallenge> challenges = null;
		HttpResponse<String> response;
		try {
			response = client.send(request, BodyHandlers.ofString());
			challenges = new Gson().fromJson(response.body(), listType);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return challenges;
	}
}
