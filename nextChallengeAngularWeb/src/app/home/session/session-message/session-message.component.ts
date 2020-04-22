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
  public videoControls = false;
  public videoPoster = "";
  constructor() { }

  ngOnInit(): void {
    if (this.message["Command"] == "CORRECT" || this.message["Command"] == "INCORRECT_ANSWER" || this.message["Command"] == "LEFT_SESSION" || this.message["Command"] == "JOINED_SESSION")
      this.ResponseTime = new Date(this.message["RepsoneDateTime"]).toLocaleString().split(",")[1];

    if (this.message['ProfilePic'] == null || this.message['ProfilePic'] == 'undifined')
      this.message['ProfilePic'] = {
        _id: "none",
        FileName: "",
        UserID: this.message['_id'],
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
    
    if (this.message['ProfileCoverPic'] == null || this.message['ProfileCoverPic'] == 'undifined')
      this.message['ProfileCoverPic'] = {
        _id: "none",
        FileName: "",
        UserID: this.message['UserId'],
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
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
            if (files[0]["FileType"] == "video") {
              this.videoPoster = files[0]['FilePosterUrls'][0];
            }
          }, 50);
        }, 50);
      } catch (e) {
        console.log(this.message["Message"]);
        this.messageContent.nativeElement.innerHTML = this.message["Message"];
      }
    }
  }
}
