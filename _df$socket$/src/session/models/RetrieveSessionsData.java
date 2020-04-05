package session.models;

import javax.websocket.Session;

public class RetrieveSessionsData {
	private Session ClientSession;
	private String ClientID;
	
	public Session getClientSession() {
		return ClientSession;
	}
	public void setClientSession(Session clientSession) {
		ClientSession = clientSession;
	}
	public String getClientID() {
		return ClientID;
	}
	public void setClientID(String clientID) {
		ClientID = clientID;
	}

}
