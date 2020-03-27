package models;

public class Leaderboard {
	private String _id;
    private int Position;
    private String UserID;
	private int TotalScore;
    private int WeeklyScore;
    private int weekendScore;
    private int HighestStreak;
    private String CreateDateTime;
    public Leaderboard() {}
    public String getUserID() {
		return UserID;
	}
	public void setUserID(String userID) {
		UserID = userID;
	}
    public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
	}
	public int getPosition() {
		return Position;
	}
	public void setPosition(int position) {
		Position = position;
	}
	public int getTotalScore() {
		return TotalScore;
	}
	public void setTotalScore(int totalScore) {
		TotalScore = totalScore;
	}
	public int getWeeklyScore() {
		return WeeklyScore;
	}
	public void setWeeklyScore(int weeklyScore) {
		WeeklyScore = weeklyScore;
	}
	public int getWeekendScore() {
		return weekendScore;
	}
	public void setWeekendScore(int weekendScore) {
		this.weekendScore = weekendScore;
	}
	public int getHighestStreak() {
		return HighestStreak;
	}
	public void setHighestStreak(int highestStreak) {
		HighestStreak = highestStreak;
	}
	public String getCreateDateTime() {
		return CreateDateTime;
	}
	public void setCreateDateTime(String createDateTime) {
		CreateDateTime = createDateTime;
	}


}
