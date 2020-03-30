import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "../.././services/app.service";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"]
})
export class AboutComponent implements OnInit {
  public isProfileView = false;
  private UserData = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _appService: AppService
  ) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData["Email"].split("@")[0] == this.route.parent.snapshot.paramMap.get("id")) {
      if (this.router.url.endsWith("/about") || this.router.url.endsWith("/basic-info"))
        this.router.navigate(["basic-info"], { relativeTo: this.route });
    }
    else {
      if (!this.router.url.endsWith("/about"))
        this.router.navigate(["/" + this.route.parent.snapshot.paramMap.get("id") + "/about"]);
      this.isProfileView = true;
    }
  }
}
