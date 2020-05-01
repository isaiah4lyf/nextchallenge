import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Professors } from './professors.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
@Injectable()
export class ProfessorsService {
  private readonly API_URL = 'assets/data/professors.json';
  dataChange: BehaviorSubject<Professors[]> = new BehaviorSubject<Professors[]>(
    []
  );
  // Temporarily stores data from dialogs
  dialogData: any;
  constructor(private httpClient: HttpClient) {}
  get data(): Professors[] {
    return this.dataChange.value;
  }
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */
  getAllProfessorss(): void {
    this.httpClient.get<Professors[]>(this.API_URL).subscribe(
      data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }
  // DEMO ONLY, you can find working methods below
  addProfessors(professors: Professors): void {
    this.dialogData = professors;
  }
  updateProfessors(professors: Professors): void {
    this.dialogData = professors;
  }
  deleteProfessors(id: number): void {
    console.log(id);
  }
}
