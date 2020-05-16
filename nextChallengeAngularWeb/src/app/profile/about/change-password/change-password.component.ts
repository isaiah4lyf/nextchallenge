import { Component, OnInit } from '@angular/core';
import { AppService } from "../../.././services/app.service";
import { NotificationsService } from "../../.././services/notifications.service";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  public UserData: any;
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._notificationsService.updateChatStatus();
    }
  }
  changePassword(passwordVal, passwordNew, passwordConfirm, passwordValRef, passwordNewValRef, passwordConfirmValRef) {

  }
  passwordChange(passwordVal, passwordValRef) {
    if (passwordVal.value == "") {
      passwordValRef.style.visibility = "visible";
    } else {
      passwordValRef.style.visibility = "hidden";
    }
  }
  passwordNewChange(passwordNew, passwordNewValRef) {
    if (passwordNew.value == "") {
      passwordNewValRef.style.visibility = "visible";
    } else {
      passwordNewValRef.style.visibility = "hidden";
    }
  }
  passwordConfirmChange(passwordConfirm, passwordNew, passwordConfirmValRef) {
    if (passwordConfirm.value != passwordNew.value) {
      passwordConfirmValRef.style.visibility = "visible";
      passwordConfirmValRef.innerText = "Passswords do not match";
    } else {
      passwordConfirmValRef.style.visibility = "hidden";
    }
  }
}
