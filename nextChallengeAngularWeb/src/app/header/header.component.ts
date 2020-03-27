import { HostListener, Component, OnInit } from '@angular/core';
import { AppService } from ".././services/app.service";
import * as $ from 'jquery';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private UserData = null;
  public profileLink = "";

  mobileScreen = document.body.offsetWidth + window.innerWidth-$(window).width() < 992;
  desktopScreen = document.body.offsetWidth + window.innerWidth-$(window).width() >= 992;

  constructor(    private _appService: AppService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this.profileLink = "/" + this.UserData["Email"].split('@')[0];
  }

  @HostListener('window:resize', ['$event'])
  onResized(event): void {
      this.mobileScreen = document.body.offsetWidth + window.innerWidth-$(window).width() < 992;
      this.desktopScreen = document.body.offsetWidth + window.innerWidth-$(window).width() >= 992;
  }
}
