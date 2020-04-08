import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { AppService } from "../.././services/app.service";

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
  constructor(private _appService: AppService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrieveserver(this.route.snapshot.paramMap.get("id")).subscribe(data => {
        if (data == null) {
          this.router.navigate(["/play"]);
        } else {
          this.ServerData = data;
          this.sessionSocket = new WebSocket(
            "ws://" + this.ServerData.IPAddresses.find(p => p.Name == "WebSocket").IPAddress + ":" + this.ServerData.Ports.find(p => p.Name == "WebSocket").Port + "/_df$socket$/session"
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
    }
  }
  ngOnDestroy() {
    let messageData = {
      Command: "RETRIEVE_SESSIONS_DISCONNECT",
      CommandJsonData: this.UserData["_id"]
    };
    this.sessionSocket.send(JSON.stringify(messageData));
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
}
