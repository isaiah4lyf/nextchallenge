import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AppService } from "../.././services/app.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  loginSpinner = false;

  constructor(private _appService: AppService, private router: Router) {}

  ngOnInit(): void {}
  login(form: NgForm) {
    this.loginSpinner = true;
    this._appService.login(form).subscribe(data => {
      if (data != null) {
        this._appService.setUserData(data);
        this.router.navigate(["/home"]);
      }
      this.loginSpinner = false;
    });
  }
}
