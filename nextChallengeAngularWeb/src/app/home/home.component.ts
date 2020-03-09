import { HostListener, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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
