import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { AppService } from "../../.././services/app.service";

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.css"]
})
export class MessageComponent implements OnInit {
  @Input("message") message: any;
  @ViewChild("msgFile") messageFile;
  @ViewChild("messageContent") messageContent;
  public UserData: any;
  public videoControls = false;
  constructor(private _appService: AppService) { }

  ngOnInit(): void {
    this.message['CreateDateTime'] = this._appService.convertDateTimeToWord(this.message['CreateDateTime'], this.message["DateTimeNow"]);;
    this.UserData = this._appService.getUserData();
  }
  ngAfterViewInit() {
    if (this.message["_id"].length == 24) {
      let elementHtml = document.getElementById(this.message["_id"]) as HTMLElement;
      if (elementHtml != null)
        elementHtml.innerHTML = '<span style="position: absolute; right: 14px;">' + this.message['CreateDateTime'] + '</span> <i class="icon ion-reply" style="position: absolute; font-size: 24px; right: -10px;"></i>';
    }
    this.messageContent.nativeElement.innerHTML = this.message["MessageContent"];
    if (this.message["FileType"] == "image" || this.message["FileType"] == "video")
      this.messageFile.nativeElement.src = this.message['Files'][0]['FileBaseUrls'][0];
  }
}
