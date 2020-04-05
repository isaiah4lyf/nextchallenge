import { HostListener, Component, OnInit } from '@angular/core';
import { AppService } from ".././services/app.service";
import { NotificationsService } from ".././services/notifications.service";
import { ToastrService } from 'ngx-toastr';
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
  public stillActive = true;

  mobileScreen = document.body.offsetWidth + window.innerWidth - $(window).width() < 992;
  desktopScreen = document.body.offsetWidth + window.innerWidth - $(window).width() >= 992;

  constructor(private _appService: AppService, private _notificationsService: NotificationsService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this.profileLink = "/" + this.UserData["Email"].split('@')[0];
      this._appService.retrieveservers("WebSocket").subscribe(data => {
        this._notificationsService.setServerData(data);
        this._notificationsService.startNotificationsSocket(this.UserData);
        this._notificationsService.getNotificationsSocket(this.notificationsCallBack);
      });
    }
  }
  ngOnDestroy() {
    this.stillActive = false;
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
    else {
      this.searchdata = [];
    }
  }
  inputBlur() {
    setTimeout(() => {
      this.searchdata = [];
    }, 500);
  }
  searchRowClick(search) {
    this.searchdata = [];
    if (search['SearchType'] == 'post')
      this.router.navigate(["/post/" + search['_id']]);
    if (search['SearchType'] == 'user')
      this.router.navigate(["/" + search['_id'].split('@')[0] + "/timeline"]);
  }
  showToastr() {
    this.toastr.info("Some message sge...", "New Message: Matome Ramafalo");
  }
  notificationsCallBack = (data: any): any => {
    let notification = JSON.parse(data.data);
    if (notification.NotificationType == "MESSAGE" && !this.router.url.includes("/chat/" + JSON.parse(notification.Data).FromUsers[0].Email.split('@')[0])) {
      this.toastr.info(JSON.parse(notification.Data).MessageContent, "New Message: " + JSON.parse(notification.Data).FromUsers[0].FirstName + " " + JSON.parse(notification.Data).FromUsers[0].LastName);
    }
    return this.stillActive;
  }

}
