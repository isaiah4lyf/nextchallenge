import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-session-challenge',
  templateUrl: './session-challenge.component.html',
  styleUrls: ['./session-challenge.component.css']
})
export class SessionChallengeComponent implements OnInit {
  @Input("challenge") challenge: any;

  constructor() { }

  ngOnInit(): void {
  }

}
