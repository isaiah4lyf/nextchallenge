import { Component, OnInit } from '@angular/core';
import { AppService } from "../../.././services/app.service";
import { NotificationsService } from "../../.././services/notifications.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  public UserData: any;
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._notificationsService.updateChatStatus();
    }
  }

}
