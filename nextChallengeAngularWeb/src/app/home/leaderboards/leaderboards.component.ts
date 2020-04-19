import { Component, OnInit } from "@angular/core";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: "app-leaderboards",
  templateUrl: "./leaderboards.component.html",
  styleUrls: ["./leaderboards.component.css"]
})
export class LeaderboardsComponent implements OnInit {
  public Leaderboards: any;
  public LeaderboardsTemp: any;
  public page = 0;
  public orderby = "weekly";
  public pageNext = true;
  public pagePrev = false;
  public currentUserInList = false;
  public prevPages = [];
  public UserData = null;
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrieveleaderboards(this.UserData["_id"], this.orderby, this.page, this.prevPages).subscribe(data => {
        this.Leaderboards = data;
        this.Leaderboards.forEach(element => {
          if (!element["AddedLast"]) {
            this.prevPages.push(element["UserID"]);
          }
        });
      });
      this._notificationsService.updateChatStatus();
    }
  }
  previousClick() {
    if (this.pagePrev) {
      this.pagePrev = false;
      this.page--;
      let prevPagesItemsCount = this.prevPages.length % 10 == 0 ? this.prevPages.length - 20 :
        this.prevPages.length - (10 + this.prevPages.length % 10);
      let prevPagesTemp = [];
      for (let i = 0; i < prevPagesItemsCount; i++) {
        prevPagesTemp.push(this.prevPages[i]);
      }
      this.prevPages = prevPagesTemp;
      this._appService.retrieveleaderboards(this.UserData["_id"], this.orderby, this.page, this.prevPages)
        .subscribe(data => {
          this.Leaderboards = data;
          this.pagePrev = this.page > 0;
          this.pageNext = this.Leaderboards.length >= 10
          this.currentUserInList = this.Leaderboards[this.Leaderboards.length - 1]["UserID"] == this.UserData["_id"];
          this.Leaderboards.forEach(element => {
            if (!element["AddedLast"]) {
              this.prevPages.push(element["UserID"]);
            }
          });
        });
    }
    this._notificationsService.updateChatStatus();
  }
  nextClick() {
    if (this.pageNext) {
      this.pageNext = false;
      this.page++;
      this._appService.retrieveleaderboards(this.UserData["_id"], this.orderby, this.page, this.prevPages)
        .subscribe(data => {
          this.LeaderboardsTemp = data;
          if (this.LeaderboardsTemp.length == 1) {
            this.page--;
          } else {
            this.Leaderboards = data;
            this.Leaderboards.forEach(element => {
              if (!element["AddedLast"]) {
                this.prevPages.push(element["UserID"]);
              }
            });
            this.pagePrev = this.page > 0;
            this.pageNext = this.Leaderboards.length > 10;
            this.currentUserInList = this.Leaderboards[this.Leaderboards.length - 1]["UserID"] == this.UserData["_id"];
          }
        });
    }
    this._notificationsService.updateChatStatus();
  }
  orberbyWeekly() {
    this.page = 0;
    this.orderby = "weekly";
    this.pageNext = true;
    this.pagePrev = false;
    this.currentUserInList = false;
    this.prevPages = [];
    this._appService.retrieveleaderboards(this.UserData["_id"], this.orderby, this.page, this.prevPages).subscribe(data => {
      this.Leaderboards = data;
      this.Leaderboards.forEach(element => {
        if (!element["AddedLast"]) {
          this.prevPages.push(element["UserID"]);
        }
      });
    });
    this._notificationsService.updateChatStatus();
  }
  orberbyWeekend() {
    this.page = 0;
    this.orderby = "weekend";
    this.pageNext = true;
    this.pagePrev = false;
    this.currentUserInList = false;
    this.prevPages = [];
    this._appService.retrieveleaderboards(this.UserData["_id"], this.orderby, this.page, this.prevPages).subscribe(data => {
      this.Leaderboards = data;
      this.Leaderboards.forEach(element => {
        if (!element["AddedLast"]) {
          this.prevPages.push(element["UserID"]);
        }
      });
    });
    this._notificationsService.updateChatStatus();
  }
  orberbyStreak() {
    this.page = 0;
    this.orderby = "streak";
    this.pageNext = true;
    this.pagePrev = false;
    this.currentUserInList = false;
    this.prevPages = [];
    this._appService.retrieveleaderboards(this.UserData["_id"], this.orderby, this.page, this.prevPages).subscribe(data => {
      this.Leaderboards = data;
      this.Leaderboards.forEach(element => {
        if (!element["AddedLast"]) {
          this.prevPages.push(element["UserID"]);
        }
      });
    });
    this._notificationsService.updateChatStatus();
  }
  orberbyTotal() {
    this.page = 0;
    this.orderby = "total";
    this.pageNext = true;
    this.pagePrev = false;
    this.currentUserInList = false;
    this.prevPages = [];
    this._appService.retrieveleaderboards(this.UserData["_id"], this.orderby, this.page, this.prevPages).subscribe(data => {
      this.Leaderboards = data;
      this.Leaderboards.forEach(element => {
        if (!element["AddedLast"]) {
          this.prevPages.push(element["UserID"]);
        }
      });
    });
    this._notificationsService.updateChatStatus();
  }
}
