import { HostListener, Component, OnInit } from "@angular/core";
import { AppService } from ".././services/app.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  private UserData = null;
  public mobileScreen = document.body.offsetWidth + window.innerWidth - $(window).width() < 992;
  public desktopScreen = document.body.offsetWidth + window.innerWidth - $(window).width() >= 992;

  constructor(private _appService: AppService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
  }
  @HostListener("window:resize", ["$event"])
  onResized(event): void {
    this.mobileScreen = document.body.offsetWidth + window.innerWidth - $(window).width() < 992;
    this.desktopScreen = document.body.offsetWidth + window.innerWidth - $(window).width() >= 992;
  }
}
