import { Component, OnInit } from '@angular/core';
import { AppService } from "../.././services/app.service";

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {
  public PlayServers = [];
  public PlayServersTemp: any;
  public UserData: any;
  constructor(private _appService: AppService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrieveservers("WebSocket").subscribe(data => {
        this.PlayServersTemp = data;
        this.PlayServersTemp.forEach(server => {
          let sessionSocket = new WebSocket(
            "ws://" + server.IPAddresses.find(p => p.Name == "WebSocket").IPAddress + ":" + server.Ports.find(p => p.Name == "WebSocket").Port + "/_df$socket$/session"
          );
          sessionSocket.onopen = message => {
            this.processOpen(message, sessionSocket, server);
          };
          sessionSocket.onmessage = message => {
            this.processMessage(message, sessionSocket, server);
          };;
          sessionSocket.onerror = this.processError;
          sessionSocket.onclose = this.processClose;
          server["UsersCount"] = 0;
          this.PlayServers.push(server);
        });
      });
    }

  }
  processOpen = (message, socket, server): any => {
    let messageData = {
      Command: "RETRIEVE_SESSIONS",
      CommandJsonData: this.UserData["_id"]
    };
    socket.send(JSON.stringify(messageData));
  };
  processMessage = (message, socket, server): any => {
    let sessions = JSON.parse(message.data);
    let serverUsersCount = 0;
    let userInServer = false;
    sessions.forEach(element => {
      serverUsersCount += element["GameSessionNumberOfUsers"];
      if (!userInServer) userInServer = element["ClientInSession"];
    });
    let serverSearched = this.PlayServers.find(s => s._id == server["_id"]);
    serverSearched["UsersCount"] = serverUsersCount;
    serverSearched["ClientInSession"] = userInServer;
    this.PlayServers[this.PlayServers.indexOf(this.PlayServers.find(s => s._id == server["_id"]))] = serverSearched;
  };
  processError = message => {

  };
  processClose = message => {

  };
}
