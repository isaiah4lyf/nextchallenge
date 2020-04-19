import { Component, OnInit } from "@angular/core";
import { AppService } from ".././services/app.service";
import { NotificationsService } from ".././services/notifications.service";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: "app-navigation-menu",
  templateUrl: "./navigation-menu.component.html",
  styleUrls: ["./navigation-menu.component.css"]
})
export class NavigationMenuComponent implements OnInit {
  public currenLed = "available";
  public UserData: any;
  public notificationsSocket: any;
  public isChangeStatusVisible = false;
  public DataLoaded = false;
  public profileCoverPicLink: any = "";
  public profilePicLink: any = "";

  constructor(private _sanitizer: DomSanitizer, private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this.currenLed = this.UserData["ChatStatus"];
      setTimeout(() => {
        this.notificationsSocket = this._notificationsService.getNotificationsSocketSideProf(this.notificationsCallBack);
      }, 200);
      this.DataLoaded = true;
      if (this.UserData != null)
        if (this.UserData['ProfilePic'] == null)
          this.UserData['ProfilePic'] = {
            _id: "none",
            FileName: "",
            UserID: this.UserData['_id'],
            FileType: "image",
            UploadDateTime: new Date(),
            FileBaseUrls: ["assets/images/image_placeholder.jpg"]
          };
      if (this.UserData != null)
        if (this.UserData['ProfileCoverPic'] == null)
          this.UserData['ProfileCoverPic'] = {
            _id: "none",
            FileName: "",
            UserID: this.UserData['_id'],
            FileType: "image",
            UploadDateTime: new Date(),
            FileBaseUrls: ["assets/images/image_placeholder.jpg"]
          };
      this.profileCoverPicLink = this._sanitizer.bypassSecurityTrustStyle('linear-gradient(to bottom,rgba(39, 170, 225, 0.8),rgba(28, 117, 188, 0.8)),url("' + this.UserData["ProfileCoverPic"]["FileBaseUrls"][0] + '") no-repeat');
      this.profilePicLink = this.UserData["ProfilePic"]["FileBaseUrls"][0];
    }

  }

  changeStatus(color) {
    if (this.notificationsSocket == null) {
      this.notificationsSocket = this._notificationsService.getNotificationsSocketSideProf(this.notificationsCallBack);
    }
    this.currenLed = color;
    if (color == "available") {
      let notificationData = {
        NotificationType: "UPDATE_CHAT_STATUS",
        NotificationFrom: this.UserData["_id"],
        NotificationTo: "all chats",
        Data: "available"
      };
      this.notificationsSocket.send(JSON.stringify(notificationData));
    }
    else if (color == "busy") {
      let notificationData = {
        NotificationType: "UPDATE_CHAT_STATUS",
        NotificationFrom: this.UserData["_id"],
        NotificationTo: "all chats",
        Data: "busy"
      };
      this.notificationsSocket.send(JSON.stringify(notificationData));
    }
    else {
      let notificationData = {
        NotificationType: "UPDATE_CHAT_STATUS",
        NotificationFrom: this.UserData["_id"],
        NotificationTo: "all chats",
        Data: "away"
      };
      this.notificationsSocket.send(JSON.stringify(notificationData));
    }
    this.UserData["ChatStatus"] = color;
    this._appService.setUserData(this.UserData);
    this._notificationsService.setChatStatusAutoUpdate(false);
    setTimeout(() => {
      this.isChangeStatusVisible = false;
    }, 50);
  }
  toggleChangeStatus() {
    if (this.isChangeStatusVisible)
      setTimeout(() => {
        this.isChangeStatusVisible = false;
      }, 50);

    if (!this.isChangeStatusVisible)
      setTimeout(() => {
        this.isChangeStatusVisible = true;
      }, 50);
  }
  notificationsCallBack = (data: any): any => {
    let notification = JSON.parse(data.data);
    if (notification.NotificationType == "UPDATE_CHAT_STATUS" && notification.NotificationFrom == this.UserData["_id"]) {
      this.currenLed = notification.Data;
      this.UserData["ChatStatus"] = notification.Data;
      this._appService.setUserData(this.UserData);
      if (notification.NotificationTo == this.UserData["_id"])
        this._notificationsService.setChatStatusAutoUpdate(true);

    }
  }
}
