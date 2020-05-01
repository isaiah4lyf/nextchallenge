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
  public LeaderboardsTempSearch: any;
  public OnSearchLeaderboards = false;
  public searchValue = "";
  public currentSort = "weekly";
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrieveleaderboards(this.UserData["_id"], this.orderby, this.page, this.prevPages).subscribe(data => {
        console.log(data);
        this.Leaderboards = data;
        this.Leaderboards.forEach(element => {
          if (!element["AddedLast"]) {
            this.prevPages.push(element["UserID"]);
          }
        });
        this.LeaderboardsTempSearch = this.Leaderboards;
      });
      this._notificationsService.updateChatStatus();
    }
  }
  previousClick() {
    if (!this.OnSearchLeaderboards) {
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
            this.LeaderboardsTempSearch = this.Leaderboards;
          });
      }
    }
    this._notificationsService.updateChatStatus();
  }
  nextClick() {
    if (!this.OnSearchLeaderboards) {
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
            this.LeaderboardsTempSearch = this.Leaderboards;
          });
      }
    }
    this._notificationsService.updateChatStatus();
  }
  orberbyWeekly() {
    this.orderby = "weekly";
    if (this.OnSearchLeaderboards) {
      this.search();
    }
    else {
      this.page = 0;
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
        this.LeaderboardsTempSearch = this.Leaderboards;
        this.currentSort = "weekly";
      });
    }
    this._notificationsService.updateChatStatus();
  }
  orberbyWeekend() {
    this.orderby = "weekend";
    if (this.OnSearchLeaderboards) {
      this.search();
    }
    else {
      this.page = 0;
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
        this.LeaderboardsTempSearch = this.Leaderboards;
        this.currentSort = "weekend";
      });
    }
    this._notificationsService.updateChatStatus();
  }
  orberbyStreak() {
    this.orderby = "streak";
    if (this.OnSearchLeaderboards) {
      this.search();
    }
    else {
      this.page = 0;
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
        this.LeaderboardsTempSearch = this.Leaderboards;
        this.currentSort = "streak";
      });
    }
    this._notificationsService.updateChatStatus();
  }
  orberbyTotal() {
    this.orderby = "total";
    if (this.OnSearchLeaderboards) {
      this.search();
    }
    else {
      this.page = 0;
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
        this.LeaderboardsTempSearch = this.Leaderboards;
        this.currentSort = "total";
      });
    }
    this._notificationsService.updateChatStatus();
  }
  searchLeaderboards(searchInput) {
    this.searchValue = searchInput.value;
    this.search();
  }
  search() {
    if (this.searchValue.length > 2 && this.searchValue != "" && this.searchValue != " ") {
      this._appService.searchleaderboards(this.searchValue, this.orderby).subscribe(data => {
        this.OnSearchLeaderboards = true;
        this.Leaderboards = data;
      });
    }
    else {
      this.Leaderboards = this.LeaderboardsTempSearch;
      this.OnSearchLeaderboards = false;
      if (this.orderby != this.currentSort) {
        this.page = 0;
        this.pageNext = true;
        this.pagePrev = false;
        this.currentUserInList = false;
        this.prevPages = [];
        this._appService.retrieveleaderboards(this.UserData["_id"], this.currentSort, this.page, this.prevPages).subscribe(data => {
          this.Leaderboards = data;
          this.Leaderboards.forEach(element => {
            if (!element["AddedLast"]) {
              this.prevPages.push(element["UserID"]);
            }
          });
          this.LeaderboardsTempSearch = this.Leaderboards;
          this.orderby = this.currentSort;
        });
      }
    }
  }
}
