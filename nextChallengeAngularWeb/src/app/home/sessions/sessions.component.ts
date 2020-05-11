import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css']
})
export class SessionsComponent implements OnInit {
  public UserData: any;
  public ServerData: any;
  public ServerSessions: any;
  public ServerSessionsTemp: any;
  public sessionSocket = null;
  public levels: any = [];
  constructor(private _appService: AppService, private router: Router, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrievelevels().subscribe(data => {
        this.levels = data;
      });
      this._appService.retrievelogonupdate(this.UserData["_id"]).subscribe(data => {
        this._appService.setUserData(data);
        this.UserData = data;
      });
    }
  }
  ngOnDestroy() {
    if (this.sessionSocket != null) {
      let messageData = {
        Command: "RETRIEVE_SESSIONS_DISCONNECT",
        CommandJsonData: this.UserData["_id"]
      };
      this.sessionSocket.send(JSON.stringify(messageData));
    }
  }
  clickSession(level) {
    this.ServerSessions = [];
    if (this.sessionSocket != null) this.sessionSocket.close();
    this._appService.retrieveserver("ntp045df5").subscribe(data => {
      if (data == null) {
        this.router.navigate(["/play"]);
      } else {
        this.ServerData = data;
        this.sessionSocket = new WebSocket(
          "ws://" + this.ServerData.IPAddresses.find(p => p.Name == "WebSocket").IPAddress + ":" + this.ServerData.Ports.find(p => p.Name == "WebSocket").Port + "/_df$socket$/session/level_" + level._level
        );
        this.sessionSocket.onopen = message => {
          this.processOpen(message, this.sessionSocket, this.ServerData);
        };
        this.sessionSocket.onmessage = message => {
          this.processMessage(message, this.sessionSocket, this.ServerData);
        };;
        this.sessionSocket.onerror = this.processError;
        this.sessionSocket.onclose = this.processClose;
      }
    });
    this._notificationsService.updateChatStatus();
  }
  processOpen = (message, socket, server): any => {
    let messageData = {
      Command: "RETRIEVE_SESSIONS",
      CommandJsonData: this.UserData["_id"]
    };
    socket.send(JSON.stringify(messageData));
  };
  processMessage = (message, socket, server): any => {
    this.ServerSessions = [];
    this.ServerSessionsTemp = JSON.parse(message.data);
    this.ServerSessionsTemp.forEach(element => {
      element["Name"] = server["Name"] + element["GameSessionID"];
      this.ServerSessions.push(element);
    });
    if (this.ServerSessions.length == 0) {
      this.ServerSessions.push({ GameSessionID: 0, GameSessionNumberOfUsers: 0, ClientInSession: false, Name: server["Name"] + "0" });
    }
  };
  processError = message => {

  };
  processClose = message => {
  };
  untilNextLevelText(level) {
    if (level._level < this.levels.length)
      if (this.UserData.ChallengesAnswered < this.levels[level._level].UnlockedAt) {
        return this.UserData.ChallengesAnswered + "/" + this.levels[level._level].UnlockedAt;
      }
      else {
        return this.levels[level._level].UnlockedAt + "/" + this.levels[level._level].UnlockedAt;
      }
    return level.UnlockedAt + "/" + level.UnlockedAt;
  }
}
