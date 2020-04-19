package notifications;


import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import notifications.models.*;
import java.time.LocalDateTime;
import services.NotificationsService;

@ServerEndpoint("/notifications")
public class NotificationsEndpoint {
	static List<Client> clients = Collections.synchronizedList(new ArrayList<Client>());
	static NotificationsService notificationService = new NotificationsService();
	static boolean MonitorChatThreadStarted = false;
	@OnOpen
	public void handleOpen(Session clientSession)
	{
		System.out.println("Connected");
		if(!MonitorChatThreadStarted) {
			new Thread(new Runnable() {
				@Override
				public void run() {
					// TODO Auto-generated method stub
					MonitorChatThreadStarted = true;
					while(true) {
						for(Client client: clients) {
							if((LocalDateTime.now().getHour() * 60 + LocalDateTime.now().getMinute()) - (client.getLastDateTime().getHour() * 60 + client.getLastDateTime().getMinute()) > 0) {
								if(client.getCurrentChatStatus().equals("available")) {
									clients.get(clients.indexOf(client)).setCurrentChatStatus("away");
									NotificationData data = new NotificationData();
									data.setNotificationType("UPDATE_CHAT_STATUS");
									data.setNotificationFrom(client.getClientID());	
									data.setNotificationTo(client.getClientID());
									data.setData("away");
									notificationService.updateChatStatus(client.getClientID(),"away");
									try {
										if(client.getClientSession().isOpen())
											client.getClientSession().getBasicRemote().sendText(new Gson().toJson(data));
										for(String user: client.getActiveChatUsers()) {
											List<Client> clientsWithId = clients.stream().filter(clientSearch -> clientSearch.getClientID().equals(user)).collect(Collectors.toList());
											if(clientsWithId.size() > 0)
											{
												data.setNotificationTo(user);
												if(clientsWithId.get(0).getClientSession().isOpen())
													clientsWithId.get(0).getClientSession().getBasicRemote().sendText(new Gson().toJson(data));
											}
										}
									} catch (IOException e) {
										// TODO Auto-generated catch block
										e.printStackTrace();
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
		}
	}	
	
	@OnMessage
	public void handleMessage(String message,Session clientSession)
	{
		NotificationData data = new Gson().fromJson(message, NotificationData.class);
		if(data.getNotificationType().equals("ADD"))
		{
			Type listType = new TypeToken<List<String>>() {}.getType();
			List<String> activechats = new Gson().fromJson(data.getData(), listType);
			Client client = new Client();
			client.setClientID(data.getNotificationFrom());
			client.setClientSession(clientSession);
			client.setActiveChatUsers(activechats);
			client.setLastDateTime(LocalDateTime.now());
			clients.add(client);	 
		}
		else if(data.getNotificationType().equals("UPDATE_CHAT_STATUS")) {
			try 
			{
				Client clientLocal = clients.stream().filter(client -> client.getClientSession() == clientSession).collect(Collectors.toList()).get(0);
				clients.get(clients.indexOf(clientLocal)).setCurrentChatStatus(data.getData());
				clients.get(clients.indexOf(clientLocal)).setLastDateTime(LocalDateTime.now());
				notificationService.updateChatStatus(clientLocal.getClientID(), data.getData());
				if(clientLocal.getClientSession().isOpen())
					clientLocal.getClientSession().getBasicRemote().sendText(message); 
				for(String user: clientLocal.getActiveChatUsers()) {
					List<Client> clientsWithId = clients.stream().filter(client -> client.getClientID().equals(user)).collect(Collectors.toList());
					if(clientsWithId.size() > 0)
					{
						data.setNotificationTo(user);
						if(clientsWithId.get(0).getClientSession().isOpen())
							clientsWithId.get(0).getClientSession().getBasicRemote().sendText(new Gson().toJson(data));
					}
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		else
		{ 
			try 
			{
				List<Client> clientsWithId = clients.stream().filter(client -> client.getClientID().equals(data.getNotificationTo())).collect(Collectors.toList());
				if(clientsWithId.size() > 0)
				{
					if(clientsWithId.get(0).getClientSession().isOpen())
						clientsWithId.get(0).getClientSession().getBasicRemote().sendText(message);
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		} 
	} 
	@OnClose
	public void handleClose(Session clientSession)
	{
		try 
		{
			Client clientLocal = clients.stream().filter(client -> client.getClientSession() == clientSession).collect(Collectors.toList()).get(0);
			notificationService.updateChatStatus(clientLocal.getClientID(), "offline");
			NotificationData data = new NotificationData();
			data.setNotificationType("UPDATE_CHAT_STATUS");
			data.setNotificationFrom(clientLocal.getClientID());			
			data.setData("offline");
			for(String user: clientLocal.getActiveChatUsers()) {
				List<Client> clientsWithId = clients.stream().filter(client -> client.getClientID().equals(user)).collect(Collectors.toList());
				if(clientsWithId.size() > 0)
				{
					data.setNotificationTo(user);
					if(clientsWithId.get(0).getClientSession().isOpen())
						clientsWithId.get(0).getClientSession().getBasicRemote().sendText(new Gson().toJson(data));
				}
			}

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		clients.remove(clients.stream().filter(client -> client.getClientSession() == clientSession).collect(Collectors.toList()).get(0));
	}
	@OnError
	public void handleError(Throwable e,Session clientSession)
	{
	}	
}
