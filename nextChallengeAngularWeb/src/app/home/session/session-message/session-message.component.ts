import { Component, OnInit, Input, ViewChild } from "@angular/core";

@Component({
  selector: "app-session-message",
  templateUrl: "./session-message.component.html",
  styleUrls: ["./session-message.component.css"]
})
export class SessionMessageComponent implements OnInit {
  @Input("message") message: any;
  @ViewChild("msgFile") messageFile;
  @ViewChild("messageContent") messageContent;
  public IncorrectAnswerFileType = "none";
  public ResponseTime: any;
  constructor() { }

  ngOnInit(): void {
    if (this.message["Command"] == "CORRECT" || this.message["Command"] == "INCORRECT_ANSWER")
      this.ResponseTime = new Date(this.message["RepsoneDateTime"]).toLocaleString().split(",")[1];
  }
  ngAfterViewInit() {
    if (this.message["FileType"] == "image" || this.message["FileType"] == "video")
      this.messageFile.nativeElement.src = this.message["fileUrl"];
    if (this.message["Command"] == "MESSAGE_LOCAL")
      this.messageContent.nativeElement.innerHTML = this.message["Message"];

    if (this.message["Command"] == "INCORRECT_ANSWER") {
      try {
        let data = JSON.parse(this.message["Message"]);
        let files = JSON.parse(data["Files"]);
        this.messageContent.nativeElement.innerHTML = data["Message"];
        setTimeout(() => {
          this.IncorrectAnswerFileType = files[0]["FileType"];
          setTimeout(() => {
            this.messageFile.nativeElement.src = files[0]["FileBaseUrls"][0];
          }, 50);
        }, 50);
      } catch (e) {
        console.log(this.message["Message"]);
        this.messageContent.nativeElement.innerHTML = this.message["Message"];
      }
    }
  }
}
