import { Component, OnInit } from '@angular/core';
import { User } from '../../.././models/user';
import { Router } from "@angular/router";
import { DateOfBirth } from "../../.././models/date-of-birth";
import { AppService } from "../../.././services/app.service";
import { NotificationsService } from "../../.././services/notifications.service";
import { NgForm } from "@angular/forms";

@Component({
  selector: 'app-about-edit',
  templateUrl: './about-edit.component.html',
  styleUrls: ['./about-edit.component.css']
})
export class AboutEditComponent implements OnInit {
  public userModel = new User(new DateOfBirth(0, "Month", 0), "");
  public UserData: any;
  public basicInfoSpinner = false;
  public updateValid = false;
  public years: any = [];
  public daysInMonthArr: any = [];
  constructor(private _appService: AppService, private router: Router, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this.userModel = this._appService.getUserData();
    this._notificationsService.updateChatStatus();
    if (this.userModel.DateOfBirth == null) {
      this.userModel.DateOfBirth = new DateOfBirth(0, "Month", 0);
    }
    let yearCurrent = new Date().getFullYear() - 10;
    for (let i = 0; i < 75; i++) {
      this.years.push(yearCurrent - i);
    }
  }
  updateBasicInfo(form: NgForm) {
    if (this.updateValid) {
      let data = form.value;
      data["_id"] = this.UserData["_id"];
      data["Email"] = this.UserData["Email"];
      this.basicInfoSpinner = true;
      this._appService.updatebasicinfo(data).subscribe(data => {
        this._appService.setUserData(data);
        setTimeout(() => {
          this.basicInfoSpinner = false;
          let link = "/" + data["Email"].split("@")[0] + "/about/basic-info";
          this.router.navigate([link]);
        }, 500);
        this._appService.retrievelogonupdate(this.UserData["_id"]).subscribe(data => {
          this._appService.setUserData(data);
        });
      });
    }
    this._notificationsService.updateChatStatus();
  }
  onFieldChange(fieldInput, firstNameValRef, type) {
    if (fieldInput.value.length == 0) {
      firstNameValRef.innerText = "Field required";
      firstNameValRef.style.visibility = "visible";
      this.updateValid = false;
    }
    else {
      firstNameValRef.style.visibility = "hidden";
      this.updateValid = true;
    }
    if (type == "Email") this.updateValid = this.emailIsValid(fieldInput.value);
    if (!this.updateValid && type == "Email") {
      firstNameValRef.innerText = "Invalid email";
      firstNameValRef.style.visibility = "visible";
    }
    if (this.updateValid && type == "Email") {
      this.updateValid = false;
      this._appService.checkemail(fieldInput.value, this.UserData["_id"]).subscribe(data => {
        if (!data) {
          this.updateValid = true;
          firstNameValRef.style.visibility = "hidden";
        }
        else {
          firstNameValRef.innerText = "Email alreary registered";
          firstNameValRef.style.visibility = "visible";
        }
      });
    }
    this._notificationsService.updateChatStatus();
  }
  emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
