package notifications.models;

import javax.websocket.Session;
public class Client {
	private String ClientID;
	private Session clientSession;
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
}
