package session.models;

public class DefaultCommandResponse {
	private String FirstName;
	private String LastName;
	private String UserId;
	private String Message;
	private int StreakCount;
	private String RepsoneDateTime;
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
	public String getRepsoneDateTime() {
		return RepsoneDateTime;
	}
	public void setRepsoneDateTime(String repsoneDateTime) {
		RepsoneDateTime = repsoneDateTime;
	}
	public int getStreakCount() {
		return StreakCount;
	}
	public void setStreakCount(int streakCount) {
		StreakCount = streakCount;
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
	public String getMessage() {
		return Message;
	}
	public void setMessage(String message) {
		Message = message;
	}

}
