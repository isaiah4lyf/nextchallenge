import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AppService } from ".././services/app.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  private UserData = null;

  public aboutLink = "";
  public timelineLink = "";
  public galleryLink = "";
  public friendsLink = "";
  constructor(private route: ActivatedRoute,private _appService: AppService) {}

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this.aboutLink =
      "/profile/" + this.route.snapshot.paramMap.get("id") + "/about";
    this.timelineLink =
      "/profile/" + this.route.snapshot.paramMap.get("id") + "/timeline";
    this.galleryLink =
      "/profile/" + this.route.snapshot.paramMap.get("id") + "/gallery";
    this.friendsLink =
      "/profile/" + this.route.snapshot.paramMap.get("id") + "/friends";
  }
}
