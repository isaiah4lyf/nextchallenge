import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Library } from './library.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
@Injectable()
export class LibraryService {
  private readonly API_URL = 'assets/data/library.json';
  dataChange: BehaviorSubject<Library[]> = new BehaviorSubject<Library[]>([]);
  // Temporarily stores data from dialogs
  dialogData: any;
  constructor(private httpClient: HttpClient) {}
  get data(): Library[] {
    return this.dataChange.value;
  }
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */
  getAllLibrarys(): void {
    this.httpClient.get<Library[]>(this.API_URL).subscribe(
      data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }
  // DEMO ONLY, you can find working methods below
  addLibrary(library: Library): void {
    this.dialogData = library;
  }
  updateLibrary(library: Library): void {
    this.dialogData = library;
  }
  deleteLibrary(id: number): void {
    console.log(id);
  }
}
