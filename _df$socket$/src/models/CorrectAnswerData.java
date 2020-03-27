package models;

public class CorrectAnswerData {
	private String SessionChallengeID;
	private String CorrectAnswer;
	private int Points;
	public String getSessionChallengeID() {
		return SessionChallengeID;
	}
	public void setSessionChallengeID(String sessionChallengeID) {
		SessionChallengeID = sessionChallengeID;
	}
	public String getCorrectAnswer() {
		return CorrectAnswer;
	}
	public void setCorrectAnswer(String correctAnswer) {
		CorrectAnswer = correctAnswer;
	}
	public int getPoints() {
		return Points;
	}
	public void setPoints(int points) {
		Points = points;
	}


}
