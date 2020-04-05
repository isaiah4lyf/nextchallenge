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



	public class Clue {
		private String Type;
		private String Description;
		private List<FileUpload> Files;
		
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
