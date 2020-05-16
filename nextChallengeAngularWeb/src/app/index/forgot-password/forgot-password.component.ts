import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../.././services/app.service";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  public forgotPassSpinner = false;
  constructor(private _appService: AppService, private toastr: ToastrService) { }

  ngOnInit(): void {

  }
  forgotPassword(emailRef, emailValRef) {
    let sendEmail = true;
    if (!this.emailIsValid(emailRef.value)) {
      emailValRef.style.visibility = "visible";
      sendEmail = false;
    }
    else {
      emailValRef.style.visibility = "hidden";
    }
    if (sendEmail) {
      this.forgotPassSpinner = true;
      this._appService.sendpasswordresetlink(emailRef.value).subscribe(data => {
        this.forgotPassSpinner = false;
        this.toastr.info("", "Password reset link sent.");
      });
    }
  }
  checkEmail(emailRef, emailValRef){
    if (!this.emailIsValid(emailRef.value)) {
      emailValRef.style.visibility = "visible";
    }
    else {
      emailValRef.style.visibility = "hidden";
    }
  }
  emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
