import { Component, OnInit, Input } from '@angular/core';
import { AppService } from "../../.././services/app.service";

@Component({
  selector: 'app-session-leaderboards',
  templateUrl: './session-leaderboards.component.html',
  styleUrls: ['./session-leaderboards.component.css']
})
export class SessionLeaderboardsComponent implements OnInit {
  @Input("leaderboards") leaderboards: any;
  public orderby = "score";
  public UserData: any;
  public orderLeaderboards: any;
  constructor(private _appService: AppService) { }

  ngOnInit(): void {
    this.orderLeaderboards = this.leaderboards["LeaderboardSortedByScore"];
    this.UserData = this._appService.getUserData();
  }
  orberbyScore() {
    this.orderLeaderboards = this.leaderboards["LeaderboardSortedByScore"];
    this.orderby = "score";
  }
  orberbyStreak() {
    this.orderLeaderboards = this.leaderboards["LeaderboardSortedByStreak"];
    this.orderby = "streak";
  }
}
