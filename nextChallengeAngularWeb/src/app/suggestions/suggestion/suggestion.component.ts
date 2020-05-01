import { Component, OnInit, Input } from '@angular/core';
import { AppService } from "../.././services/app.service";
import { ToastrService } from 'ngx-toastr';
import { ParentComponentApi } from '../suggestions.component';
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: 'app-suggestion',
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.css']
})
export class SuggestionComponent implements OnInit {
  @Input("suggestion") suggestion: any;
  @Input() parentApi: ParentComponentApi;

  public chatStatusClasses: any;
  public notificationsSocket: any = null;
  constructor(private _appService: AppService, private toastr: ToastrService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    if (this.suggestion != null)
      if (this.suggestion['ProfilePic'] == null)
        this.suggestion['ProfilePic'] = {
          _id: "none",
          FileName: "",
          UserID: this.suggestion['_id'],
          FileType: "image",
          UploadDateTime: new Date(),
          FileBaseUrls: ["assets/images/image_placeholder.jpg"]
        };
    if (this.suggestion != null)
      if (this.suggestion['ProfileCoverPic'] == null)
        this.suggestion['ProfileCoverPic'] = {
          _id: "none",
          FileName: "",
          UserID: this.suggestion['_id'],
          FileType: "image",
          UploadDateTime: new Date(),
          FileBaseUrls: ["assets/images/image_placeholder.jpg"]
        };
    this.chatStatusClasses = { 'led-silver-global': this.suggestion['ChatStatus'] == 'offline', 'led-green-global': this.suggestion['ChatStatus'] == 'available', 'led-red-global': this.suggestion['ChatStatus'] == 'busy', 'led-yellow-global': this.suggestion['ChatStatus'] == 'away' };
    this.chatStatusClasses[this.suggestion['_id']] = true;
  }
  addFriend() {
    let viewerData = this._appService.getUserData();
    let friendship = {
      FriendshipStarterUserId: viewerData["_id"],
      FriendUserId: this.suggestion["_id"]
    };
    this._appService.createfriendship(friendship).subscribe(data => {
      if (data == null) {
        this.toastr.warning("", "Friendship already exists!");
      }
      else {
        let notification = {
          UserID: viewerData["_id"],
          Type: "FRIEND_REQUEST_SENT",
          Read: false,
          Content: JSON.stringify(this.suggestion)
        };
        let viewerUser = this._appService.getUserData();
        this._appService.updatenotification(notification).subscribe(data => {
          let notify = {
            NotificationType: "FRIEND_REQUEST_SENT",
            NotificationFrom: viewerUser["_id"],
            NotificationTo: viewerUser["_id"],
            Data: JSON.stringify({
              FirstName: this.suggestion["FirstName"],
              LastName: this.suggestion["LastName"],
            })
          };
          this.notificationsSocket.send(JSON.stringify(notify));
        });
        this.notificationsSocket = this._notificationsService.getNotificationsSocketNoSub();
        if (this.notificationsSocket != null) {
          let notificationData = {
            NotificationType: "FRIEND_REQUEST",
            NotificationFrom: viewerUser["_id"],
            NotificationTo: this.suggestion["_id"],
            Data: JSON.stringify({
              FirstName: viewerUser["FirstName"],
              LastName: viewerUser["LastName"],
            })
          };
          this.notificationsSocket.send(JSON.stringify(notificationData));
        }
      }
    });
    this.parentApi.callParentMethod(this.suggestion);
  }
}
