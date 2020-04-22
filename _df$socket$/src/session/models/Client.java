package session.models;

import java.time.LocalDateTime;

import javax.websocket.Session;

public class Client {
	private String ClientID;
	private Session ClientSession;
	private int GameSessionID;
	private LocalDateTime SessionJoinDateTime;
	private boolean SessionClosed;
	private int SessionScore;
	private int SessionStreak;
	private String FirstName;
	private String LastName;
    private String Email;
    private String ChatStatus;
	private FileUpload ProfilePic;
    private FileUpload ProfileCoverPic;
	private boolean JustJoined;
	private boolean CurrentChallengeAnswered;
	private int Attempts;
	public int getAttempts() {
		return Attempts;
	}
	public void setAttempts(int attempts) {
		Attempts = attempts;
	}
	public String getChatStatus() {
		return ChatStatus;
	}
	public void setChatStatus(String chatStatus) {
		ChatStatus = chatStatus;
	}
	public FileUpload getProfilePic() {
		return ProfilePic;
	}
	public void setProfilePic(FileUpload profilePic) {
		ProfilePic = profilePic;
	}
	public FileUpload getProfileCoverPic() {
		return ProfileCoverPic;
	}
	public void setProfileCoverPic(FileUpload profileCoverPic) {
		ProfileCoverPic = profileCoverPic;
	}
	public boolean isCurrentChallengeAnswered() {
		return CurrentChallengeAnswered;
	}
	public void setCurrentChallengeAnswered(boolean currentChallengeAnswered) {
		CurrentChallengeAnswered = currentChallengeAnswered;
	}
	public boolean isJustJoined() {
		return JustJoined;
	}
	public void setJustJoined(boolean justJoined) {
		JustJoined = justJoined;
	}
	public String getFirstName() {
		return FirstName;
	}
	public void setFirstName(String firstName) {
		FirstName = firstName;
	}
	public String getLastName() {
		return LastName;
	}
	public void setLastName(String lastName) {
		LastName = lastName;
	}

	public String getEmail() {
		return Email;
	}
	public void setEmail(String email) {
		Email = email;
	}
	public int getSessionScore() {
		return SessionScore;
	}
	public void setSessionScore(int sessionScore) {
		SessionScore = sessionScore;
	}
	public int getSessionStreak() {
		return SessionStreak;
	}
	public void setSessionStreak(int sessionStreak) {
		SessionStreak = sessionStreak;
	}
	public boolean isSessionClosed() {
		return SessionClosed;
	}
	public void setSessionClosed(boolean sessionClosed) {
		SessionClosed = sessionClosed;
	}
	public LocalDateTime getSessionJoinDateTime() {
		return SessionJoinDateTime;
	}
	public void setSessionJoinDateTime(LocalDateTime sessionJoinDateTime) {
		SessionJoinDateTime = sessionJoinDateTime;
	}
	public String getClientID() {
		return ClientID;
	}
	public void setClientID(String clientID) {
		ClientID = clientID;
	}
	public Session getClientSession() {
		return ClientSession;
	}
	public void setClientSession(Session clientSession) {
		ClientSession = clientSession;
	}
	public int getGameSessionID() {
		return GameSessionID;
	}
	public void setGameSessionID(int gameSessionID) {
		GameSessionID = gameSessionID;
	}

}
