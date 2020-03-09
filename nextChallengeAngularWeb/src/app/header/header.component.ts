import { HostListener, Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  mobileScreen = document.body.offsetWidth < 992;
  desktopScreen = document.body.offsetWidth >= 992;

  constructor() { }

  ngOnInit(): void {



  }

  @HostListener('window:resize', ['$event'])
  onResized(event): void {
      this.mobileScreen = document.body.offsetWidth < 992;
      this.desktopScreen = document.body.offsetWidth >= 992;
  }
}
