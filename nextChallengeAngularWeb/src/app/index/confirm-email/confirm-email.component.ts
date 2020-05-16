import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../.././services/app.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {

  constructor(public router: Router, private _appService: AppService, private toastr: ToastrService, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this._appService.confirmemail(this.route.snapshot.paramMap.get("id")).subscribe(data => {
      this.router.navigate(["/home"]);
      setTimeout(() => {
        if(data == "confirmed"){
          this.toastr.info("", "Email confirmed successfuly.");
        }
        else{
          this.toastr.warning("", "Confirmation link invalid/expired.");
        }
      }, 1000);
    });
  }
}
