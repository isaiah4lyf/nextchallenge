import { Component, OnInit, Input } from '@angular/core';
import { AppService } from "../../.././services/app.service";
import { NotificationsService } from "../../.././services/notifications.service";

@Component({
  selector: 'app-session-challenge',
  templateUrl: './session-challenge.component.html',
  styleUrls: ['./session-challenge.component.css']
})
export class SessionChallengeComponent implements OnInit {
  @Input("challenge") challenge: any;
  public UserData: any;
  public videoControls = false;
  public likesCount = 0;
  public disLikesCount = 0;
  public PostLiked = false;
  public PostDisLiked = false;
  public postLikedClass = "btn text-green";
  public postDisLikedClass = "btn text-red";
  public chatStatusClasses: any;
  public displayStats = false;
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this._appService.retrievedefaultsessionchallengestats(this.challenge['_id'], this.UserData['_id']).subscribe(data => {
      this.likesCount = data["LikesCount"];
      this.disLikesCount = data["DislikesCount"];
      this.postLikedClass = data["PostLiked"] ? "btn text-blue" : "btn text-green";
      this.postDisLikedClass = data["PostDisLiked"] ? "btn text-blue" : "btn text-red";
      this.PostLiked = data["PostLiked"];
      this.PostDisLiked = data["PostDisLiked"];
      this.displayStats = true;
    });
  }
  like() {
    if (this.PostLiked) {
      this.likesCount--;
      this._appService.deletepostlike(this.challenge["_id"], this.UserData["_id"]);
      this.PostLiked = false;
      this.postLikedClass = "btn text-green";
      this.postDisLikedClass = "btn text-red";
    } else {
      this.likesCount++;
      this._appService.likepost(this.challenge["_id"], this.UserData["_id"]);
      this.PostLiked = true;
      this.postLikedClass = "btn text-blue";
      this.postDisLikedClass = "btn text-red";
    }
    if (this.PostDisLiked) {
      this.disLikesCount--;
      this._appService.deletepostdislike(this.challenge["_id"], this.UserData["_id"]);
      this.PostDisLiked = false;
      this.postDisLikedClass = "btn text-red";
    }
    this._notificationsService.updateChatStatus();
  }
  dislike() {
    if (this.PostDisLiked) {
      this.disLikesCount--;
      this._appService.deletepostdislike(this.challenge["_id"], this.UserData["_id"]);
      this.PostDisLiked = false;
      this.postLikedClass = "btn text-green";
      this.postDisLikedClass = "btn text-red";
    } else {
      this.disLikesCount++;
      this._appService.dislikepost(this.challenge["_id"], this.UserData["_id"]);
      this.PostDisLiked = true;
      this.postLikedClass = "btn text-green";
      this.postDisLikedClass = "btn text-blue";
    }
    if (this.PostLiked) {
      this.likesCount--;
      this._appService.deletepostlike(this.challenge["_id"], this.UserData["_id"]);
      this.PostLiked = false;
      this.postLikedClass = "btn text-green";
    }
    this._notificationsService.updateChatStatus();
  }
}
