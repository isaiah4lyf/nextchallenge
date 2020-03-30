import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppService } from "../../.././services/app.service";
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
  constructor(private fb: FormBuilder, private _appService: AppService) {
    this.form = this.fb.group({
      companies: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this._appService.retrievecompanies(this.UserData["_id"]).subscribe(data => {
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

    });
  }
  sumbitWork() {
    let data = [];
    this.form.value["companies"].forEach(element => {
      data.push(element);
    });
    this._appService.updatecompanies(JSON.stringify(data)).subscribe(data => { });
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
  }
  cmpare(index) {
    return index;
  }
  deleteCompany(i) {
    const companies = this.form.controls.companies as FormArray;
    if (companies.at(i).value._id != null) this._appService.deletecompany(companies.at(i).value._id).subscribe(data => { });
    companies.removeAt(i);
  }
}
