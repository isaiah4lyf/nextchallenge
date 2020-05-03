import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Challenge } from './challenge.model';
import { HttpHeaders } from "@angular/common/http";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
@Injectable()
export class ChallengesService {
  private readonly API_URL = 'assets/data/department.json';
  private configUrl = "http://www.nextchallenge.co.za/api/api/index/";
  //private configUrl = "http://localhost:44357/api/index/";
  private httpOptions = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };
  private httpOptionsMultipart = { headers: new HttpHeaders({ "Content-Type": "multipart/form-data; boundary=--------------------------654287500409823045608277" }) };
  dataChange: BehaviorSubject<Challenge[]> = new BehaviorSubject<Challenge[]>(
    []
  );
  // Temporarily stores data from dialogs
  dialogData: any;
  constructor(private httpClient: HttpClient) { }
  get data(): Challenge[] {
    return this.dataChange.value;
  }
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */
  getAllDepartments(): void {
    this.httpClient.get(this.configUrl + "retrievedefaultsessionchallenge", this.httpOptions).subscribe(data => {
      console.log(data);
    });
    this.httpClient.get<Challenge[]>(this.configUrl + "retrievedefaultsessionchallengeall", this.httpOptions).subscribe(
      data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }
  changedefaultsessionchallengestatus(challengeid, status): void {
    this.httpClient.put(this.configUrl + "changedefaultsessionchallengestatus?challengeid=" + challengeid + "&status=" + status, this.httpOptions).subscribe(data => {
      console.log(data);
    });
  }
  changedefaultsessionchallengesstatus(status) {
    return this.httpClient.put(this.configUrl + "changedefaultsessionchallengesstatus?status=" + status, this.httpOptions);
  }
  createdefaultsessionchallenge(formData) {
    this.httpClient.post(this.configUrl + "createdefaultsessionchallenge", formData).subscribe(data => {
      console.log(data);
    });
  }
  // DEMO ONLY, you can find working methods below
  addDepartment(department: Challenge): void {
    this.dialogData = department;
  }
  updateDepartment(department: Challenge): void {
    this.dialogData = department;
  }
  deleteDepartment(department: Challenge): void {
    this.dialogData = department;
    this.httpClient.delete(this.configUrl + "deletedefaultsessionchallenge?challengeid=" + this.dialogData._id, this.httpOptions).subscribe(data => { console.log(data); });
  }
}
