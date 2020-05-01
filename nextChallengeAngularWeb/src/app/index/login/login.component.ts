import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AppService } from "../.././services/app.service";
import { Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  loginSpinner = false;

  constructor(private _appService: AppService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void { }
  login(form: NgForm, remembermeRef, emailValRef, passwordValRef) {
    if (form.value.Email == "" || form.value.Password == "") {
      if (form.value.Email == "") {
        emailValRef.style.visibility = "visible";
      } else {
        emailValRef.style.visibility = "hidden";
      }
      if (form.value.Password == "") {
        passwordValRef.style.visibility = "visible";
      } else {
        passwordValRef.style.visibility = "hidden";
      }
    }
    else {
      this.loginSpinner = true;
      this._appService.login(form).subscribe(data => {
        if (data != null) {
          data["RememberMe"] = remembermeRef.checked;
          this._appService.setUserData(data);
          this.router.navigate(["/home"]);
          setTimeout(() => {
            console.log("_ses$on@$_!et$_$");
            this._appService.updatelocalsettings();
            this._appService.retrieveconfigurations().subscribe(data => {
              this._appService.setconfigurations(data);
            });
          }, 100);

        }
        setTimeout(() => {
          this.loginSpinner = false;
          if (data == null) this.toastr.warning("", "Incorrect email or password.");
        }, 500);
      });
    }
  }
  emailChange(form: NgForm, emailValRef) {
    if (form.value.Email == "") {
      emailValRef.style.visibility = "visible";
    } else {
      emailValRef.style.visibility = "hidden";
    }
  }
  passwordChange(form: NgForm, passwordValRef) {
    if (form.value.Password == "") {
      passwordValRef.style.visibility = "visible";
    } else {
      passwordValRef.style.visibility = "hidden";
    }
  }
  showPass(showPassRef, passwordInput) {
    if (showPassRef.innerText == "show") {
      passwordInput.type = "text";
      showPassRef.innerText = "hide";
    }
    else {
      passwordInput.type = "password";
      showPassRef.innerText = "show";
    }
  }
}
