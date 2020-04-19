import { HostListener, Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from ".././services/app.service";
import { NotificationsService } from ".././services/notifications.service";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
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
  public chatStatusClasses: any;
  public activities: any = [];
  public mobileScreen = document.body.offsetWidth + window.innerWidth - $(window).width() < 992;
  public desktopScreen = document.body.offsetWidth + window.innerWidth - $(window).width() >= 992;

  constructor(
    public route: ActivatedRoute,
    private _appService: AppService,
    public router: Router,
    private _sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private _notificationsService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.onComponentInit();
    this.route.params.subscribe(params => {
      this.paramsChanged(params['id']);
    });
  }
  @HostListener('window:resize', ['$event'])
  onResized(event): void {
    this.mobileScreen = document.body.offsetWidth + window.innerWidth - $(window).width() < 992;
    this.desktopScreen = document.body.offsetWidth + window.innerWidth - $(window).width() >= 992;
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
        this.chatStatusClasses = { 'led-silver-global': this.UserData['ChatStatus'] == 'offline', 'led-green-global': this.UserData['ChatStatus'] == 'available', 'led-red-global': this.UserData['ChatStatus'] == 'busy', 'led-yellow-global': this.UserData['ChatStatus'] == 'away' };
        this.chatStatusClasses[this.UserData['_id']] = true;
        this._appService.retrieveactivities(this.UserData["_id"]).subscribe(data => {
          this.activities = data;
        });
      } else {
        this._appService.retrieveUserDataWithName(this.route.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => {
          if (data == null) {
            this.router.navigate(["/home"]);
          } else {
            this.isProfileView = true;
            this.UserData = data;
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
            this.profileDataLoaded = true;
            this._appService.setUserViewData(this.UserData);
            this.isAddFriendButton = this.UserData["friendships"].length == 0;
            this.messageUserLink = "/chat/" + this.UserData["Email"].split("@")[0];
            this.profilePicLink = this.UserData["ProfilePic"]["FileBaseUrls"][0];
            this.profileCoverPicLink = this._sanitizer.bypassSecurityTrustStyle('url(' + this.UserData["ProfileCoverPic"]["FileBaseUrls"][0] + ') no-repeat');
            this.updateButtons = false;
            this.chatStatusClasses = { 'led-silver-global': this.UserData['ChatStatus'] == 'offline', 'led-green-global': this.UserData['ChatStatus'] == 'available', 'led-red-global': this.UserData['ChatStatus'] == 'busy', 'led-yellow-global': this.UserData['ChatStatus'] == 'away' };
            this.chatStatusClasses[this.UserData['_id']] = true;
            this._appService.retrieveactivities(this.UserData["_id"]).subscribe(data => {
              this.activities = data;
            });
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
    this._appService.createfriendship(friendship).subscribe(data => {
      let notification = {
        UserID: viewerData["_id"],
        Type: "FRIEND_REQUEST",
        Read: false,
        Content: JSON.stringify(this.UserData)
      };
      this._appService.updatenotification(notification).subscribe(data => {
        this.toastr.info("Request sent to " + this.UserData["FirstName"] + " " + this.UserData["LastName"], "Friend request sent!");
      });
    });
  }
  logout() {
    this._notificationsService.getNotificationsSocketSideProf(null).close();
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
  convertDateTimeToWord(datetime, datetimecurrent) {
    return this._appService.convertDateTimeToWord(datetime, datetimecurrent);
  }
}
