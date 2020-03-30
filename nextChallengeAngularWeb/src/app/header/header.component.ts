import { HostListener, Component, OnInit } from '@angular/core';
import { AppService } from ".././services/app.service";
import { Router } from "@angular/router";
import * as $ from 'jquery';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private UserData = null;
  public profileLink = "";
  public searchdata = [];
  public searchdataTemp: any;

  mobileScreen = document.body.offsetWidth + window.innerWidth - $(window).width() < 992;
  desktopScreen = document.body.offsetWidth + window.innerWidth - $(window).width() >= 992;

  constructor(private _appService: AppService, private router: Router) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this.profileLink = "/" + this.UserData["Email"].split('@')[0];
  }

  @HostListener('window:resize', ['$event'])
  onResized(event): void {
    this.mobileScreen = document.body.offsetWidth + window.innerWidth - $(window).width() < 992;
    this.desktopScreen = document.body.offsetWidth + window.innerWidth - $(window).width() >= 992;
  }
  search(searchInput) {
    if (searchInput.value.length > 3) {
      this._appService.search(searchInput.value).subscribe(data => {
        this.searchdataTemp = data;
        this.searchdata = [];
        this.searchdataTemp.forEach(element => {
          this.searchdata.push(element);
        });
      });
    }
  }
  searchRowClick(search) {
    this.searchdata = [];
    if (search['SearchType'] == 'post')
      this.router.navigate(["/post/" + search['_id']]);
    if (search['SearchType'] == 'user')
      this.router.navigate(["/" + search['_id'].split('@')[0] + "/timeline"]);
  }
}
