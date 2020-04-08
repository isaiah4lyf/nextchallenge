package session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.*;

import services.*;
import session.models.*;


import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import javax.websocket.*;

@ServerEndpoint("/session")
public class SessionEndpoint {
	static volatile int MaxNumOfSessionUsers = 10;
	static List<DefaultSession> GameSessions = Collections.synchronizedList(new ArrayList<DefaultSession>());
	static List<RetrieveSessionsData> RetrieveSessionsClients = Collections.synchronizedList(new ArrayList<RetrieveSessionsData>());
	static List<DefaultSessionChallenge> GlobalQuestions = Collections.synchronizedList(new ArrayList<DefaultSessionChallenge>());
	static volatile int PreviouesNumOfGameSessionsClients = 0;
	static volatile boolean FirstSessionRunning = false;
	static SessionService sessionService = new SessionService();
	
	@OnOpen
	public void handleOpen(Session clientSession)
	{
		
	}	
	
	@OnMessage
	public void handleMessage(String message,Session clientSession)
	{
		
		Gson gson = new Gson();
		MessageData messageData = gson.fromJson(message, MessageData.class);		
		String command = messageData.getCommand();		
		switch(command)
		{
			case "RETRIEVE_SESSIONS": 
				RetrieveSessionsData data = new RetrieveSessionsData();
				data.setClientID(messageData.getCommandJsonData());
				data.setClientSession(clientSession);
				RetrieveSessionsClients.add(data);
				handleRetrieveSessions(data);
				break;
			case "RETRIEVE_SESSIONS_DISCONNECT":		
				List<RetrieveSessionsData> RetrieveSessionsClientsFound = RetrieveSessionsClients.stream().filter(client -> client.getClientID().equals(messageData.getCommandJsonData())).collect(Collectors.toList());
				if(RetrieveSessionsClientsFound.size() > 0)
					RetrieveSessionsClients.remove(0);
				try {
					clientSession.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				break;
			case "JOIN_GAME_SESSION":  
				JoinSessionData joinSession = gson.fromJson(messageData.getCommandJsonData(), JoinSessionData.class);				
				handleJoinGameSessionCommand(joinSession,clientSession);				
				Iterator<RetrieveSessionsData> iterator = RetrieveSessionsClients.iterator();
				while(iterator.hasNext())
				{
					handleRetrieveSessions(iterator.next());
				}				
				break; 
			case "RETRIEVE_LEADERBOARDS":
				handleRetrieveLeaderboards(messageData.getCommandJsonData(),clientSession);
				break;
			case "LEAVE_SESSION":
				HandleLeaveSession(messageData.getCommandJsonData(),clientSession);
				break;
			default: 
				DefaultCommandData def = gson.fromJson(messageData.getCommandJsonData(), DefaultCommandData.class);				
				handDefaultCommand(def,clientSession);
				break;
		}	
	}
	@OnClose
	public void handleClose(Session clientSession)
	{
		for(int i = 0; i < GameSessions.size(); i++)
		{
			Client client = GameSessions.get(i).SearchClientWithSession(clientSession);
			if(client != null)
			{
				client.setSessionClosed(true);
			}
		}
	}

	@OnError
	public void handleError(Throwable e,Session clientSession)
	{
		for(int i = 0; i < GameSessions.size(); i++)
		{
			Client client = GameSessions.get(i).SearchClientWithSession(clientSession);
			if(client != null)
			{
				client.setSessionClosed(true);
			}
		}
		System.out.println(e.toString());
	}
	private void HandleLeaveSession(String message,Session clientSession) {
		try {
			Gson gson = new Gson();
			MessageData messageData = new MessageData();
			if(GameSessions.size() > 0) {
				//Send left the session to session clients
				Client client = new Client();
				int sessionID = 0;
				for(int i = 0; i < GameSessions.size(); i++) {
					Client searchClient = GameSessions.get(i).SearchClientWithId(message);
					if(searchClient != null) {
						sessionID = GameSessions.get(i).getGameSessionID();
						client = searchClient;
						break;
					}
				}
				JoinedSessionData leftSession = new JoinedSessionData();
				leftSession.setFirstName(client.getFirstName() );
				leftSession.setLastName(client.getLastName());
				leftSession.setUserName(client.getUserName());
				leftSession.setUserId(client.getClientID());
				leftSession.setUserProPicId(client.getUserProPicId());
				
				messageData.setCommand("LEFT_SESSION");
				String commandData = gson.toJson(leftSession);
				messageData.setCommandJsonData(commandData);
				GameSessions.get(sessionID).SendSessionClientsMessage(gson.toJson(messageData));	
				RemoveClientOutOfSession(clientSession);
				for(int i = 0; i < GameSessions.size(); i++) {
					GameSessions.get(i).RemoveSessionClientWithId(message);
				}
				System.out.println(message);
			}
			messageData.setCommand("LEAVE_SESSION");
			messageData.setCommandJsonData("ok");
			String response = gson.toJson(messageData);
			clientSession.getBasicRemote().sendText(response);

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
	private void RemoveClientOutOfSession(Session clientSession) {
		//List<RetrieveSessionsData> clients = RetrieveSessionsClients.parallelStream().filter(client -> client.getClientSession().equals(clientSession)).collect(Collectors.toList());
		//if(clients.size() > 0) RetrieveSessionsClients.remove(clients.get(0));
		int GameSessionID = -1;
		for(int i = 0; i < GameSessions.size(); i++)
		{
			Client client = GameSessions.get(i).SearchClientWithSession(clientSession);
			GameSessionID = GameSessions.get(i).RemoveSessionClient(client);
			if(GameSessionID != -1)
			{
				break;
			}
		}
		if(GameSessionID != -1)
		{
			GameSessions.get(GameSessionID).setGameSessionNumberOfUsers(GameSessions.get(GameSessionID).getSessionClientclients().size());
		}
		boolean RemoveLastSession = false;
		for(int i = 0; i < GameSessions.size()-1; i++)
		{
			if(GameSessions.get(i).getGameSessionNumberOfUsers() == MaxNumOfSessionUsers)
			{
				RemoveLastSession = false;
			}
			else
			{
				RemoveLastSession = true;
			}
		}
		if(RemoveLastSession == true && GameSessions.get(GameSessions.size()-1).getGameSessionNumberOfUsers() == 0 && PreviouesNumOfGameSessionsClients == RetrieveSessionsClients.size())
		{
			GameSessions.remove(GameSessions.get(GameSessions.size()-1));
		}
		for(int i = GameSessions.size() - 2; i > 0; i--)
		{
			if(GameSessions.get(i).getGameSessionNumberOfUsers() == 0 &&  PreviouesNumOfGameSessionsClients == RetrieveSessionsClients.size())
			{
				if(GameSessions.get(GameSessions.size()-1).getGameSessionNumberOfUsers() == 0)
				{
					GameSessions.remove(i);
				}
			}
			else
			{
				break;
			}
		}
		Iterator<RetrieveSessionsData> iterator = RetrieveSessionsClients.iterator();
		while(iterator.hasNext())
		{
			handleRetrieveSessions(iterator.next());
		}	
	}
	public void handleRetrieveLeaderboards(String message,Session clientSession) {
		try {
			int GameSessionID = Integer.parseInt(message);
			GameSessions.get(GameSessionID).OrderClientsBySessionScore();		
			SessionLeaderboards leaderboards = new SessionLeaderboards();
			for(int i = 0; i < GameSessions.get(GameSessionID).getSessionClientclients().size(); i++) {
				SessionLeaderboardsData sessionLeaderboardsData = new SessionLeaderboardsData();
				sessionLeaderboardsData.setPosition((i + 1));
				sessionLeaderboardsData.setScore(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getSessionScore());
				sessionLeaderboardsData.setStreak(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getSessionStreak());
				sessionLeaderboardsData.setFirstName(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getFirstName());
				sessionLeaderboardsData.setLastName(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getLastName());
				sessionLeaderboardsData.setUserName(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getUserName());
				sessionLeaderboardsData.setUserId(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getClientID());
				sessionLeaderboardsData.setUserProPicId(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getUserProPicId());
				leaderboards.AddLeaderboardSortedByScore(sessionLeaderboardsData);
			}
			GameSessions.get(GameSessionID).OrderClientsBySessionStreak();
			for(int i = 0; i < GameSessions.get(GameSessionID).getSessionClientclients().size(); i++) {
				SessionLeaderboardsData sessionLeaderboardsData = new SessionLeaderboardsData();
				sessionLeaderboardsData.setPosition((i + 1));
				sessionLeaderboardsData.setScore(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getSessionScore());
				sessionLeaderboardsData.setStreak(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getSessionStreak());
				sessionLeaderboardsData.setFirstName(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getFirstName());
				sessionLeaderboardsData.setLastName(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getLastName());
				sessionLeaderboardsData.setUserName(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getUserName());
				sessionLeaderboardsData.setUserId(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getClientID());
				sessionLeaderboardsData.setUserProPicId(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getUserProPicId());
				leaderboards.AddLeaderboardSortedByStreak(sessionLeaderboardsData);
			}
			Gson gson = new Gson();
			MessageData messageData = new MessageData();
			messageData.setCommand("RETRIEVE_LEADERBOARDS");
			messageData.setCommandJsonData(gson.toJson(leaderboards)); 
			clientSession.getBasicRemote().sendText(gson.toJson(messageData)); 
		} catch (IOException e) { 
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
	public void handleRetrieveSessions(RetrieveSessionsData data)
	{
		try {
			List<RetrieveSessionsRepsonse> sessions = new ArrayList<RetrieveSessionsRepsonse>();
			for(int i = 0; i < GameSessions.size(); i++)
			{
				RetrieveSessionsRepsonse session = new RetrieveSessionsRepsonse();
				session.setGameSessionID(GameSessions.get(i).getGameSessionID());
				session.setGameSessionNumberOfUsers(GameSessions.get(i).getGameSessionNumberOfUsers());
				List<Client> clients = GameSessions.get(i).getSessionClientclients().stream().filter(item -> item.getClientID().equals(data.getClientID())).collect(Collectors.toList());
				session.setClientInSession(clients.size() > 0);
				sessions.add(session);
			}
			if(data.getClientSession().isOpen()) {
				data.getClientSession().getBasicRemote().sendText(new Gson().toJson(sessions));
			}
			/*
			else {
				List<RetrieveSessionsData> RetrieveSessionsClientsFound = RetrieveSessionsClients.stream().filter(client -> client.getClientID().equals(data.getClientID())).collect(Collectors.toList());
				if(RetrieveSessionsClientsFound.size() > 0)
					RetrieveSessionsClients.remove(0);
			}
			*/
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	@SuppressWarnings("deprecation")
	private void handDefaultCommand(DefaultCommandData def,Session clientSession)
	{
		int GameSessionID = def.getSessionId();
		DefaultSessionChallenge question = GameSessions.get(GameSessionID).getCurrentQuestion();
		
		Client client = GameSessions.get(GameSessionID).SearchClientWithSession(clientSession);
		Gson gson = new Gson();
		MessageData messageData = new MessageData();
		messageData.setCommand("INCORRECT_ANSWER");

		DefaultCommandResponse response = new DefaultCommandResponse();
		response.setFirstName(client.getFirstName() );
		response.setLastName(client.getLastName());
		response.setUserName(client.getUserName());
		response.setUserId(client.getClientID());
		response.setUserProPicId(client.getUserProPicId());
		response.setRepsoneDateTime(new Date().toLocaleString());
			

		String answer = def.getMessage().replaceAll("\\s+","").replace(",","").replace(".","").replace(":","").toLowerCase();
		if(answer.equals(question.getAnswer().replaceAll("\\s+","").replace(",","").replace(".","").replace(":","").toLowerCase()))
		{
			if(!client.isCurrentChallengeAnswered()) {
				response.setStreakCount(client.getSessionStreak()+1);
				response.setMessage("CORRECT");	
				messageData.setCommand("CORRECT");
				messageData.setCommandJsonData(gson.toJson(response));			
				
				GameSessions.get(GameSessionID).SendSessionClientsMessage(gson.toJson(messageData));
				GameSessions.get(GameSessionID).SetSessionClientLeaderboardsWithId(client.getClientID(),client.getSessionScore()+question.getPoints(),client.getSessionStreak()+1);
						

				GameSessions.get(GameSessionID).SetClientCurrentQAnswered(client.getClientID(), true);
				
				boolean checkattempts = true;
				//checkattempts = WCFservice.checkUserAttempts(client.getClientID());
				if(checkattempts) {
					Leaderboard leaderboard = sessionService.retrieveleaderboard(client.getClientID());
					Calendar c = Calendar.getInstance();
					c.setTime(new Date());
					int dayOfWeek = c.get(Calendar.DAY_OF_WEEK);
					if(dayOfWeek >= 2 && dayOfWeek <= 6)
					{
						if(dayOfWeek == 6)
						{
							Date date = new Date();
							if(date.getHours() >= 20 && date.getMinutes() >= 0)
							{
								leaderboard.setWeekendScore(leaderboard.getWeekendScore() + question.getPoints());
							}
						}
					}
					else
					{
						leaderboard.setWeekendScore(leaderboard.getWeekendScore() + question.getPoints());
					}	
					leaderboard.setWeeklyScore(leaderboard.getWeeklyScore() + question.getPoints());
					leaderboard.setTotalScore(leaderboard.getTotalScore() + question.getPoints());
					if(client.getSessionStreak() > leaderboard.getHighestStreak()) {
						leaderboard.setHighestStreak(client.getSessionStreak());
					}
					else {
						leaderboard.setHighestStreak(leaderboard.getHighestStreak());
					}
					sessionService.updateleaderboard(leaderboard);
				}	
			}	
		}
		else
		{
			response.setStreakCount(0);
			response.setMessage(def.getMessage());
			messageData.setCommandJsonData(gson.toJson(response));
			
			GameSessions.get(GameSessionID).SendSessionClientsMessage(gson.toJson(messageData));
		}
	}
	private void handleJoinGameSessionCommand(JoinSessionData joinSession,Session clientSession)
	{
		boolean addClientToSession = true;
		for(int i = 0; i < GameSessions.size(); i++) {
			if(GameSessions.get(i).SearchClientWithId(joinSession.getUserId()) != null) {
				if(joinSession.getSessionId() != GameSessions.get(i).SearchClientWithId(joinSession.getUserId()).getGameSessionID()) {
					GameSessions.get(i).RemoveSessionClientWithId(joinSession.getUserId());
					addClientToSession = true;
				}else {
					GameSessions.get(i).SearchClientWithId(joinSession.getUserId()).setClientSession(clientSession);
					GameSessions.get(i).SearchClientWithId(joinSession.getUserId()).setJustJoined(true);
					addClientToSession = false;
				}
			}
		}
		if(GameSessions.size() == 0 && FirstSessionRunning == false)
		{	
			DefaultSession gameSession = new DefaultSession();
			gameSession.setGameSessionID(0);
			gameSession.setGameSessionNumberOfUsers(1);
			gameSession.setGameSessionCurrentQuestionID(1);
			gameSession.setSessionClientclients(new ArrayList<Client>());
			GameSessions.add(gameSession);
			Client client = new Client();
			client.setClientID(joinSession.getUserId());
			client.setClientSession(clientSession);
			client.setGameSessionID(0);
			client.setSessionJoinDateTime(LocalDateTime.now());
			client.setSessionClosed(false);
			client.setSessionScore(0);
			client.setSessionStreak(0);
			client.setJustJoined(true);
			client.setCurrentChallengeAnswered(false);
			User user = sessionService.retrieveuser();
			client.setFirstName(user.getFirstName());
			client.setLastName(user.getLastName());
			client.setUserName(user.getUserName());
			client.setUserProPicId(user.getUserProPicId());
			GameSessions.get(0).AddSessionClient(client);
			new Thread(new Runnable() {
				private List<DefaultSessionChallenge> AllQuestionsData = new ArrayList<DefaultSessionChallenge>();
				@Override
				public void run() {
					// TODO Auto-generated method stub
					//Sessions clean up thread
					new Thread(new Runnable() {						
						@Override
						public void run() {
							while(true) {
								for(int i = 0; i < GameSessions.size(); i++) {
									for(int j = 0; j < GameSessions.get(i).getSessionClientclients().size(); j++) {
										int hourDiff = LocalDateTime.now().getHour() - GameSessions.get(i).getSessionClientclients().get(j).getSessionJoinDateTime().getHour();
										if(hourDiff > 0 && LocalDateTime.now().getMinute() > GameSessions.get(i).getSessionClientclients().get(j).getSessionJoinDateTime().getMinute()) {
											if(GameSessions.get(i).getSessionClientclients().get(j).isSessionClosed()) {
												RemoveClientOutOfSession(GameSessions.get(i).getSessionClientclients().get(j).getClientSession());
											}
										}	
										
									}
								}
								try {
									Thread.sleep(5000);
								} catch (InterruptedException e) {
									// TODO Auto-generated catch block
									e.printStackTrace();
								}
							}	
						}
					}).start();

					AllQuestionsData = sessionService.retrievedefaultchallenges();
			
					int CountSleep = 0;
					int ExactSecond = 0;
					int SecondCounter = 1;
					int n = 0;
					int QuestionTime = 20;
					DefaultSessionChallenge CurrentQuestion = null;
					DefaultSessionChallenge previousQuestion = null;
					Gson gson = new Gson();
					while(true)
					{
						FirstSessionRunning = true;
						try {
							if(CountSleep == QuestionTime || CountSleep == 0)
							{
								if(previousQuestion != null)
								{	
									CorrectAnswerData correctAnswer = new CorrectAnswerData();
									correctAnswer.setSessionChallengeID(previousQuestion.get_id());
									correctAnswer.setCorrectAnswer(previousQuestion.getAnswer());
									correctAnswer.setPoints(previousQuestion.getPoints());
									MessageData messageData = new MessageData();
									messageData.setCommand("CORRECT_ANSWER");
									messageData.setCommandJsonData(gson.toJson(correctAnswer));
									GameSessions.get(0).SendSessionClientsMessage(gson.toJson(messageData));
									GameSessions.get(0).UpdateSessionUsersStreak();
									GameSessions.get(0).SetAllClientsCurrentQAnswered(false);
								}
								DefaultSessionChallenge CurrentQuestionLocal = AllQuestionsData.get(n);
								
								MessageData messageData = new MessageData();
								messageData.setCommand("SESSION_CHALLENGE");
								String challengeJsnData = gson.toJson(CurrentQuestionLocal);
								messageData.setCommandJsonData(challengeJsnData);
								String messageDataJson = gson.toJson(messageData);
								
								GameSessions.get(0).setCurrentQuestion(AllQuestionsData.get(n));
								QuestionTime = AllQuestionsData.get(n).getTimeInSeconds()*2; 
								SecondCounter = AllQuestionsData.get(n).getTimeInSeconds();
								GameSessions.get(0).SendSessionClientsMessage(messageDataJson);
								CurrentQuestion = AllQuestionsData.get(n);
								previousQuestion = AllQuestionsData.get(n);
								AllQuestionsData.remove(AllQuestionsData.get(n));
								if(AllQuestionsData.size() == 0)
								{
									if(GlobalQuestions.size() > 0)
									{
										AllQuestionsData.add(GlobalQuestions.get(0));
										new Thread(new Runnable() {
											@Override
											public void run() {
												// TODO Auto-generated method stub
												for(int i = 1; i < GlobalQuestions.size(); i++)
												{
													AllQuestionsData.add(GlobalQuestions.get(i));
												}
											}
											
										}).start();
									}
									else
									{
										AllQuestionsData = sessionService.retrievedefaultchallenges();
									}
	
								}
								Random rand = new Random();
								n = rand.nextInt(AllQuestionsData.size());
								CountSleep = 1;
							}
							else
							{

								DefaultSessionChallenge CurrentQuestionLocal = CurrentQuestion;
								
								MessageData messageData = new MessageData();
								messageData.setCommand("SESSION_CHALLENGE");
								String challengeJsnData = gson.toJson(CurrentQuestionLocal);
								messageData.setCommandJsonData(challengeJsnData);
								String messageDataJson = gson.toJson(messageData);

								for(int i = 0; i < GameSessions.get(0).getSessionClientclients().size(); i++) {
									if(GameSessions.get(0).getSessionClientclients().get(i).isJustJoined()) {
								
										try {
											if(GameSessions.get(0).getSessionClientclients().get(i).getClientSession().isOpen()) {
												GameSessions.get(0).getSessionClientclients().get(i).getClientSession().getBasicRemote().sendText(messageDataJson);
											}
											GameSessions.get(0).getSessionClientclients().get(i).setJustJoined(false);
										} catch (IOException e) {
											// TODO Auto-generated catch block
											e.printStackTrace();
										}
									}
								}	
								
								MessageData messageDataTime = new MessageData();
								messageDataTime.setCommand("REMAINING_TIME");
								messageDataTime.setCommandJsonData(String.valueOf(SecondCounter));
								String messageDataTimeJson = gson.toJson(messageDataTime);
								
								GameSessions.get(0).SendSessionClientsMessage(messageDataTimeJson);
								
								
							}
							
							Thread.sleep(500);
							CountSleep++;
							if(ExactSecond == 2)
							{
								ExactSecond = 0;
								SecondCounter--;
							}
							ExactSecond++;
						} catch (InterruptedException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
				}
				
			}).start();
			new Thread(new Runnable() {
				@Override
				public void run() {
					// TODO Auto-generated method stub
					while(true)
					{
						GlobalQuestions = sessionService.retrievedefaultchallenges();
						GlobalQuestions = Collections.synchronizedList(new ArrayList<DefaultSessionChallenge>());
						try {
							Thread.sleep(600000);
						} catch (InterruptedException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
				}
				
			}).start();
		}
		else
		{
			if(addClientToSession && joinSession.getSessionId() > GameSessions.size() + 1)
			{
				try {
					MessageData message = new MessageData();
					message.setCommand("SESSION_FULL");
					message.setCommandJsonData("SESSION_FULL");
					clientSession.getBasicRemote().sendText(new Gson().toJson(message));
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			else
			{
				if(addClientToSession && joinSession.getSessionId() != GameSessions.size() && GameSessions.get(joinSession.getSessionId()).getGameSessionNumberOfUsers() == MaxNumOfSessionUsers)
				{
					try {
						MessageData message = new MessageData();
						message.setCommand("SESSION_FULL");
						message.setCommandJsonData("SESSION_FULL");
						clientSession.getBasicRemote().sendText(new Gson().toJson(message));
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
				else
				{
					if(addClientToSession) {
						Client client = new Client();
						client.setClientID(joinSession.getUserId());
						client.setClientSession(clientSession);
						client.setGameSessionID(joinSession.getSessionId());
						client.setSessionJoinDateTime(LocalDateTime.now());
						client.setSessionClosed(false);
						client.setSessionScore(0);
						client.setSessionStreak(0);
						client.setJustJoined(true);
						client.setCurrentChallengeAnswered(false);
						User user = sessionService.retrieveuser();
						client.setFirstName(user.getFirstName());
						client.setLastName(user.getLastName());
						client.setUserName(user.getUserName());
						client.setUserProPicId(user.getUserProPicId());
						GameSessions.get(joinSession.getSessionId()).AddSessionClient(client);
						GameSessions.get(joinSession.getSessionId()).setGameSessionNumberOfUsers(GameSessions.get(joinSession.getSessionId()).getGameSessionNumberOfUsers()+1);

						//Send joined the session to session clients
						JoinedSessionData joinedSession = new JoinedSessionData();
						joinedSession.setFirstName(client.getFirstName() );
						joinedSession.setLastName(client.getLastName());
						joinedSession.setUserName(client.getUserName());
						joinedSession.setUserId(client.getClientID());
						joinedSession.setUserProPicId(client.getUserProPicId());
						
						Gson gson = new Gson();
						MessageData messageData = new MessageData();
						messageData.setCommand("JOINED_SESSION");
						String commandData = gson.toJson(joinedSession);
						messageData.setCommandJsonData(commandData);
						String response = gson.toJson(messageData);
						GameSessions.get(joinSession.getSessionId()).SendSessionClientsMessage(response);

					}

					boolean CreateNewSession = false;
					for(int i = 0; i < GameSessions.size(); i++)
					{
						if(GameSessions.get(i).getGameSessionNumberOfUsers() == MaxNumOfSessionUsers)
						{
							CreateNewSession = true;
						}
						else
						{
							CreateNewSession = false;
						}
					}
					if(CreateNewSession && FirstSessionRunning == true)
					{
						DefaultSession gameSession = new DefaultSession();
						gameSession.setGameSessionID(GameSessions.size());
						gameSession.setGameSessionNumberOfUsers(0);
						gameSession.setGameSessionCurrentQuestionID(1);
						gameSession.setSessionClientclients(new ArrayList<Client>());
						GameSessions.add(gameSession);
						new Thread(new Runnable() {
							private int GameSessionID = GameSessions.size()-1;
							private List<DefaultSessionChallenge> AllQuestionsData = new ArrayList<DefaultSessionChallenge>(); 
							@Override
							public void run() {
								// TODO Auto-generated method stub
								AllQuestionsData = sessionService.retrievedefaultchallenges();
	
								int CountSleep = 0;
								int n = 0;
								int ExactSecond = 0;
								int SecondCounter = 1;
								int QuestionTime = 20;
								DefaultSessionChallenge CurrentQuestion = null;
								DefaultSessionChallenge previousQuestion = null;
								Gson gson = new Gson();
								while(true)
								{
									try {
										if(GameSessionID >= GameSessions.size())
										{
											break;
										}
										if(CountSleep == QuestionTime || CountSleep == 0)
										{
											if(previousQuestion != null)
											{	
												CorrectAnswerData correctAnswer = new CorrectAnswerData();
												correctAnswer.setSessionChallengeID(previousQuestion.get_id());
												correctAnswer.setCorrectAnswer(previousQuestion.getAnswer());
												correctAnswer.setPoints(previousQuestion.getPoints());
												MessageData messageData = new MessageData();
												messageData.setCommand("CORRECT_ANSWER");
												messageData.setCommandJsonData(gson.toJson(correctAnswer));
												GameSessions.get(GameSessionID).SendSessionClientsMessage(gson.toJson(messageData));
												GameSessions.get(GameSessionID).UpdateSessionUsersStreak();
												GameSessions.get(GameSessionID).SetAllClientsCurrentQAnswered(false);
											}
											DefaultSessionChallenge CurrentQuestionLocal = CurrentQuestion;
	
											MessageData messageData = new MessageData();
											messageData.setCommand("SESSION_CHALLENGE");
											String challengeJsnData = gson.toJson(CurrentQuestionLocal);
											messageData.setCommandJsonData(challengeJsnData);
											String messageDataJson = gson.toJson(messageData);
											
											GameSessions.get(GameSessionID).setCurrentQuestion(AllQuestionsData.get(n));
											QuestionTime = AllQuestionsData.get(n).getTimeInSeconds()*2;
											SecondCounter = AllQuestionsData.get(n).getTimeInSeconds();
											GameSessions.get(GameSessionID).SendSessionClientsMessage(messageDataJson);
											

											CurrentQuestion = AllQuestionsData.get(n);
											previousQuestion = AllQuestionsData.get(n);
											AllQuestionsData.remove(AllQuestionsData.get(n));
											if(AllQuestionsData.size() == 0)
											{
												if(GlobalQuestions.size() > 0)
												{
													AllQuestionsData.add(GlobalQuestions.get(0));
													new Thread(new Runnable() {
														@Override
														public void run() {
															// TODO Auto-generated method stub
															for(int i = 1; i < GlobalQuestions.size(); i++)
															{
																AllQuestionsData.add(GlobalQuestions.get(i));
															}
														}
														
													}).start();
												}
												else
												{

													AllQuestionsData = sessionService.retrievedefaultchallenges();
	
												}				
											}
											Random rand = new Random();
											n = rand.nextInt(AllQuestionsData.size());
											CountSleep = 1;
										}
										else
										{

											DefaultSessionChallenge CurrentQuestionLocal = CurrentQuestion;
											
											MessageData messageData = new MessageData();
											messageData.setCommand("SESSION_CHALLENGE");
											String challengeJsnData = gson.toJson(CurrentQuestionLocal);
											messageData.setCommandJsonData(challengeJsnData);
											String messageDataJson = gson.toJson(messageData);
											
											for(int i = 0; i < GameSessions.get(GameSessionID).getSessionClientclients().size(); i++) {
												if(GameSessions.get(GameSessionID).getSessionClientclients().get(i).isJustJoined()) {
													try {
														if(GameSessions.get(GameSessionID).getSessionClientclients().get(i).getClientSession().isOpen()) {
															GameSessions.get(GameSessionID).getSessionClientclients().get(i).getClientSession().getBasicRemote().sendText(messageDataJson);
															GameSessions.get(GameSessionID).getSessionClientclients().get(i).setJustJoined(false);
														}
													} catch (IOException e) {
														// TODO Auto-generated catch block
														e.printStackTrace();
													}
												}
											}	
											
											MessageData messageDataTime = new MessageData();
											messageDataTime.setCommand("REMAINING_TIME");
											messageDataTime.setCommandJsonData(String.valueOf(SecondCounter));
											String messageDataTimeJson = gson.toJson(messageDataTime);
											
											GameSessions.get(GameSessionID).SendSessionClientsMessage(messageDataTimeJson);
											
											
										}
										
										Thread.sleep(500);
										CountSleep++;
										if(ExactSecond == 2)
										{
											ExactSecond = 0;
											SecondCounter--;
										}
										ExactSecond++;
									} catch (InterruptedException e) {
										// TODO Auto-generated catch block
										e.printStackTrace();
									}
								}
							}
							
						}).start();
					}
	
				}
			}
	
		}
	}
}

