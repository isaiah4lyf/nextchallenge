import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "../.././services/app.service";

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
  constructor(public route: ActivatedRoute,
    private _appService: AppService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();

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
  }
  unfriend(friendship) {
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
    }
  }
}
