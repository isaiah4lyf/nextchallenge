import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { AppService } from "../../.././services/app.service";
import { Router } from "@angular/router";
import { ParentComponentApi } from '../post-view.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-comment",
  templateUrl: "./comment.component.html",
  styleUrls: ["./comment.component.css"]
})
export class CommentComponent implements OnInit {
  @Input("comment") comment: any;
  @Input() parentApi: ParentComponentApi;
  @ViewChild("commentFile") commentFile;
  @ViewChild("commentContent") commentContent: any;
  public commentDate = "";
  public chatStatusClasses: any;
  public videoControls = false;
  public UserData = null;
  constructor(public router: Router, private _appService: AppService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
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
    if ((this.comment["FileType"] == "image" || this.comment["_id"].includes("temp")) && this.comment["FileType"] != "none")
      this.commentFile.nativeElement.src = this.comment['Files'][0]['FileBaseUrls'][0];
  }
  deleteComment(_id) {
    if(_id.includes('temp')) _id = _id.split('-')[1];
    this._appService.deletecomment(_id).subscribe(data => {
      this.parentApi.callParentMethod("RETRIEVE_COMMENTS");
      this.toastr.warning("", "Comment deleted successfully.");
    });
    this.parentApi.callParentMethod("INITIALIZE_COMMENTS");
  }
}
