package notifications.models;

import java.time.LocalDateTime;
import java.util.List;

import javax.websocket.Session;
public class Client {
	private String ClientID;
	private Session clientSession;
	private List<String> ActiveChatUsers;
	private LocalDateTime LastDateTime;
	private String CurrentChatStatus;
	public String getCurrentChatStatus() {
		return CurrentChatStatus;
	}
	public void setCurrentChatStatus(String currentChatStatus) {
		CurrentChatStatus = currentChatStatus;
	}
	public LocalDateTime getLastDateTime() {
		return LastDateTime;
	}
	public void setLastDateTime(LocalDateTime lastDateTime) {
		LastDateTime = lastDateTime;
	}
	public String getClientID() {
		return ClientID;
	}
	public void setClientID(String clientID) {
		ClientID = clientID;
	}
	public Session getClientSession() {
		return clientSession;
	}
	public void setClientSession(Session clientSession) {
		this.clientSession = clientSession;
	}
	public List<String> getActiveChatUsers() {
		return ActiveChatUsers;
	}
	public void setActiveChatUsers(List<String> activeChatUsers) {
		ActiveChatUsers = activeChatUsers;
	}
	public void addActiveChatUser(String UserID) {
		ActiveChatUsers.add(UserID);
	}
}
