import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppService } from "../../.././services/app.service";
import { NotificationsService } from "../../.././services/notifications.service";
import { FormControl, FormGroup, FormArray, FormBuilder, NgForm } from '@angular/forms';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.css']
})
export class WorkComponent implements OnInit {
  public form: FormGroup;
  public UserData: any;
  public CompanyData: any;
  public workSpin = false;
  constructor(private fb: FormBuilder, private _appService: AppService, private _notificationsService: NotificationsService) {
    this.form = this.fb.group({
      companies: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrievecompanies(this.UserData["_id"]).subscribe(data => {
        this.mergForm(data);
      });
      this._notificationsService.updateChatStatus();
    }
  }
  mergForm(data) {
    const companies = this.form.controls.companies as FormArray;
    this.CompanyData = data;
    this.CompanyData.forEach(element => {
      companies.push(this.fb.group({
        _id: element._id,
        UserID: element.UserID,
        Designation: element.Designation,
        Name: element.Name,
        From: element.From,
        To: element.To,
        CityOrTown: element.CityOrTown,
        Description: element.Description
      }));
    });
  }
  sumbitWork() {
    this.workSpin = true;
    let data = [];
    this.form.value["companies"].forEach(element => {
      data.push(element);
    });
    this._appService.updatecompanies(JSON.stringify(data)).subscribe(data => {
      this.form = this.fb.group({
        companies: this.fb.array([]),
      });
      this.mergForm(data);
      this._appService.retrievelogonupdate(this.UserData["_id"]).subscribe(data => {
        this._appService.setUserData(data);
      });
      setTimeout(() => {
        this.workSpin = false;
      }, 300);
    });
    this._notificationsService.updateChatStatus();
  }
  addCompanies() {
    const companies = this.form.controls.companies as FormArray;
    companies.push(this.fb.group({
      _id: null,
      UserID: this.UserData["_id"],
      Designation: '',
      Name: '',
      From: '',
      To: '',
      CityOrTown: '',
      Description: ''
    }));
    this._notificationsService.updateChatStatus();
  }
  cmpare(index) {
    return index;
  }
  deleteCompany(i) {
    const companies = this.form.controls.companies as FormArray;
    if (companies.at(i).value._id != null) this._appService.deletecompany(companies.at(i).value._id).subscribe(data => {
      this._appService.retrievelogonupdate(this.UserData["_id"]).subscribe(data => {
        this._appService.setUserData(data);
      });
    });
    companies.removeAt(i);
    this._notificationsService.updateChatStatus();
  }
}
