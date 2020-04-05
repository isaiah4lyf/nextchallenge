package session.models;

public class Leaderboard {
	private String _id;
    private String UserID;
	private int TotalScore;
    private int WeeklyScore;
    private int WeekendScore;
    private int HighestStreak;
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
		return WeekendScore;
	}
	public void setWeekendScore(int weekendScore) {
		this.WeekendScore = weekendScore;
	}
	public int getHighestStreak() {
		return HighestStreak;
	}
	public void setHighestStreak(int highestStreak) {
		HighestStreak = highestStreak;
	}

}
