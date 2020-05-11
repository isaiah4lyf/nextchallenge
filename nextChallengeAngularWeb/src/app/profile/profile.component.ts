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
  public updateRefGlobal: any;
  public notificationsSocket: any = null;
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
        this._appService.UserDataObservable.subscribe(data => {
          if (data != null)
            if (data["_id"] == this.UserData["_id"]) this.UserData = data;
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
      if (data == null) {
        this.toastr.warning("", "Friendship already exists!");
      }
      else {
        let notification = {
          UserID: viewerData["_id"],
          Type: "FRIEND_REQUEST_SENT",
          Read: false,
          Content: JSON.stringify(this.UserData)
        };
        let viewerUser = this._appService.getUserData();
        this._appService.updatenotification(notification).subscribe(data => {
          let notify = {
            NotificationType: "FRIEND_REQUEST_SENT",
            NotificationFrom: viewerUser["_id"],
            NotificationTo: viewerUser["_id"],
            Data: JSON.stringify({
              FirstName: this.UserData["FirstName"],
              LastName: this.UserData["LastName"],
            })
          };
          this.notificationsSocket.send(JSON.stringify(notify));
        });
        this.notificationsSocket = this._notificationsService.getNotificationsSocketNoSub();
        if (this.notificationsSocket != null) {
          let notificationData = {
            NotificationType: "FRIEND_REQUEST",
            NotificationFrom: viewerUser["_id"],
            NotificationTo: this.UserData["_id"],
            Data: JSON.stringify({
              FirstName: viewerUser["FirstName"],
              LastName: viewerUser["LastName"],
            })
          };
          this.notificationsSocket.send(JSON.stringify(notificationData));
        }
      }
    });
  }
  logout() {
    this._notificationsService.getNotificationsSocketSideProf(null).close();
    this._appService.logout();
  }
  inputFileChalge(fileInput, propicPrev, profilePicValRef) {
    let mimeType = fileInput.files[0]["type"];
    if (mimeType.split("/")[0] === "image") {
      propicPrev.src = window.URL.createObjectURL(fileInput.files[0]);
      profilePicValRef.style.visibility = "hidden";
    }
    else {
      profilePicValRef.style.visibility = "visible";
      profilePicValRef.innerText = "File type not supported."
      fileInput.value = "";
    }
  }
  coverFile(fileInput, coverpicPrev, profileCoverPicValRef) {
    let mimeType = fileInput.files[0]["type"];
    if (mimeType.split("/")[0] === "image") {
      coverpicPrev.style.background = 'url(' + window.URL.createObjectURL(fileInput.files[0]) + ') no-repeat';
      coverpicPrev.style.backgroundPosition = 'center';
      coverpicPrev.style.backgroundSize = 'cover';
      profileCoverPicValRef.style.visibility = "hidden";
    }
    else {
      profileCoverPicValRef.style.visibility = "visible";
      profileCoverPicValRef.innerText = "File type not supported."
      fileInput.value = "";
    }
  }
  updateProfilePic(fileInput, updateRef, profilePicValRef) {
    if (fileInput.files.length > 0) {
      updateRef.style.display = "block";
      this.updateRefGlobal = updateRef;
      let formData = new FormData();
      formData.append("FileType", "image");
      formData.append("File", fileInput.files[0]);
      formData.append("UserID", this.UserData["_id"]);
      this._appService.updateprofilepic(formData, this.filesUploadCallBack);
      fileInput.value = "";
    }
    else {
      profilePicValRef.style.visibility = "visible";
      profilePicValRef.innerText = "Please select file."
    }
  }
  updateProfileCoverPic(fileInput, updateRef, profileCoverPicValRef) {
    if (fileInput.files.length > 0) {
      updateRef.style.display = "block";
      this.updateRefGlobal = updateRef;
      let formData = new FormData();
      formData.append("FileType", "image");
      formData.append("File", fileInput.files[0]);
      formData.append("UserID", this.UserData["_id"]);
      this._appService.updateprofilecoverpic(formData, this.filesUploadCallBack);
      fileInput.value = "";
    } else {
      profileCoverPicValRef.style.visibility = "visible";
      profileCoverPicValRef.innerText = "Please select file."
    }
  }
  filesUploadCallBack = (result): void => {
    this._appService.setUserData(JSON.parse(result));
    this._appService.retrievelogonupdate(this.UserData["_id"]).subscribe(data => {
      this._appService.setUserData(data);
    });
    setTimeout(() => {
      this.updateRefGlobal.style.display = "none";
    }, 500);
  }
  convertDateTimeToWord(datetime, datetimecurrent) {
    return this._appService.convertDateTimeToWord(datetime, datetimecurrent);
  }
}
