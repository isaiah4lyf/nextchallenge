import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Fees } from './fees.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
@Injectable()
export class FeesService {
  private readonly API_URL = 'assets/data/fees.json';
  dataChange: BehaviorSubject<Fees[]> = new BehaviorSubject<Fees[]>([]);
  // Temporarily stores data from dialogs
  dialogData: any;
  constructor(private httpClient: HttpClient) {}
  get data(): Fees[] {
    return this.dataChange.value;
  }
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */
  getAllFeess(): void {
    this.httpClient.get<Fees[]>(this.API_URL).subscribe(
      data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }
  // DEMO ONLY, you can find working methods below
  addFees(fees: Fees): void {
    this.dialogData = fees;
  }
  updateFees(fees: Fees): void {
    this.dialogData = fees;
  }
  deleteFees(id: number): void {
    console.log(id);
  }
}
