import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from ".././services/app.service";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

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
  public updateButtons = false;
  public profilePicLink: any;
  public profileCoverPicLink: any;

  constructor(
    public route: ActivatedRoute,
    private _appService: AppService,
    public router: Router,
    private _sanitizer: DomSanitizer
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
    this.profileCoverPicLink = this._sanitizer.bypassSecurityTrustStyle('url("http://placehold.it/1030x360") no-repeat');
    this.profilePicLink = "http://placehold.it/300x300";

    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
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
        if (this.UserData["ProfilePic"] != null)
          this.profilePicLink = this.UserData["ProfilePic"]["FileBaseUrls"][0];
        if (this.UserData["ProfileCoverPic"] != null)
          this.profileCoverPicLink = this._sanitizer.bypassSecurityTrustStyle('url(' + this.UserData["ProfileCoverPic"]["FileBaseUrls"][0] + ') no-repeat');
        this.updateButtons = true;
        this.isAddFriendButton = false;
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
            if (this.UserData["ProfilePic"] != null)
              this.profilePicLink = this.UserData["ProfilePic"]["FileBaseUrls"][0];
            if (this.UserData["ProfileCoverPic"] != null)
              this.profileCoverPicLink = this._sanitizer.bypassSecurityTrustStyle('url(' + this.UserData["ProfileCoverPic"]["FileBaseUrls"][0] + ') no-repeat');
            this.updateButtons = false;
          }
        });
      }

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
  logout() {
    this._appService.logout();
  }
  inputFileChalge(fileInput, propicPrev) {
    let mimeType = fileInput.files[0]["type"];
    if (mimeType.split("/")[0] === "image") {
      propicPrev.src = window.URL.createObjectURL(fileInput.files[0]);
      //this.fileType = "image";
    }
  }
  coverFile(fileInput, coverpicPrev) {
    let mimeType = fileInput.files[0]["type"];
    if (mimeType.split("/")[0] === "image") {
      coverpicPrev.style.background = 'url(' + window.URL.createObjectURL(fileInput.files[0]) + ') no-repeat';
      coverpicPrev.style.backgroundPosition = 'center';
      coverpicPrev.style.backgroundSize = 'cover';
    }
  }
  updateProfilePic(fileInput) {
    let formData = new FormData();
    formData.append("FileType", "image");
    formData.append("File", fileInput.files[0]);
    formData.append("UserID", this.UserData["_id"]);
    this._appService.updateprofilepic(formData, this.filesUploadCallBack);
  }
  updateProfileCoverPic(fileInput) {
    let formData = new FormData();
    formData.append("FileType", "image");
    formData.append("File", fileInput.files[0]);
    formData.append("UserID", this.UserData["_id"]);
    this._appService.updateprofilecoverpic(formData, this.filesUploadCallBack);
  }
  filesUploadCallBack = (result): void => {
    this._appService.setUserData(JSON.parse(result));
  }
}
