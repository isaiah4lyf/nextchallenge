import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from ".././services/app.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  //@ViewChild("myDiv") divView: ElementRef;
  public UserData = null;
  public profileDataLoaded = false;

  public aboutLink = "";
  public timelineLink = "";
  public galleryLink = "";
  public friendsLink = "";
  public aboutBasicInfoLink = "";
  public aboutEducation = "";
  public aboutWork = "";
  public aboutInterestLink = "";
  public aboutSettingsLink = "";
  public aboutChangePasswordLink = "";
  public messageUserLink = "";
  public isProfileView = false;
  public isAddFriendButton = false;

  constructor(
    public route: ActivatedRoute,
    private _appService: AppService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.onComponentInit();
    this.route.params.subscribe(params => {
      this.paramsChanged(params['id']);
    });
  }
  paramsChanged(id) {
    this.profileDataLoaded = false;
    setTimeout(() => {
      this.onComponentInit();
    }, 5);
  }
  onComponentInit() {

    this.UserData = this._appService.getUserData();

    this.aboutLink = "/" + this.route.snapshot.paramMap.get("id") + "/about";
    this.timelineLink = "/" + this.route.snapshot.paramMap.get("id") + "/timeline";
    this.galleryLink = "/" + this.route.snapshot.paramMap.get("id") + "/gallery";
    this.friendsLink = "/" + this.route.snapshot.paramMap.get("id") + "/friends";
    this.aboutBasicInfoLink = "/" + this.route.snapshot.paramMap.get("id") + "/about/basic-info";
    this.aboutEducation = "/" + this.route.snapshot.paramMap.get("id") + "/about/education";
    this.aboutWork = "/" + this.route.snapshot.paramMap.get("id") + "/about/work";
    this.aboutInterestLink = "/" + this.route.snapshot.paramMap.get("id") + "/about/interests";
    this.aboutChangePasswordLink = "/" + this.route.snapshot.paramMap.get("id") + "/about/change-password";
    this.aboutSettingsLink = "/" + this.route.snapshot.paramMap.get("id") + "/about/settings";

    if (this.UserData["Email"].split("@")[0] == this.route.snapshot.paramMap.get("id")) {
      this.profileDataLoaded = true;
      this.isProfileView = false;
    } else {
      this._appService.retrieveUserDataWithName(this.route.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => {
        if (data == null) {
          this.router.navigate(["/home"]);
        } else {
          this.isProfileView = true;
          this.UserData = data;
          this.profileDataLoaded = true;
          this._appService.setUserViewData(this.UserData);
          this.isAddFriendButton = this.UserData["friendships"].length == 0;
          this.messageUserLink = "/chat/" + this.UserData["Email"].split("@")[0];
        }
      });
    }
  }
  addFriend() {
    this.isAddFriendButton = false;
    let viewerData = this._appService.getUserData();
    let friendship = {
      FriendshipStarterUserId: viewerData["_id"],
      FriendUserId: this.UserData["_id"]
    };
    this._appService.createfriendship(friendship).subscribe(data => { });
  }
}
