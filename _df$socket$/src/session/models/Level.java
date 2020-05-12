package session.models;

public class Level {
    private String _id;
    private int _level;
    private int UnlockedAt;
    private String CreateDateTime;
	public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
	}
	public int get_level() {
		return _level;
	}
	public void set_level(int _level) {
		this._level = _level;
	}
	public int getUnlockedAt() {
		return UnlockedAt;
	}
	public void setUnlockedAt(int unlockedAt) {
		UnlockedAt = unlockedAt;
	}
	public String getCreateDateTime() {
		return CreateDateTime;
	}
	public void setCreateDateTime(String createDateTime) {
		CreateDateTime = createDateTime;
	}
}
