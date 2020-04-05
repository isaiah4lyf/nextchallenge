package session.models;

public class DefaultCommandResponse {
	private String FirstName;
	private String LastName;
	private String UserName;
	private String UserId;
	private String UserProPicId;
	private String Message;
	private int StreakCount;
	private String RepsoneDateTime;
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
	public String getUserProPicId() {
		return UserProPicId;
	}
	public void setUserProPicId(String userProPicId) {
		UserProPicId = userProPicId;
	}
	public String getMessage() {
		return Message;
	}
	public void setMessage(String message) {
		Message = message;
	}

}
