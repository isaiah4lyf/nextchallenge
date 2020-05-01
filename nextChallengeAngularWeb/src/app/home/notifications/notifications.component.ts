import { HostListener, Component, OnInit } from '@angular/core';
import { AppService } from "../.././services/app.service";
import { ToastrService } from 'ngx-toastr';
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  public notifcations = [];
  public notifcationsTemp: any;
  public UserData: any;
  public noitificationsRequested = true;
  public lastNotificationId = null;
  constructor(private _appService: AppService, private _notificationsService: NotificationsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrievenotifications(this.UserData["_id"]).subscribe(data => {
        this.notifcationsTemp = data;
        this.notifcationsTemp.forEach(element => {
          element["DateTimeConverted"] = this._appService.convertDateTimeToWord(element["CreateDateTime"], element["DateTimeNow"]);
          this.notifcations.push(element);
        });
        this.noitificationsRequested = false;
        if (this.notifcationsTemp.length > 11) {
          this.lastNotificationId = data[this.notifcationsTemp.length - 1]["_id"];
        }
      });
      this._notificationsService.updateChatStatus();
    }
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() + $(window).height() + 150 > $(document).height() && this.lastNotificationId != null && !this.noitificationsRequested) {
      this.noitificationsRequested = true;
      this._appService.retrievenotificationsafter(this.UserData["_id"], this.lastNotificationId).subscribe(data => {
        this.notifcationsTemp = data;
        this.notifcationsTemp.forEach(element => {
          element["DateTimeConverted"] = this._appService.convertDateTimeToWord(element["CreateDateTime"], element["DateTimeNow"]);
          this.notifcations.push(element);
        });
        if (this.notifcationsTemp.length > 11) {
          this.lastNotificationId = data[this.notifcationsTemp.length - 1]["_id"];
          this.noitificationsRequested = false;
        }
      });
    }
  }
  notificationContent(notification) {
    let data = JSON.parse(notification.Content);
    if (data.ProfilePic == null)
      data.ProfilePic = {
        _id: "none",
        FileName: "",
        UserID: data._id,
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
    return data;
  }
  markAllAsSeen() {
    this._appService.markallnotificationsasseen(this.UserData["_id"]).subscribe(data => { });
    for (let i = 0; i < this.notifcations.length; i++) {
      this.notifcations[i]["Read"] = true;
    }
    this.notifyHeader();
  }
  markAsSeen(notification) {
    notification["Read"] = true;
    this._appService.updatenotification(notification).subscribe(data => { });
    this.notifyHeader();
  }
  delete(notification) {
    this._appService.deletenotification(notification._id).subscribe(data => {
      this.toastr.warning("", "Notification deleted successfully!");
    })
    this.notifcations.splice(this.notifcations.indexOf(this.notifcations.find(s => s._id == notification._id)), 1);
    this.notifyHeader();
  }
  notifyHeader() {
    let notificationData = {
      NotificationType: "MESSAGES_READ",
      NotificationFrom: this.UserData["_id"],
      NotificationTo: this.UserData["_id"],
      Data: "none"
    };
    let notificationsSocket = this._notificationsService.getNotificationsSocketNoSub();
    notificationsSocket.send(JSON.stringify(notificationData));
  }
}
