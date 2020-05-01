import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';
import { RightSidebarService } from '../../shared/services/rightsidebar.service';
@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.sass'],
})
export class RightSidebarComponent implements OnInit {
  selectedBgColor = 'black';
  maxHeight: string;
  maxWidth: string;
  showpanel = false;
  isOpenSidebar: boolean;
  isDarkSidebar = false;
  isDarTheme = false;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private dataService: RightSidebarService
  ) { }
  ngOnInit() {
    this.dataService.currentStatus.subscribe((data: boolean) => {
      this.isOpenSidebar = data;
    });
    this.setRightSidebarWindowHeight();
    this.setRightSidebarButtonOnStartUp();
    // set header color on startup
    if (localStorage.getItem('choose_skin2')) {
      this.renderer.addClass(
        this.document.body,
        localStorage.getItem('choose_skin2')
      );
      this.selectedBgColor = localStorage.getItem('choose_skin_active2');
    } else {
      this.renderer.addClass(
        this.document.body,
        'theme-' + this.selectedBgColor
      );
    }
  }
  selectTheme(e) {
    this.selectedBgColor = e;
    const prevTheme = this.elementRef.nativeElement
      .querySelector('.right-sidebar .demo-choose-skin li.actived')
      .getAttribute('data-theme');
    this.renderer.removeClass(this.document.body, 'theme-' + prevTheme);
    this.renderer.addClass(this.document.body, 'theme-' + this.selectedBgColor);
    localStorage.setItem('choose_skin2', 'theme-' + this.selectedBgColor);
    localStorage.setItem('choose_skin_active2', this.selectedBgColor);
  }
  lightSidebarBtnClick() {
    this.renderer.removeClass(this.document.body, 'menu_dark');
    this.renderer.removeClass(this.document.body, 'logo-black');
    this.renderer.addClass(this.document.body, 'menu_light');
    this.renderer.addClass(this.document.body, 'logo-white');
    const menuOption = 'menu_light';
    localStorage.setItem('choose_logoheader2', 'logo-white');
    localStorage.setItem('menuOption2', menuOption);
  }
  darkSidebarBtnClick() {
    this.renderer.removeClass(this.document.body, 'menu_light');
    this.renderer.removeClass(this.document.body, 'logo-white');
    this.renderer.addClass(this.document.body, 'menu_dark');
    this.renderer.addClass(this.document.body, 'logo-black');
    const menuOption = 'menu_dark';
    localStorage.setItem('choose_logoheader2', 'logo-black');
    localStorage.setItem('menuOption2', menuOption);
  }
  lightThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'dark');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_dark');
    this.renderer.removeClass(this.document.body, 'logo-black');
    if (localStorage.getItem('choose_skin2')) {
      this.renderer.removeClass(
        this.document.body,
        localStorage.getItem('choose_skin2')
      );
      this.renderer.addClass(this.document.body, 'theme-white');
    }

    this.renderer.addClass(this.document.body, 'light');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_light');
    this.renderer.addClass(this.document.body, 'logo-white');
    const theme = 'light';
    const menuOption = 'menu_light';
    this.selectedBgColor = 'white';
    this.isDarkSidebar = false;
    localStorage.setItem('choose_logoheader2', 'logo-white');
    localStorage.setItem('choose_skin2', 'theme-white');
    localStorage.setItem('theme2', theme);
    localStorage.setItem('menuOption2', menuOption);
  }
  darkThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'light');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_light');
    this.renderer.removeClass(this.document.body, 'logo-white');
    if (localStorage.getItem('choose_skin2')) {
      this.renderer.removeClass(
        this.document.body,
        localStorage.getItem('choose_skin2')
      );
      this.renderer.addClass(this.document.body, 'theme-black');
    }
    this.renderer.addClass(this.document.body, 'dark');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_dark');
    this.renderer.addClass(this.document.body, 'logo-black');
    const theme = 'dark';
    const menuOption = 'menu_dark';
    this.selectedBgColor = 'black';
    this.isDarkSidebar = true;
    localStorage.setItem('choose_logoheader2', 'logo-black');
    localStorage.setItem('choose_skin2', 'theme-black');
    localStorage.setItem('theme2', theme);
    localStorage.setItem('menuOption2', menuOption);
  }
  setRightSidebarWindowHeight() {
    const height = window.innerHeight - 137;
    this.maxHeight = height + '';
    this.maxWidth = '500px';
  }
  onClickedOutside(event: Event) {
    const button = event.target as HTMLButtonElement;
    if (button.id !== 'settingBtn') {
      if (this.dataService.currentStatus._isScalar === true) {
        this.toggleRightSidebar();
      }
    }
  }
  toggleRightSidebar(): void {
    this.dataService.changeMsg(
      (this.dataService.currentStatus._isScalar = !this.dataService
        .currentStatus._isScalar)
    );
  }

  setRightSidebarButtonOnStartUp() {
    if (localStorage.getItem('menuOption2') === 'menu_dark') {
      this.isDarkSidebar = true;
    } else if (localStorage.getItem('menuOption2') === 'menu_light') {
      this.isDarkSidebar = false;
    } else {
      this.isDarkSidebar = true;
    }

    if (localStorage.getItem('theme2') === 'dark') {
      this.isDarTheme = true;
    } else if (localStorage.getItem('theme2') === 'light') {
      this.isDarTheme = false;
    } else {
      this.isDarTheme = true;
    }
  }
}
