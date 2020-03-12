import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  profileRoute = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
      this.profileRoute = this.router.url.includes('/profile');
  }

}
