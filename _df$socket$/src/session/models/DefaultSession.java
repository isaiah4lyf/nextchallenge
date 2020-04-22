package session.models;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Comparator;
import javax.websocket.Session;


public class DefaultSession {
	private int GameSessionID;
	private int GameSessionCurrentQuestionID;
	private int GameSessionNumberOfUsers;
	private List<Client> SessionClientclients;
	private DefaultSessionChallenge CurrentQuestion;
	
	public DefaultSessionChallenge getCurrentQuestion() {
		return CurrentQuestion;
	}
	public void setCurrentQuestion(DefaultSessionChallenge currentQuestion) {
		CurrentQuestion = currentQuestion;
	}
	public List<Client> getSessionClientclients() {
		return SessionClientclients;
	}
	public void setSessionClientclients(List<Client> clients) {
		this.SessionClientclients = clients;
	}
	public int getGameSessionID() {
		return GameSessionID;
	}
	public void setGameSessionID(int gameSessionID) {
		GameSessionID = gameSessionID;
	}
	public int getGameSessionCurrentQuestionID() {
		return GameSessionCurrentQuestionID;
	}
	public void setGameSessionCurrentQuestionID(int gameSessionCurrentQuestionID) {
		GameSessionCurrentQuestionID = gameSessionCurrentQuestionID;
	}
	public int getGameSessionNumberOfUsers() {
		return GameSessionNumberOfUsers;
	}
	public void setGameSessionNumberOfUsers(int gameSessionNumberOfUsers) {
		GameSessionNumberOfUsers = gameSessionNumberOfUsers;
	}
	public void SendSessionClientsMessage(String Message)
	{
		for(int i = 0; i < SessionClientclients.size(); i++)
		{

			try {
				if(SessionClientclients.get(i).getClientSession().isOpen())
				{
					SessionClientclients.get(i).setSessionJoinDateTime(LocalDateTime.now());
					SessionClientclients.get(i).getClientSession().getBasicRemote().sendText(Message);
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	public void SetSessionClientLeaderboardsWithId(String UserId,int SessionScore,int SessionStreak) {
		for(int i = 0; i < SessionClientclients.size(); i++) {
			if(SessionClientclients.get(i).getClientID().equals(UserId)) {
				SessionClientclients.get(i).setSessionScore(SessionScore);
				SessionClientclients.get(i).setSessionStreak(SessionStreak);
				break;
			}
		}
	}
	public void SetClientCurrentQAnswered(String UserId,boolean answeredCorrectly) {
		for(int i = 0; i < SessionClientclients.size(); i++) {
			if(SessionClientclients.get(i).getClientID().equals(UserId)) {
				SessionClientclients.get(i).setCurrentChallengeAnswered(answeredCorrectly);
				break;
			}
		}
	}
	public void SetAllClientsCurrentQAnswered(boolean answeredCorrectly) {
		for(int i = 0; i < SessionClientclients.size(); i++) {
			SessionClientclients.get(i).setCurrentChallengeAnswered(answeredCorrectly);
		}
	}
	public void UpdateSessionUsersStreak() {
		for(int i = 0; i < SessionClientclients.size(); i++) {
			if(!SessionClientclients.get(i).isCurrentChallengeAnswered()) {
				SessionClientclients.get(i).setSessionStreak(0);
				break;
			}
		}
	}
	public Client SearchClientWithSession(Session session)
	{
		Client client = null;
		for(int i = 0; i < SessionClientclients.size(); i++)
		{
			if(SessionClientclients.get(i).getClientSession() == session)
			{
				client =  SessionClientclients.get(i);
			}
		}
		return client;
	}
	public Client SearchClientWithId(String ClientId) {
		Client client = null;
		for(int i = 0; i < GameSessionNumberOfUsers; i++)
		{
			if(SessionClientclients.get(i).getClientID().trim().equals(ClientId.trim()))
			{						
				client = SessionClientclients.get(i);
				break;
			}			
		}
		return client;
	}
	public void RemoveSessionClientWithId(String ClientId) {
		for(int i = 0; i < GameSessionNumberOfUsers; i++)
		{
			if(SessionClientclients.get(i).getClientID().trim().equals(ClientId.trim()))
			{				
				SessionClientclients.remove(i);
				GameSessionNumberOfUsers = SessionClientclients.size();
			}
			
		}
		
	}
	public int RemoveSessionClient(Client client)
	{
		boolean remove = SessionClientclients.remove(client);
		if(remove == true)
		{
			GameSessionNumberOfUsers = SessionClientclients.size();
			return getGameSessionID();
			
		}
		else
		{
			return -1;
		}

	}
	public void SetClientAttempts(String UserId,int attempts) {
		for(int i = 0; i < SessionClientclients.size(); i++) {
			if(SessionClientclients.get(i).getClientID().equals(UserId)) {
				SessionClientclients.get(i).setAttempts(attempts);
				break;
			}
		}
	}
	public void AddSessionClient(Client client)
	{
		SessionClientclients.add(client);
	}
	
	public void OrderClientsBySessionScore() {
		SessionClientclients.sort(new OrderBySessionScore());
	}
	public void OrderClientsBySessionStreak() {
		SessionClientclients.sort(new OrderBySessionStreak());
	}
	class OrderBySessionScore implements Comparator<Client>
	{
	    @Override
	    public int compare(Client client1, Client client2) {
	        return -Integer.compare(client1.getSessionScore(),client2.getSessionScore());
	    }
	}
	class OrderBySessionStreak implements Comparator<Client>
	{
	    @Override
	    public int compare(Client client1, Client client2) {
	        return -Integer.compare(client1.getSessionStreak(),client2.getSessionStreak());
	    }
	}
}
