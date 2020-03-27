import { Component, OnInit, Input } from "@angular/core";
import { AppService } from "../../.././services/app.service";

@Component({
  selector: "app-chat-user",
  templateUrl: "./chat-user.component.html",
  styleUrls: ["./chat-user.component.css"]
})
export class ChatUserComponent implements OnInit {
  @Input("chat") chat: any;
  public userData = null;
  public fromUrl = "";
  public toUrl = "";
  public dateTime = "";
  constructor(private _appService: AppService) {}

  ngOnInit(): void {
    this.userData = this._appService.getUserData();
    this.dateTime = this._appService.convertDateTimeToWord(this.chat["LastMessageDate"],this.chat["DateTimeNow"]);
    this.toUrl = "/chat/" + this.chat["ToUsers"][0]["Email"].split("@")[0];
    this.fromUrl = "/chat/" + this.chat["FromUsers"][0]["Email"].split("@")[0];
  }
}
