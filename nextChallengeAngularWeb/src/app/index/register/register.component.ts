import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AppService } from "../.././services/app.service";
import { User } from '../.././models/user';
import { Router } from "@angular/router";
import { DateOfBirth } from "../.././models/date-of-birth";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  userModel = new User(new DateOfBirth(0,"Month",0),"Male");
  registrationSpinner = false;
  constructor(private _appService: AppService,private router: Router) {}

  ngOnInit(): void {}

  register(form: NgForm) {
    this.registrationSpinner = true;
    this._appService.register(form).subscribe(data => {
        this.registrationSpinner = false;
        if(data != null){
          this._appService.setUserData(data);
          this.router.navigate(['/home']);
        }
    });
  }
}
