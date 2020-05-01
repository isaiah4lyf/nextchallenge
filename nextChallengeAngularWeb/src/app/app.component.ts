import { Component, OnInit } from '@angular/core';
import { AppService } from "./services/app.service";
import { NotificationsService } from "./services/notifications.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title = 'nextChallengeAngularWeb';
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
  }
}
