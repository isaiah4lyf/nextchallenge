package session.models;

import java.util.ArrayList;
import java.util.List;


public class SessionLeaderboards {
	private List<SessionLeaderboardsData> LeaderboardSortedByScore = new ArrayList<SessionLeaderboardsData>();
	private List<SessionLeaderboardsData> LeaderboardSortedByStreak = new ArrayList<SessionLeaderboardsData>();
	public List<SessionLeaderboardsData> getLeaderboardSortedByScore() {
		return LeaderboardSortedByScore;
	}
	public List<SessionLeaderboardsData> getLeaderboardSortedByStreak() {
		return LeaderboardSortedByStreak;
	}
	public void AddLeaderboardSortedByScore(SessionLeaderboardsData sessionLeaderboardsData)
	{
		LeaderboardSortedByScore.add(sessionLeaderboardsData);
	}
	public void AddLeaderboardSortedByStreak(SessionLeaderboardsData sessionLeaderboardsData)
	{
		LeaderboardSortedByStreak.add(sessionLeaderboardsData);
	}
}
