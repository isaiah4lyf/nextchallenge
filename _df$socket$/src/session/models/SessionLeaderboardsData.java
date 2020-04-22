package session.models;

public class SessionLeaderboardsData {
	private int Position;
	private int Score;
	private int Streak;
	private String UserId;
	private String FirstName;
	private String LastName;
    private String Email;
    private String ChatStatus;
	private FileUpload ProfilePic;
    private FileUpload ProfileCoverPic;
	public String getEmail() {
		return Email;
	}
	public void setEmail(String email) {
		Email = email;
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
	public int getPosition() {
		return Position;
	}
	public void setPosition(int position) {
		Position = position;
	}
	public int getScore() {
		return Score;
	}
	public void setScore(int score) {
		Score = score;
	}
	public int getStreak() {
		return Streak;
	}
	public void setStreak(int streak) {
		Streak = streak;
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
	public String getUserId() {
		return UserId;
	}
	public void setUserId(String userId) {
		UserId = userId;
	}

}
