package notifications;


import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.google.gson.*;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import notifications.models.*;

@ServerEndpoint("/notifications")
public class NotificationsEndpoint {
	static List<Client> clients = Collections.synchronizedList(new ArrayList<Client>());
	@OnOpen
	public void handleOpen(Session clientSession)
	{
		
	}	
	
	@OnMessage
	public void handleMessage(String message,Session clientSession)
	{
		NotificationData data = new Gson().fromJson(message, NotificationData.class);
		if(data.getNotificationType().equals("ADD"))
		{
			Client client = new Client();
			client.setClientID(data.getNotificationFrom());
			client.setClientSession(clientSession);
			clients.add(client);	
		}
		else
		{ 
			try 
			{
				List<Client> clientsWithId = clients.stream().filter(client -> client.getClientID().equals(data.getNotificationTo())).collect(Collectors.toList());
				if(clientsWithId.size() > 0)
				{
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
		clients.remove(clients.stream().filter(client -> client.getClientSession() == clientSession).collect(Collectors.toList()).get(0));
	}
	@OnError
	public void handleError(Throwable e,Session clientSession)
	{
	}	
}
