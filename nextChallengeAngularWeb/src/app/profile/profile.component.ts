import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from ".././services/app.service";

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
  public aboutEduWorkLink = "";
  public aboutInterestLink = "";
  public aboutSettingsLink = "";
  public aboutChangePasswordLink = "";

  constructor(
    public route: ActivatedRoute,
    private _appService: AppService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();

    this.aboutLink = "/" + this.route.snapshot.paramMap.get("id") + "/about";
    this.timelineLink =
      "/" + this.route.snapshot.paramMap.get("id") + "/timeline";
    this.galleryLink =
      "/" + this.route.snapshot.paramMap.get("id") + "/gallery";
    this.friendsLink =
      "/" + this.route.snapshot.paramMap.get("id") + "/friends";
    this.aboutBasicInfoLink =
      "/" + this.route.snapshot.paramMap.get("id") + "/about/basic-info";
    this.aboutEduWorkLink =
      "/" + this.route.snapshot.paramMap.get("id") + "/about/edu-work";
    this.aboutInterestLink =
      "/" + this.route.snapshot.paramMap.get("id") + "/about/interests";
    this.aboutChangePasswordLink =
      "/" + this.route.snapshot.paramMap.get("id") + "/about/change-password";
    this.aboutSettingsLink =
      "/" + this.route.snapshot.paramMap.get("id") + "/about/settings";

    if (
      this.UserData["Email"].split("@")[0] ==
      this.route.snapshot.paramMap.get("id")
    ) {
      this.profileDataLoaded = true;
      //this.profileRoute = this.router.url.endsWith("/timeline");
    }
  }
}
