import { Component, OnInit } from "@angular/core";
import { AppService } from "../.././services/app.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit {
  public userData = null;
  public chats = null;
  public dataLoaded = false;
  constructor(private _appService: AppService) {}

  ngOnInit(): void {
    this.userData = this._appService.getUserData();
    this._appService.retrieveactivechats(this.userData["_id"]).subscribe(data => {
      this.chats = data;
      this.dataLoaded = true;
    });
  }
}
