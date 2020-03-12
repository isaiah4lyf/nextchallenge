import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { AppService } from "../.././services/app.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private _appService: AppService) { }

  ngOnInit(): void {
  }

  register(form: NgForm) {

    this._appService.register(form).subscribe(data => {
      console.log(data);
    });

  }
}
