import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AppService } from "../.././services/app.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  constructor(private _appService: AppService) {}

  ngOnInit(): void {
    //alert(this._appService._userID);
  }
  login(form: NgForm) {
    this._appService.login(form).subscribe(data => {
      alert(data[0]["FirstName"]);
    });
  }

}
