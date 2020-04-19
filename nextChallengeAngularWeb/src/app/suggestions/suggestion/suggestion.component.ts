import { Component, OnInit, Input } from '@angular/core';
import { AppService } from "../.././services/app.service";
import { ToastrService } from 'ngx-toastr';
import { ParentComponentApi } from '../suggestions.component';

@Component({
  selector: 'app-suggestion',
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.css']
})
export class SuggestionComponent implements OnInit {
  @Input("suggestion") suggestion: any;
  @Input() parentApi: ParentComponentApi;

  public chatStatusClasses: any;
  constructor(private _appService: AppService, private toastr: ToastrService) { }

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
      let notification = {
        UserID: viewerData["_id"],
        Type: "FRIEND_REQUEST",
        Read: false,
        Content: JSON.stringify(this.suggestion)
      };
      this._appService.updatenotification(notification).subscribe(data => {
        this.toastr.info("Request sent to " + this.suggestion["FirstName"] + " " + this.suggestion["LastName"], "Friend request sent!");
      });
    });
    this.parentApi.callParentMethod(this.suggestion);
  }
}
