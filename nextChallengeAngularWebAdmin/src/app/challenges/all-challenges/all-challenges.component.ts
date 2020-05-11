import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChallengesService } from '.././challenges.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Challenge } from './../challenge.model';
import { DataSource } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormDialogComponent } from './dialogs/form-dialog/form-dialog.component';
import { DeleteComponent } from './dialogs/delete/delete.component';

@Component({
  selector: 'app-all-challenges',
  templateUrl: './all-challenges.component.html',
  styleUrls: ['./all-challenges.component.sass']
})
export class AllChallengesComponent implements OnInit {

  displayedColumns = [
    'Category',
    'Question',
    'ChallengeType',
    'Answer',
    'Points',
    'TimeInSeconds',
    'Levels',
    'Clue',
    'Active',
    'actions'
  ];
  exampleDatabase: ChallengesService | null;
  dataSource: ExampleDataSource | null;
  _id: string;
  department: Challenge | null;
  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public departmentService: ChallengesService,
    private snackBar: MatSnackBar
  ) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  ngOnInit() {
    this.loadData();
  }
  refresh() {
    this.loadData();
  }
  addNew() {
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        department: this.department,
        action: 'add'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        // After dialog is closed we're doing frontend updates
        // For add we're just pushing a new row inside DataService
        this.exampleDatabase.dataChange.value.unshift(
          this.departmentService.getDialogData()
        );
        this.refreshTable();
        this.showNotification(
          'snackbar-success',
          'Add Record Successfully...!!!',
          'bottom',
          'center'
        );
      }
    });
  }
  updateStatusAll(event) {
    this.departmentService.changedefaultsessionchallengesstatus(event.target.checked).subscribe(data => {
      console.log(data);
      this.refresh();
    });
  }
  updateStatus(event, row) {
    this.departmentService.changedefaultsessionchallengestatus(row._id, event.target.checked);
  }
  editCall(row) {
    console.log(row);
    this._id = row._id;
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        department: row,
        action: 'edit'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        // When using an edit things are little different, firstly we find record inside DataService by id
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(
          x => x._id === this._id
        );
        // Then you update that record using data from dialogData (values you enetered)
        this.exampleDatabase.dataChange.value[
          foundIndex
        ] = this.departmentService.getDialogData();
        // And lastly refresh table
        this.refreshTable();
        this.showNotification(
          'black',
          'Edit Record Successfully...!!!',
          'bottom',
          'center'
        );
      }
    });
  }
  deleteItem(row) {
    console.log(row);
    this._id = row._id;
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(
          x => x._id === this._id
        );
        // for delete we use splice in order to remove single object from DataService
        this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
        this.showNotification(
          'snackbar-danger',
          'Delete Record Successfully...!!!',
          'bottom',
          'center'
        );
      }
    });
  }
  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }
  public loadData() {
    this.exampleDatabase = new ChallengesService(this.httpClient);
    this.dataSource = new ExampleDataSource(
      this.exampleDatabase,
      this.paginator,
      this.sort
    );
    fromEvent(this.filter.nativeElement, 'keyup')
      // .debounceTime(150)
      // .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }
  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName
    });
  }
}
export class ExampleDataSource extends DataSource<Challenge> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: Challenge[] = [];
  renderedData: Challenge[] = [];
  constructor(
    public _exampleDatabase: ChallengesService,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Challenge[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];
    this._exampleDatabase.getAllDepartments();
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this._exampleDatabase.data
          .slice()
          .filter((department: Challenge) => {
            const searchStr = (
              department._id +
              department.Category +
              department.Question +
              department.Answer
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());
        // Grab the page's slice of the filtered sorted data.
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this._paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }
  disconnect() { }
  /** Returns a sorted copy of the database data. */
  sortData(data: Challenge[]): Challenge[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | boolean | string = '';
      let propertyB: number | boolean | string = '';
      switch (this._sort.active) {
        case '_id':
          [propertyA, propertyB] = [a._id, b._id];
          break;
        case 'Category':
          [propertyA, propertyB] = [a.Category, b.Category];
          break;
        case 'Question':
          [propertyA, propertyB] = [a.Question, b.Question];
          break;
        case 'Answer':
          [propertyA, propertyB] = [a.Answer, b.Answer];
          break;
        case 'Points':
          [propertyA, propertyB] = [a.Points, b.Points];
          break;
        case 'TimeInSeconds':
          [propertyA, propertyB] = [a.TimeInSeconds, b.TimeInSeconds];
          break;
        case 'Active':
          [propertyA, propertyB] = [a.Active, b.Active];
          break;
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}
