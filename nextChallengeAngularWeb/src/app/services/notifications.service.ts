import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSocket = null;
  private ServerData: any;
  private Servers: any;
  private Subscribers = [];
  private UserData: any;
  constructor() { }

  setServerData(servers) {
    this.Servers = servers;
    this.ServerData = this.Servers[Math.floor(Math.random() * this.Servers.length)];
  }
  getNotificationsSocket(callBack) {
    this.Subscribers.push(callBack);
    return this.notificationsSocket;
  }
  startNotificationsSocket(UserData) {
    if (this.notificationsSocket == null) {
      this.notificationsSocket = new WebSocket("ws://" + this.ServerData.IPAddresses.find(p => p.Name == "WebSocket").IPAddress + ":" + this.ServerData.Ports.find(p => p.Name == "WebSocket").Port + "/_df$socket$/notifications");
      this.notificationsSocket.onopen = this.processOpen;
      this.notificationsSocket.onmessage = this.processMessage;
      this.notificationsSocket.onerror = this.processError;
      this.notificationsSocket.onclose = this.processClose;
    }
    this.UserData = UserData;
    return this.notificationsSocket;
  }
  processOpen = message => {
    let notificationData = {
      NotificationType: "ADD",
      NotificationFrom: this.UserData["_id"],
      NotificationTo: "none"
    };
    this.notificationsSocket.send(JSON.stringify(notificationData));
  };
  processMessage = message => {
    for (let i = 0; i < this.Subscribers.length; i++) {
      let outcome = this.Subscribers[i](message);
      if (!outcome) {
        this.Subscribers.splice(i, 1);
      }
      console.log(outcome);
    }

  };
  processError = message => {

  };
  processClose = message => {

  };
}
