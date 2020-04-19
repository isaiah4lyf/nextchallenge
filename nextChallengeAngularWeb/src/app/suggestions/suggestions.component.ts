import { Component, OnInit } from '@angular/core';
import { AppService } from ".././services/app.service";

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.css']
})
export class SuggestionsComponent implements OnInit {
  public suggestions: any = [];
  public UserData: any;

  constructor(private _appService: AppService) { }

  getParentApi(): ParentComponentApi {
    return {
      callParentMethod: (name) => {
        this.parentMethod(name);
      }
    }
  }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrievesuggestions(this.UserData["_id"]).subscribe(data => {
        this.suggestions = data;
      });
    }
  }
  parentMethod(name: any) {
    this.suggestions.splice(this.suggestions.indexOf(this.suggestions.find(s => s._id == name._id)), 1);
    setTimeout(() => {
      this._appService.retrievesuggestions(this.UserData["_id"]).subscribe(data => {
        this.suggestions = data;
      });
    }, 500);
  }
}
export interface ParentComponentApi {
  callParentMethod: (any) => void
}
