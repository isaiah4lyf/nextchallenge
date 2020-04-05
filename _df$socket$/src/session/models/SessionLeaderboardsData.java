package session.models;

public class SessionLeaderboardsData {
	private int Position;
	private int Score;
	private int Streak;
	private String FirstName;
	private String LastName;
	private String UserName;
	private String UserId;
	private String UserProPicId;
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

}
