import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "../../.././services/app.service";
import { NotificationsService } from "../../.././services/notifications.service";

@Component({
  selector: "app-about-view",
  templateUrl: "./about-view.component.html",
  styleUrls: ["./about-view.component.css"]
})
export class AboutViewComponent implements OnInit {
  public About: any;
  public UserData: any;
  public AboutDataLoaded = false;
  constructor(public route: ActivatedRoute, private _appService: AppService, public router: Router, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      if (this.UserData["Email"].split("@")[0] != this.route.parent.snapshot.paramMap.get("id"))
        this._appService.retrieveUserDataWithName(this.route.parent.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => {
          if (data == null) {
            this.router.navigate(["/home"]);
          } else {
            this.UserData = data;
            this._appService.retrieveabout(this.UserData['_id']).subscribe(data => {
              this.About = data;
              this.AboutDataLoaded = true;
            });
          }
        });
      this._notificationsService.updateChatStatus();
    }
  }
}
