import { HostListener, Component, OnInit } from "@angular/core";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: "app-default",
  templateUrl: "./default.component.html",
  styleUrls: ["./default.component.css"]
})
export class DefaultComponent implements OnInit {
  public UserData: any;
  public posts: any;
  public postsTemp: any;
  public lastPostID: string;
  public postsRequested = true;
  public userLoggedOn = false;
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this.userLoggedOn = true;
      this._appService.retrieveposts(this.UserData["_id"]).subscribe(data => {
        this.posts = data;
        if (this.posts.length > 0) {
          this.lastPostID = data[this.posts.length - 1]["_id"];
          this.postsRequested = false;
        }
      });
      this._notificationsService.updateChatStatus();
    }
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() + $(window).height() + 150 > $(document).height() && this.lastPostID != null && !this.postsRequested) {
      this.postsRequested = true;
      this._appService.retrievepostsafter(this.lastPostID, this.UserData["_id"]).subscribe(data => {
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
