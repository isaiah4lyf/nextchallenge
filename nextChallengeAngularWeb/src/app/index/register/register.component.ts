import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AppService } from "../.././services/app.service";
import { User } from '../.././models/user';
import { Router } from "@angular/router";
import { DateOfBirth } from "../.././models/date-of-birth";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  public userModel = new User(new DateOfBirth(0, "Month", 0), "Male");
  public registrationSpinner = false;
  constructor(private _appService: AppService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void { }
  register(form: NgForm, firstNameValRef, lastNameValRef, emailValRef, passwordValRef, termsConditionsRef, termsConditionsValRef) {
    if (form.value.FirstName == "" || form.value.LastName == "" || form.value.EmailRegistration == "" || form.value.Password == "") {
      if (form.value.FirstName == "") {
        firstNameValRef.style.visibility = "visible";
      } else {
        firstNameValRef.style.visibility = "hidden";
      }
      if (form.value.LastName == "") {
        lastNameValRef.style.visibility = "visible";
      } else {
        lastNameValRef.style.visibility = "hidden";
      }
      if (form.value.EmailRegistration == "") {
        emailValRef.style.visibility = "visible";
      } else {
        emailValRef.style.visibility = "hidden";
      }
      if (form.value.Password == "") {
        passwordValRef.style.visibility = "visible";
      } else {
        passwordValRef.style.visibility = "hidden";
      }
      if (!termsConditionsRef.checked) {
        termsConditionsValRef.style.visibility = "visible";
      }
      else {
        termsConditionsValRef.style.visibility = "hidden";
      }
    }
    else if (!termsConditionsRef.checked) {
      termsConditionsValRef.style.visibility = "visible";
    }
    else {
      termsConditionsValRef.style.visibility = "hidden";
      this.registrationSpinner = true;
      this._appService.register(form).subscribe(data => {
        if (data != null) {
          this._appService.setUserData(data);
          this.router.navigate(['/home']);
          setTimeout(() => {
            console.log("_ses$on@$_!et$_$");
            this._appService.updatelocalsettings();
            this._appService.retrieveconfigurations().subscribe(data => {
              this._appService.setconfigurations(data);
            });
          }, 100);
        }
        setTimeout(() => {
          this.registrationSpinner = false;
          if (data == null) this.toastr.warning("", "Email already registered.");
        }, 500);
      });
    }
  }
  firstNameChange(form: NgForm, firstNameValRef) {
    if (form.value.FirstName == "") {
      firstNameValRef.style.visibility = "visible";
    } else {
      firstNameValRef.style.visibility = "hidden";
    }
  }
  lastNameChange(form: NgForm, lastNameValRef) {
    if (form.value.LastName == "") {
      lastNameValRef.style.visibility = "visible";
    } else {
      lastNameValRef.style.visibility = "hidden";
    }
  }
  emailChange(form: NgForm, emailValRef) {
    if (form.value.EmailRegistration == "") {
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
  terms(termsConditionsRef, termsConditionsValRef) {
    if (!termsConditionsRef.checked) {
      termsConditionsValRef.style.visibility = "visible";
    }
    else {
      termsConditionsValRef.style.visibility = "hidden";
    }
  }
}
