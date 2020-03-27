import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "../../.././services/app.service";

@Component({
  selector: "app-about-view",
  templateUrl: "./about-view.component.html",
  styleUrls: ["./about-view.component.css"]
})
export class AboutViewComponent implements OnInit {
  constructor(
    public route: ActivatedRoute,
    private _appService: AppService,
    public router: Router
  ) {}

  ngOnInit(): void {

  }
}
