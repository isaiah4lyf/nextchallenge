package session.models;

public class JoinedSessionData {
	private String FirstName;
	private String LastName;
	private String UserName;
	private String UserId;
    private String Email;
    private String ChatStatus;
	private FileUpload ProfilePic;
    private FileUpload ProfileCoverPic;
	private String RepsoneDateTime;
	public String getRepsoneDateTime() {
		return RepsoneDateTime;
	}
	public void setRepsoneDateTime(String repsoneDateTime) {
		RepsoneDateTime = repsoneDateTime;
	}
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
	public String getUserName() {
		return UserName;
	}
	public void setUserName(String userName) {
		UserName = userName;
	}
	public String getUserId() {
		return UserId;
	}
	public void setUserId(String userId) {
		UserId = userId;
	}

}
