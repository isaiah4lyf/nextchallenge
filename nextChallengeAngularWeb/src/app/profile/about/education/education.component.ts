import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppService } from "../../.././services/app.service";
import { NotificationsService } from "../../.././services/notifications.service";
import { FormControl, FormGroup, FormArray, FormBuilder, NgForm } from '@angular/forms';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {
  public form: FormGroup;
  public UserData: any;
  public SchoolData: any;
  public eduSpin = false;
  constructor(private fb: FormBuilder, private _appService: AppService, private _notificationsService: NotificationsService) {
    this.form = this.fb.group({
      schools: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrieveschools(this.UserData["_id"]).subscribe(data => {
        this.mergForm(data);
      });
      this._notificationsService.updateChatStatus();
    }
  }
  mergForm(data) {
    const scrools = this.form.controls.schools as FormArray;
    this.SchoolData = data;
    this.SchoolData.forEach(element => {
      scrools.push(this.fb.group({
        _id: element._id,
        UserID: element.UserID,
        Name: element.Name,
        From: element.From,
        To: element.To,
        Description: element.Description
      }));
    });
  }
  sumbitEducation() {
    this.eduSpin = true;
    let data = [];
    this.form.value["schools"].forEach(element => {
      data.push(element);
    });
    this._appService.updateschools(JSON.stringify(data)).subscribe(data => {
      this.form = this.fb.group({
        schools: this.fb.array([]),
      });
      this.mergForm(data);
      this._appService.retrievelogonupdate(this.UserData["_id"]).subscribe(data => {
        this._appService.setUserData(data);
      });
      setTimeout(() => {
        this.eduSpin = false;
      }, 300);
    });
    this._notificationsService.updateChatStatus();
  }
  addSchools() {
    const scrools = this.form.controls.schools as FormArray;
    scrools.push(this.fb.group({
      _id: null,
      UserID: this.UserData["_id"],
      Name: '',
      From: '',
      To: '',
      Description: ''
    }));
    this._notificationsService.updateChatStatus();
  }
  cmpare(index) {
    return index;
  }
  deleteEduction(i) {
    const schools = this.form.controls.schools as FormArray;
    if (schools.at(i).value._id != null)
      this._appService.deleteschool(schools.at(i).value._id).subscribe(data => {
        this._appService.retrievelogonupdate(this.UserData["_id"]).subscribe(data => {
          this._appService.setUserData(data);
        });
      });
    schools.removeAt(i);
    this._notificationsService.updateChatStatus();
  }
}
