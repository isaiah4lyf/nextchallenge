import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Holiday } from './holiday.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
@Injectable()
export class HolidayService {
  private readonly API_URL = 'assets/data/holiday.json';
  dataChange: BehaviorSubject<Holiday[]> = new BehaviorSubject<Holiday[]>([]);
  // Temporarily stores data from dialogs
  dialogData: any;
  constructor(private httpClient: HttpClient) {}
  get data(): Holiday[] {
    return this.dataChange.value;
  }
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */
  getAllHolidays(): void {
    this.httpClient.get<Holiday[]>(this.API_URL).subscribe(
      data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }
  // DEMO ONLY, you can find working methods below
  addHoliday(holiday: Holiday): void {
    this.dialogData = holiday;
  }
  updateHoliday(holiday: Holiday): void {
    this.dialogData = holiday;
  }
  deleteHoliday(id: number): void {
    console.log(id);
  }
}
