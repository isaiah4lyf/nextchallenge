import { HostListener, Component, OnInit } from '@angular/core';
import { AppService } from ".././services/app.service";
import { NotificationsService } from ".././services/notifications.service";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Router } from "@angular/router";
import * as $ from 'jquery';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  public currenLed = "available";
  public UserData: any;
  public notificationsSocket: any;
  public isChangeStatusVisible = false;
  public profileLink = "";
  public searchdata = [];
  public searchdataTemp: any;
  public headerStats: any;
  public searchHistory = false;
  public searchInputClasses = { "form-control": true, "search": true, "search-border": false };
  public mobileScreen = document.body.offsetWidth + window.innerWidth - $(window).width() <= 765;
  public desktopScreen = document.body.offsetWidth + window.innerWidth - $(window).width() >= 992;
  public tabletScreen = document.body.offsetWidth + window.innerWidth - $(window).width() > 765 && document.body.offsetWidth + window.innerWidth - $(window).width() < 992;
  public menuDropdownOpen = false;
  public profileCoverPicLink: any = "";
  public profilePicLink: any = "";

  constructor(private _sanitizer: DomSanitizer, private _appService: AppService, private _notificationsService: NotificationsService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this.headerStats = { FriendRequests: 0, Notifications: 0, Messages: 0 };
    if (this.UserData != null) {
      this.profileLink = "/" + this.UserData["Email"].split('@')[0];
      this.currenLed = this.UserData["ChatStatus"];
      this._appService.retrieveservers("WebSocket").subscribe(data => {
        this._notificationsService.setServerData(data);
        this._notificationsService.startNotificationsSocket(this.UserData, this.notificationsCallBack);
      });
      this._appService.retrieveheaderstats(this.UserData["_id"]).subscribe(data => {
        this.headerStats = data;
      });

      this.router.events.subscribe(event => {
        if (this.menuDropdownOpen) {
          this.menuDropdownOpen = false;
          let elementHtml = document.getElementById("tab-dropdown-arrow-down-div") as HTMLElement;
          elementHtml.click();
        }
      });
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
      this.profileCoverPicLink = this._sanitizer.bypassSecurityTrustStyle('linear-gradient(to bottom,rgba(39, 170, 225, 0.8),rgba(28, 117, 188, 0.8)),url("' + this.UserData["ProfileCoverPic"]["FileBaseUrls"][0] + '") no-repeat');
      this.profilePicLink = this.UserData["ProfilePic"]["FileBaseUrls"][0];
    }
  }
  ngOnDestroy() {
  }
  @HostListener('window:resize', ['$event'])
  onResized(event): void {
    this.mobileScreen = document.body.offsetWidth + window.innerWidth - $(window).width() <= 765;
    this.desktopScreen = document.body.offsetWidth + window.innerWidth - $(window).width() >= 992;
    this.tabletScreen = document.body.offsetWidth + window.innerWidth - $(window).width() > 765 && document.body.offsetWidth + window.innerWidth - $(window).width() < 992;
  }
  dropDownClick(menuDropdownTab) {
    this.menuDropdownOpen = menuDropdownTab.innerHTML.includes("assets/icons/down-arrow.svg");
  }
  search(searchInput) {
    if (searchInput.value.length > 1 && searchInput.value != "" && searchInput.value != " ") {
      this._appService.search(searchInput.value).subscribe(data => {
        this.searchHistory = false;
        this.searchdataTemp = data;
        this.searchdata = [];
        this.searchdataTemp.forEach(element => {
          this.searchdata.push(element);
        });
        if (this.searchdata.length > 0) {
          this.searchInputClasses = { "form-control": true, "search": true, "search-border": true };
        } else {
          this.searchInputClasses = { "form-control": true, "search": true, "search-border": false };
        }
      });
    }
    else {
      this._appService.retrievesearchhistory(this.UserData["_id"]).subscribe(data => {
        this.searchHistory = true;
        this.searchdataTemp = data;
        this.searchdata = [];
        this.searchdataTemp.forEach(element => {
          this.searchdata.push(element);
        });
        if (this.searchdata.length > 0) {
          this.searchInputClasses = { "form-control": true, "search": true, "search-border": true };
        } else {
          this.searchInputClasses = { "form-control": true, "search": true, "search-border": false };
        }
      });
    }
  }
  inputBlur() {
    setTimeout(() => {
      this.searchInputClasses = { "form-control": true, "search": true, "search-border": false };
      this.searchdata = [];
    }, 500);
  }
  searchRowClick(search) {
    this.searchdata = [];
    if (search['SearchType'] == 'post')
      this.router.navigate(["/post/" + search['_redirect']]);
    if (search['SearchType'] == 'user')
      this.router.navigate(["/" + search['_redirect'].split('@')[0] + "/timeline"]);
    search["UserID"] = this.UserData["_id"];
    this._appService.createsearchhistory(search).subscribe(data => {
      if (data != null) {
        if (data["SearchType"] == "user") {
          this._appService.retrieveUserDataWithName(search['_redirect'].split('@')[0], this.UserData["Email"].split("@")[0]).subscribe(data => {
            if (data["friendships"].length == 0 && data["_id"] != this.UserData["_id"]) {
              setTimeout(() => {
                this.notificationsSocket = this._notificationsService.getNotificationsSocketNoSub();
                let notificationData1 = {
                  UserID: this.UserData["_id"],
                  Type: "NEW_SUGGESTION",
                  Read: false,
                  Content: JSON.stringify(data)
                };
                let _notificationData1 = {
                  NotificationType: "NEW_SUGGESTION",
                  NotificationFrom: this.UserData["_id"],
                  NotificationTo: this.UserData["_id"],
                  Data: JSON.stringify({
                    FirstName: data["FirstName"],
                    LastName: data["LastName"],
                  })
                };
                this._appService.updatenotification(notificationData1).subscribe(data => {
                  this.notificationsSocket.send(JSON.stringify(_notificationData1));
                });
                let notificationData2 = {
                  UserID: data["_id"],
                  Type: "NEW_SUGGESTION",
                  Read: false,
                  Content: JSON.stringify(this.UserData)
                };
                let _notificationData2 = {
                  NotificationType: "NEW_SUGGESTION",
                  NotificationFrom: this.UserData["_id"],
                  NotificationTo: data["_id"],
                  Data: JSON.stringify({
                    FirstName: this.UserData["FirstName"],
                    LastName: this.UserData["LastName"],
                  })
                };
                this._appService.updatenotification(notificationData2).subscribe(data => {
                  this.notificationsSocket.send(JSON.stringify(_notificationData2));
                });
              }, 25000);
            }
          });
        }
      }
    });
  }
  showToastr() {
    this.toastr.info("Some message sge...", "New Message: Matome Ramafalo");
  }
  notificationsCallBack = (data: any): any => {
    let notification = JSON.parse(data.data);
    if (notification.NotificationType == "MESSAGE" && !this.router.url.includes("/chat/")) {
      this.toastr.info(JSON.parse(notification.Data).MessageContent, "New Message: " + JSON.parse(notification.Data).FromUsers[0].FirstName + " " + JSON.parse(notification.Data).FromUsers[0].LastName);
      this._appService.retrieveheaderstats(this.UserData["_id"]).subscribe(data => {
        this.headerStats = data;
      });
    }
    else if (notification.NotificationType == "NEW_EXTERNAL_MESSAGE") {
      this.toastr.info(JSON.parse(notification.Data).MessageContent, "New Message: " + JSON.parse(notification.Data).FromUsers[0].FirstName + " " + JSON.parse(notification.Data).FromUsers[0].LastName);
      this._appService.retrieveheaderstats(this.UserData["_id"]).subscribe(data => {
        this.headerStats = data;
      });
    }
    else if (notification.NotificationType == "MESSAGES_READ") {
      this._appService.retrieveheaderstats(this.UserData["_id"]).subscribe(data => {
        this.headerStats = data;
      });
    }
    else if (notification.NotificationType == "UPDATE_CHAT_STATUS") {
      let elements = document.getElementsByClassName(notification.NotificationFrom) as any;
      for (let i = 0; i < elements.length; i++) {
        if (notification.Data == "available") {
          elements[i].style.background = "#8dc63f";
        }
        else if (notification.Data == "busy") {
          elements[i].style.background = "#e72e2eb6";
        }
        else if (notification.Data == "away") {
          elements[i].style.background = "#e0d865";
        }
        else {
          elements[i].style.background = "silver";
        }
      }
      if (notification.NotificationFrom == this.UserData["_id"]) {
        this.currenLed = notification.Data;
        this.UserData["ChatStatus"] = notification.Data;
        this._appService.setUserData(this.UserData);
        if (notification.NotificationTo == this.UserData["_id"])
          this._notificationsService.setChatStatusAutoUpdate(true);
      }
    }
    else if (notification.NotificationType == "FRIEND_REQUEST") {
      this._appService.retrieveheaderstats(this.UserData["_id"]).subscribe(data => {
        this.headerStats = data;
        let requestData = JSON.parse(notification.Data);
        this.toastr.info("Friend request from " + requestData["FirstName"] + " " + requestData["LastName"], "New friend request!");
      });
    }
    else if (notification.NotificationType == "FRIEND_REQUEST_SENT") {
      this._appService.retrieveheaderstats(this.UserData["_id"]).subscribe(data => {
        this.headerStats = data;
        let requestData = JSON.parse(notification.Data);
        this.toastr.info("Request sent to " + requestData["FirstName"] + " " + requestData["LastName"], "Friend request sent!");
      });
    }
    else if (notification.NotificationType == "NEW_SUGGESTION") {
      this._appService.retrieveheaderstats(this.UserData["_id"]).subscribe(data => {
        this.headerStats = data;
        let requestData = JSON.parse(notification.Data);
        this.toastr.info("Friend suggestion: " + requestData["FirstName"] + " " + requestData["LastName"], "New suggestion!");
      });
    }
  }
  changeStatus(color) {
    if (this.notificationsSocket == null) {
      this.notificationsSocket = this._notificationsService.getNotificationsSocketSideProf(this.notificationsCallBack);
    }
    this.currenLed = color;
    if (color == "available") {
      let notificationData = {
        NotificationType: "UPDATE_CHAT_STATUS",
        NotificationFrom: this.UserData["_id"],
        NotificationTo: "all chats",
        Data: "available"
      };
      this.notificationsSocket.send(JSON.stringify(notificationData));
    }
    else if (color == "busy") {
      let notificationData = {
        NotificationType: "UPDATE_CHAT_STATUS",
        NotificationFrom: this.UserData["_id"],
        NotificationTo: "all chats",
        Data: "busy"
      };
      this.notificationsSocket.send(JSON.stringify(notificationData));
    }
    else {
      let notificationData = {
        NotificationType: "UPDATE_CHAT_STATUS",
        NotificationFrom: this.UserData["_id"],
        NotificationTo: "all chats",
        Data: "away"
      };
      this.notificationsSocket.send(JSON.stringify(notificationData));
    }
    this.UserData["ChatStatus"] = color;
    this._appService.setUserData(this.UserData);
    this._notificationsService.setChatStatusAutoUpdate(false);
    setTimeout(() => {
      this.isChangeStatusVisible = false;
    }, 50);
  }
  toggleChangeStatus() {
    if (this.isChangeStatusVisible)
      setTimeout(() => {
        this.isChangeStatusVisible = false;
      }, 50);

    if (!this.isChangeStatusVisible)
      setTimeout(() => {
        this.isChangeStatusVisible = true;
      }, 50);
  }
}
