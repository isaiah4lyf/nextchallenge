import { Component, OnInit } from '@angular/core';
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private UserData: any;
  public Settings: any = [];
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrievesettings(this.UserData["_id"]).subscribe(data => {
        this.Settings = data;
      });
      this._notificationsService.updateChatStatus();
    }
  }
  onSettingChange(settingRef,setting){  
    setting["Value"] = settingRef.checked;  
    this._appService.updatesetting(setting).subscribe(data => {
      this._appService.updatelocalsettings();
    });
  }
}
