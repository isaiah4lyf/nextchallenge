import { HostListener, Component, OnInit } from '@angular/core';
import { AppService } from "../.././services/app.service";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  public notifcations = [];
  public notifcationsTemp: any;
  public UserData: any;
  public noitificationsRequested = true;
  public lastNotificationId = null;
  constructor(private _appService: AppService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrievenotifications(this.UserData["_id"]).subscribe(data => {
        this.notifcationsTemp = data;
        this.notifcationsTemp.forEach(element => {
          element["DateTimeConverted"] = this._appService.convertDateTimeToWord(element["CreateDateTime"], element["DateTimeNow"]);
          this.notifcations.push(element);
        });
        this.noitificationsRequested = false;
        if (this.notifcationsTemp.length > 11) {
          this.lastNotificationId = data[this.notifcationsTemp.length - 1]["_id"];
        }
      });
    }
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() + $(window).height() + 150 > $(document).height() && this.lastNotificationId != null && !this.noitificationsRequested) {
      this.noitificationsRequested = true;
      this._appService.retrievenotificationsafter(this.UserData["_id"], this.lastNotificationId).subscribe(data => {
        this.notifcationsTemp = data;
        this.notifcationsTemp.forEach(element => {
          element["DateTimeConverted"] = this._appService.convertDateTimeToWord(element["CreateDateTime"], element["DateTimeNow"]);
          this.notifcations.push(element);
        });
        if (this.notifcationsTemp.length > 11) {
          this.lastNotificationId = data[this.notifcationsTemp.length - 1]["_id"];
          this.noitificationsRequested = false;
        }
      });
    }
  }
}
