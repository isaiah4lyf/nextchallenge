import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-session-answer',
  templateUrl: './session-answer.component.html',
  styleUrls: ['./session-answer.component.css']
})
export class SessionAnswerComponent implements OnInit {
  @Input("answer") answer: any;
  constructor() { }

  ngOnInit(): void {
  }

}
