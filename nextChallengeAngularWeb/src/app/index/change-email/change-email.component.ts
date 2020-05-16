import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../.././services/app.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  styleUrls: ['./change-email.component.css']
})
export class ChangeEmailComponent implements OnInit {

  constructor(public router: Router, private _appService: AppService, private toastr: ToastrService, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this._appService.changeemail(this.route.snapshot.paramMap.get("id")).subscribe(data => {
      this.router.navigate(["/home"]);
      setTimeout(() => {
        if(data == "confirmed"){
          this.toastr.info("", "Request successfuly, you can now change your email.");
        }
        else{
          this.toastr.warning("", "Confirmation link invalid/expired.");
        }
      }, 1000);
    });
  }
}
