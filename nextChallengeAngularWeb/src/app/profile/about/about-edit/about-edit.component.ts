import { Component, OnInit } from '@angular/core';
import { User } from '../../.././models/user';
import { Router } from "@angular/router";
import { DateOfBirth } from "../../.././models/date-of-birth";
import { AppService } from "../../.././services/app.service";
import { NgForm } from "@angular/forms";

@Component({
  selector: 'app-about-edit',
  templateUrl: './about-edit.component.html',
  styleUrls: ['./about-edit.component.css']
})
export class AboutEditComponent implements OnInit {
  public userModel = new User(new DateOfBirth(0, "Month", 0), "Male");
  public UserData: any;
  public basicInfoSpinner = false;

  constructor(private _appService: AppService, private router: Router) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this.userModel = this._appService.getUserData();
  }
  updateBasicInfo(form: NgForm) {
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
    });
  }
}
