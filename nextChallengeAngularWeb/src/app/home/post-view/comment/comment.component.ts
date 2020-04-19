import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { AppService } from "../../.././services/app.service";

@Component({
  selector: "app-comment",
  templateUrl: "./comment.component.html",
  styleUrls: ["./comment.component.css"]
})
export class CommentComponent implements OnInit {
  @Input("comment") comment: any;
  @ViewChild("commentFile") commentFile;
  @ViewChild("commentContent") commentContent: any;
  public commentDate = "";
  public chatStatusClasses: any;
  constructor(private _appService: AppService) { }

  ngOnInit(): void {
    this.commentDate = this._appService.convertDateTimeToWord(this.comment["CreateDateTime"], this.comment["DateTimeNow"]);
    this.chatStatusClasses = { 'led-silver-global': this.comment['Users'][0]['ChatStatus'] == 'offline', 'led-green-global': this.comment['Users'][0]['ChatStatus'] == 'available', 'led-red-global': this.comment['Users'][0]['ChatStatus'] == 'busy', 'led-yellow-global': this.comment['Users'][0]['ChatStatus'] == 'away' };
    this.chatStatusClasses[this.comment['Users'][0]['_id']] = true;
    if (this.comment["Users"][0]["ProfilePic"] == null)
      this.comment["Users"][0]["ProfilePic"] = {
        _id: "none",
        FileName: "",
        UserID: this.comment["Users"][0]["_id"],
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
    if (this.comment["Users"][0]["ProfileCoverPic"] == null)
      this.comment["Users"][0]["ProfileCoverPic"] = {
        _id: "none",
        FileName: "",
        UserID: this.comment["Users"][0]["_id"],
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
  }
  ngOnChanges() {
    // create header using child_id
    this.commentDate = this._appService.convertDateTimeToWord(this.comment["CreateDateTime"], this.comment["DateTimeNow"]);
  }
  ngAfterViewInit() {
    this.commentContent.nativeElement.innerHTML = this.comment["CommentContent"];
    if (this.comment["FileType"] == "image" || this.comment["FileType"] == "video")
      this.commentFile.nativeElement.src = this.comment['Files'][0]['FileBaseUrls'][0];
  }
}
