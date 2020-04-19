import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { AppService } from "../../.././services/app.service";

@Component({
  selector: "app-chat-user",
  templateUrl: "./chat-user.component.html",
  styleUrls: ["./chat-user.component.css"]
})
export class ChatUserComponent implements OnInit {
  @Input("chat") chat: any;
  @ViewChild("messageContent") messageContent: any;
  public userData = null;
  public fromUrl = "";
  public toUrl = "";
  public dateTime = "";
  public chatStatusClassesTo: any;
  public chatStatusClassesFrom: any;
  constructor(private _appService: AppService) { }

  ngOnInit(): void {
    this.userData = this._appService.getUserData();
    this.dateTime = this._appService.convertDateTimeToWord(this.chat["LastMessageDate"], this.chat["DateTimeNow"]);
    this.toUrl = "/chat/" + this.chat["ToUsers"][0]["Email"].split("@")[0];
    this.fromUrl = "/chat/" + this.chat["FromUsers"][0]["Email"].split("@")[0];
    this.chatStatusClassesTo = { 'led-silver-global': this.chat['ToUsers'][0]['ChatStatus'] == 'offline', 'led-green-global': this.chat['ToUsers'][0]['ChatStatus'] == 'available', 'led-red-global': this.chat['ToUsers'][0]['ChatStatus'] == 'busy', 'led-yellow-global': this.chat['ToUsers'][0]['ChatStatus'] == 'away' };
    this.chatStatusClassesTo[this.chat['ToUsers'][0]['_id']] = true;
    this.chatStatusClassesFrom = { 'led-silver-global': this.chat['FromUsers'][0]['ChatStatus'] == 'offline', 'led-green-global': this.chat['FromUsers'][0]['ChatStatus'] == 'available', 'led-red-global': this.chat['FromUsers'][0]['ChatStatus'] == 'busy', 'led-yellow-global': this.chat['FromUsers'][0]['ChatStatus'] == 'away' };
    this.chatStatusClassesFrom[this.chat['FromUsers'][0]['_id']] = true;
  }
  ngAfterViewInit() {
    this.messageContent.nativeElement.innerHTML = this.chat["LatestMessage"]["MessageContent"];
  }
}
