package session.models;

public class JoinSessionData {
	private String UserId;
	private int SessionId;
	
	public String getUserId() {
		return UserId;
	}
	public void setUserId(String userId) {
		UserId = userId;
	}
	public int getSessionId() {
		return SessionId;
	}
	public void setSessionId(int sessionId) {
		SessionId = sessionId;
	}
}
