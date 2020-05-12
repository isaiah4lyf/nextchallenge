package session.models;

import java.util.List;

public class DefaultSessionChallenge {
    private String _id;
	private String Answer;
    private String Category;
    private Clue Clue;
    private String CreateDateTime;
    private int Points;
    private String Question;
    private int TimeInSeconds;
	private boolean Active;
	private String ChallengeType;
	private List<_Level> _Levels;
	private List<String> MultipleAnswers;
	public DefaultSessionChallenge Clone(DefaultSessionChallenge object) 
	{
		DefaultSessionChallenge clone = new DefaultSessionChallenge();
		clone.set_id(object.get_id());
		clone.setAnswer(object.getAnswer());
		clone.setCategory(object.getCategory());
		clone.setClue(object.getClue());
		clone.setCreateDateTime(object.getCreateDateTime());
		clone.setPoints(object.getPoints());
		clone.setQuestion(object.getQuestion());
		clone.setTimeInSeconds(object.getTimeInSeconds());
		clone.setActive(object.isActive());
		clone.setChallengeType(object.getChallengeType());
		clone.set_Levels(object.get_Levels());
		clone.setMultipleAnswers(object.getMultipleAnswers());
		return clone;
	}
	public String getChallengeType() {
		return ChallengeType;
	}

	public void setChallengeType(String challengeType) {
		ChallengeType = challengeType;
	}

	public List<_Level> get_Levels() {
		return _Levels;
	}

	public void set_Levels(List<_Level> _Levels) {
		this._Levels = _Levels;
	}

	public List<String> getMultipleAnswers() {
		return MultipleAnswers;
	}

	public void setMultipleAnswers(List<String> multipleAnswers) {
		MultipleAnswers = multipleAnswers;
	}

	public boolean isActive() {
		return Active;
	}

	public void setActive(boolean active) {
		Active = active;
	}

	public String getAnswer() {
		return Answer;
	}

	public void setAnswer(String answer) {
		Answer = answer;
	}

	public String getCategory() {
		return Category;
	}

	public void setCategory(String category) {
		Category = category;
	}

	public Clue getClue() {
		return Clue;
	}

	public void setClue(Clue clue) {
		Clue = clue;
	}

	public String getCreateDateTime() {
		return CreateDateTime;
	}

	public void setCreateDateTime(String createDateTime) {
		CreateDateTime = createDateTime;
	}

	public int getPoints() {
		return Points;
	}

	public void setPoints(int points) {
		Points = points;
	}

	public String getQuestion() {
		return Question;
	}

	public void setQuestion(String question) {
		Question = question;
	}

	public String get_id() {
		return _id;
	}

	public void set_id(String _id) {
		this._id = _id;
	}

	public int getTimeInSeconds() {
		return TimeInSeconds;
	}

	public void setTimeInSeconds(int timeInSeconds) {
		TimeInSeconds = timeInSeconds;
	}

	public class _Level
	{
		private int _level;
		private boolean _checked;
		public int get_level() {
			return _level;
		}
		public void set_level(int _level) {
			this._level = _level;
		}
		public boolean is_checked() {
			return _checked;
		}
		public void set_checked(boolean _checked) {
			this._checked = _checked;
		}
	}

	public class Clue {
		private String Type;
		private String Description;
		private List<FileUpload> Files;
		private String Source;
		private String By;
		private String Licence;
        private String LicenceReference;
        
		public String getSource() {
			return Source;
		}
		public void setSource(String source) {
			Source = source;
		}
		public String getBy() {
			return By;
		}
		public void setBy(String by) {
			By = by;
		}
		public String getLicence() {
			return Licence;
		}
		public void setLicence(String licence) {
			Licence = licence;
		}
		public String getLicenceReference() {
			return LicenceReference;
		}
		public void setLicenceReference(String licenceReference) {
			LicenceReference = licenceReference;
		}		
		public List<FileUpload> getFiles() {
			return Files;
		}
		public void setFiles(List<FileUpload> files) {
			Files = files;
		}
		public String getType() {
			return Type;
		}
		public void setType(String type) {
			Type = type;
		}
		public String getDescription() {
			return Description;
		}
		public void setDescription(String description) {
			Description = description;
		}

	}
}
