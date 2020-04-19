import { Component, OnInit } from '@angular/core';
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  public UserData: any;
  public HelpData: any = [];
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrievehelpitems().subscribe(data => {
        this.HelpData = data;
        console.log(this.HelpData.General);
      });
      this._notificationsService.updateChatStatus();
    }
  }

}
