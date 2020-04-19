import { Injectable } from '@angular/core';
import { AppService } from "./app.service";

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSocket = null;
  private ServerData: any;
  private Servers: any;
  private Subscriber: any = null;
  private HeaderSubscriber: any;
  private SideProfileSocket: any = null;
  private UserData: any = null;
  private ActiveChatUsers: any;
  private ChatStatusAutoUpdate = false;
  constructor(private _appService: AppService) { }

  setChatStatusAutoUpdate(value) {
    this.ChatStatusAutoUpdate = value;
  }
  updateChatStatus() {
    if (this.UserData != null) {
      if (this.UserData["ChatStatus"] != "busy" && this.ChatStatusAutoUpdate && this.notificationsSocket != null) {
        let notificationData = {
          NotificationType: "UPDATE_CHAT_STATUS",
          NotificationFrom: this.UserData["_id"],
          NotificationTo: "all chats",
          Data: "available"
        };
        this.notificationsSocket.send(JSON.stringify(notificationData));
      }
    }
  }
  
  setServerData(servers) {
    this.Servers = servers;
    this.ServerData = this.Servers[Math.floor(Math.random() * this.Servers.length)];
  }
  getNotificationsSocketSideProf(callBack) {
    this.SideProfileSocket = callBack;
    return this.notificationsSocket;
  }
  getNotificationsSocket(callBack) {
    this.Subscriber = callBack;
    return this.notificationsSocket;
  }
  startNotificationsSocket(UserData, Subscriber) {
    if (this.notificationsSocket == null) {
      this.notificationsSocket = new WebSocket("ws://" + this.ServerData.IPAddresses.find(p => p.Name == "WebSocket").IPAddress + ":" + this.ServerData.Ports.find(p => p.Name == "WebSocket").Port + "/_df$socket$/notifications");
      this.notificationsSocket.onopen = this.processOpen;
      this.notificationsSocket.onmessage = this.processMessage;
      this.notificationsSocket.onerror = this.processError;
      this.notificationsSocket.onclose = this.processClose;
    }
    this.UserData = UserData;
    this.HeaderSubscriber = Subscriber;
    return this.notificationsSocket;
  }
  processOpen = message => {

    this._appService.retrieveactivechats(this.UserData["_id"]).subscribe(data => {
      this.ActiveChatUsers = data;
      let chats = [];
      this.ActiveChatUsers.forEach(element => {
        chats.push(element["FromUserId"] == this.UserData["_id"] ? element["ToUserId"] : element["FromUserId"]);
      });
      let notificationData = {
        NotificationType: "ADD",
        NotificationFrom: this.UserData["_id"],
        NotificationTo: "none",
        Data: JSON.stringify(chats)
      };
      this.notificationsSocket.send(JSON.stringify(notificationData));
      setTimeout(() => {
        let notificationData = {
          NotificationType: "UPDATE_CHAT_STATUS",
          NotificationFrom: this.UserData["_id"],
          NotificationTo: "all chats",
          Data: "available"

        };
        this.notificationsSocket.send(JSON.stringify(notificationData));
        setTimeout(() => {
          this._appService.retrievelogonupdate(this.UserData["_id"]).subscribe(data => {
            this._appService.setUserData(data);
          });
        }, 800);
      }, 500);
    });

  };
  processMessage = message => {
    if (this.Subscriber != null)
      this.Subscriber(message);
    if (this.SideProfileSocket != null)
      this.SideProfileSocket(message);
    this.HeaderSubscriber(message);
  };
  processError = message => {
    this.notificationsSocket = null;
  };
  processClose = message => {
    this.notificationsSocket = null;
  };
}
