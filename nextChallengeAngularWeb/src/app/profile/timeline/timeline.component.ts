import { HostListener, Component, OnInit } from "@angular/core";
import { AppService } from "../.././services/app.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: "app-timeline",
  templateUrl: "./timeline.component.html",
  styleUrls: ["./timeline.component.css"]
})
export class TimelineComponent implements OnInit {
  public UserData: any;
  public ViewedUserData: any;
  public posts: any;
  public postsTemp: any;
  public lastPostID: string;
  public postsRequested = true;
  public UserLoaded = false;
  constructor(private _appService: AppService, private _notificationsService: NotificationsService, public route: ActivatedRoute, public router: Router) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      if (this.UserData["Email"].split("@")[0] == this.route.parent.snapshot.paramMap.get("id")) {
        this.ViewedUserData = this.UserData;
        this.UserLoaded = true;
        this._appService.retrievetimelineposts(this.UserData["_id"], this.ViewedUserData["_id"]).subscribe(data => {
          this.posts = data;
          if (this.posts.length > 0) {
            this.lastPostID = data[this.posts.length - 1]["_id"];
            this.postsRequested = false;
          }
        });
      }
      else {
        this._appService.retrieveUserDataWithName(this.route.parent.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => {
          if (data == null) {
            this.router.navigate(["/home"]);
          } else {
            this.ViewedUserData = data;
            this.UserLoaded = true;
            this._appService.retrievetimelineposts(this.UserData["_id"], this.ViewedUserData["_id"]).subscribe(data => {
              this.posts = data;
              if (this.posts.length > 0) {
                this.lastPostID = data[this.posts.length - 1]["_id"];
                this.postsRequested = false;
              }
            });
          }
        });
      }
      this._notificationsService.updateChatStatus();
    }
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() + $(window).height() + 150 > $(document).height() && this.lastPostID != null && !this.postsRequested) {
      this.postsRequested = true;
      this._appService
        .retrievetimelinepostsafter(this.lastPostID, this.UserData["_id"], this.ViewedUserData["_id"])
        .subscribe(data => {
          this.postsTemp = data;
          this.postsTemp.forEach(element => {
            this.posts.push(element);
          });
          if (this.postsTemp.length > 3) {
            this.lastPostID = data[this.postsTemp.length - 1]["_id"];
            this.postsRequested = false;
          }
        });
      this._notificationsService.updateChatStatus();
    }
  }
}
