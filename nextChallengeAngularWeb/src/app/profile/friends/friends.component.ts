import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  public UserData: any;
  public FriendRequests: any;
  public FriendRequestsTemp: any;
  public lastFriendshipId: string;
  public friendshipsRequested = true;
  public UnfrienButtonVisible = false;
  constructor(private _sanitizer: DomSanitizer, public route: ActivatedRoute, private _appService: AppService, public router: Router, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      if (this.UserData["Email"].split("@")[0] == this.route.parent.snapshot.paramMap.get("id")) {
        this.UnfrienButtonVisible = true;
        this._appService.retrievefriendships(this.UserData["_id"]).subscribe(data => {
          this.FriendRequests = data;
          if (this.FriendRequests.length > 11) {
            this.lastFriendshipId = data[this.FriendRequests.length - 1]["_id"];
            this.friendshipsRequested = false;
          }
        });
      } else {
        this._appService.retrieveUserDataWithName(this.route.parent.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => {
          if (data == null) {
            this.router.navigate(["/home"]);
          } else {
            this.UserData = data;
            this._appService.retrievefriendships(this.UserData["_id"]).subscribe(data => {
              this.FriendRequests = data;
              if (this.FriendRequests.length > 11) {
                this.lastFriendshipId = data[this.FriendRequests.length - 1]["_id"];
                this.friendshipsRequested = false;
              }
            });
          }
        });
      }
      this._notificationsService.updateChatStatus();
    }
  }
  unfriend(friendship) {
    for (let index = 0; index < this.FriendRequests.length; index++) {
      if (this.FriendRequests[index]["_id"] == friendship["_id"])
        this.FriendRequests.splice(index, 1);
    }
    if (this.FriendRequests.length > 0) this.lastFriendshipId = this.FriendRequests[this.FriendRequests.length - 1]["_id"];
    this._appService.deletefriendship(friendship["_id"]).subscribe(data => { });
    this._notificationsService.updateChatStatus();
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() + $(window).height() + 150 > $(document).height() && this.lastFriendshipId != null && !this.friendshipsRequested) {
      this.friendshipsRequested = true;
      this._appService.retrievefriendshipsafter(this.UserData["_id"], this.lastFriendshipId).subscribe(data => {
        this.FriendRequestsTemp = data;
        this.FriendRequestsTemp.forEach(element => {
          this.FriendRequests.push(element);
        });
        if (this.FriendRequestsTemp.length > 11) {
          this.lastFriendshipId = data[this.FriendRequestsTemp.length - 1]["_id"];
          this.friendshipsRequested = false;
        }
      });
      this._notificationsService.updateChatStatus();
    }
  }
  userChatStatusClass(user) {
    return { 'led-silver-global': user['ChatStatus'] == 'offline', 'led-green-global': user['ChatStatus'] == 'available', 'led-red-global': user['ChatStatus'] == 'busy', 'led-yellow-global': user['ChatStatus'] == 'away' };
  }
  profilePic(request) {
    let user: any = "";
    if (this.UserData['_id'] != request['FriendUserId']) {
      user = request['FriendUser'][0];
    }
    else {
      user = request['FriendshipStarter'][0];
    }
    if (user['ProfilePic'] == null)
      user['ProfilePic'] = {
        _id: "none",
        FileName: "",
        UserID: user['_id'],
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
    return user["ProfilePic"]["FileBaseUrls"][0];
  }
  profileCoverPic(request) {
    let user: any = "";
    if (this.UserData['_id'] != request['FriendUserId']) {
      user = request['FriendUser'][0];
    }
    else {
      user = request['FriendshipStarter'][0];
    }
    if (user['ProfileCoverPic'] == null)
      user['ProfileCoverPic'] = {
        _id: "none",
        FileName: "",
        UserID: user['_id'],
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
    return this._sanitizer.bypassSecurityTrustStyle('url(' + user["ProfileCoverPic"]["FileBaseUrls"][0] + ') no-repeat');
  }
}
