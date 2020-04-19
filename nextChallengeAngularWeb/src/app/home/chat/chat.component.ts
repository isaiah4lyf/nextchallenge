import { Component, OnInit } from "@angular/core";
import { AppService } from "../.././services/app.service";
import { Router, ActivatedRoute } from "@angular/router";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit {
  public UserData = null;
  public chats = null;
  public stillActive = true;
  public dataLoaded = false;
  public notificationsSocket: any;
  constructor(private _appService: AppService, private router: Router, private route: ActivatedRoute, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrieveactivechats(this.UserData["_id"]).subscribe(data => {
        this.chats = data;
        this.dataLoaded = true;
      });
      this.notificationsSocket = this._notificationsService.getNotificationsSocket(this.notificationsCallBack);
      this._notificationsService.updateChatStatus();
    }
  }
  ngOnDestroy() {
    this.stillActive = false;
  }
  notificationsCallBack = (data: any): any => {
    let notification = JSON.parse(data.data);
    if (this.router.url.endsWith("/chat") && notification.NotificationType == "MESSAGE") {
      this._appService.retrieveactivechats(this.UserData["_id"]).subscribe(data => {
        this.chats = data;
      });
    }
  }
}
