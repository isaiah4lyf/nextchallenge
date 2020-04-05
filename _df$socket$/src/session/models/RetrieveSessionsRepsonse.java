package session.models;


public class RetrieveSessionsRepsonse {
	private int GameSessionID;
	private int GameSessionNumberOfUsers;
	private boolean ClientInSession;
	
	public boolean isClientInSession() {
		return ClientInSession;
	}
	public void setClientInSession(boolean clientInSession) {
		ClientInSession = clientInSession;
	}
	public int getGameSessionID() {
		return GameSessionID;
	}
	public void setGameSessionID(int gameSessionID) {
		GameSessionID = gameSessionID;
	}
	public int getGameSessionNumberOfUsers() {
		return GameSessionNumberOfUsers;
	}
	public void setGameSessionNumberOfUsers(int gameSessionNumberOfUsers) {
		GameSessionNumberOfUsers = gameSessionNumberOfUsers;
	}

}
