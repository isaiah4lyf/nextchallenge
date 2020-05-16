import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../.././services/app.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  public resetPassSpinner = false;
  constructor(public router: Router, private _appService: AppService, private toastr: ToastrService, public route: ActivatedRoute) { }

  ngOnInit(): void {
  }
  resetPassword(passwordInput, passwordValRef) {
    let reset = true;
    if (passwordInput.value == "") {
      reset = false;
      passwordValRef.style.visibility = "visible";
    } else {
      passwordValRef.style.visibility = "hidden";
    }
    if (reset) {
      this.resetPassSpinner = true;
      this._appService.updatepassword(this.route.snapshot.paramMap.get("id"), passwordInput.value).subscribe(data => {
        setTimeout(() => {
          this.resetPassSpinner = false;
          if (data == "success") {
            this.router.navigate(["/login"]);
            this.toastr.info("", "Password reset successful.");
          }
          else {
            this.router.navigate(["/forgot-password"]);
            this.toastr.warning("", "Confirmation link invalid/expired.");
          }
        }, 500);
      });
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
