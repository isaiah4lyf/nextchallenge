package session.models;

public class User {
    private String _id;
    private String FirstName;
    private String LastName;
    private String Email;
    private String ChatStatus;
	private FileUpload ProfilePic;
    private FileUpload ProfileCoverPic;
    public User() {
    }
    public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
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
}
