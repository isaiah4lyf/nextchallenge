import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.css']
})
export class FriendRequestsComponent implements OnInit {
  public UserData: any;
  public FriendRequests: any;
  public FriendRequestsTemp: any;
  public lastFriendshipId: string;
  public friendshipsRequested = true;
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrievefriendshiprequests(this.UserData["_id"]).subscribe(data => {
        this.FriendRequests = data;
        if (this.FriendRequests.length > 11) {
          this.lastFriendshipId = data[this.FriendRequests.length - 1]["_id"];
          this.friendshipsRequested = false;
        }
      });
      this._notificationsService.updateChatStatus();
    }
  }
  approveFriendship(friendship) {
    for (let index = 0; index < this.FriendRequests.length; index++) {
      if (this.FriendRequests[index]["_id"] == friendship["_id"])
        this.FriendRequests.splice(index, 1);
    }
    if (this.FriendRequests.length > 0) this.lastFriendshipId = this.FriendRequests[this.FriendRequests.length - 1]["_id"];
    this._appService.approvefriendship(friendship["_id"]).subscribe(data => { });
  }
  rejectFriendship(friendship) {
    for (let index = 0; index < this.FriendRequests.length; index++) {
      if (this.FriendRequests[index]["_id"] == friendship["_id"])
        this.FriendRequests.splice(index, 1);
    }
    if (this.FriendRequests.length > 0) this.lastFriendshipId = this.FriendRequests[this.FriendRequests.length - 1]["_id"];
    this._appService.deletefriendship(friendship["_id"]).subscribe(data => { });
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() + $(window).height() + 150 > $(document).height() && this.lastFriendshipId != null && !this.friendshipsRequested) {
      this.friendshipsRequested = true;
      this._appService.retrievefriendshiprequestsafter(this.UserData["_id"], this.lastFriendshipId).subscribe(data => {
        this.FriendRequestsTemp = data;
        this.FriendRequestsTemp.forEach(element => {
          this.FriendRequests.push(element);
        });
        if (this.FriendRequestsTemp.length > 11) {
          this.lastFriendshipId = data[this.FriendRequestsTemp.length - 1]["_id"];
          this.friendshipsRequested = false;
        }
      });
    }
  }
}
