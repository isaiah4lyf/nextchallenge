import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { AppService } from "../../.././services/app.service";
import { ParentComponentApi } from '../open-chat.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.css"]
})
export class MessageComponent implements OnInit {
  @Input("message") message: any;
  @ViewChild("msgFile") messageFile;
  @Input() parentApi: ParentComponentApi;
  @ViewChild("messageContent") messageContent;
  public UserData: any;
  public videoControls = false;
  constructor(private _appService: AppService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.message['CreateDateTime'] = this._appService.convertDateTimeToWord(this.message['CreateDateTime'], this.message["DateTimeNow"]);;
    this.UserData = this._appService.getUserData();
    if (this.message['FromUsers'][0]['ProfilePic'] == null)
      this.message['FromUsers'][0]['ProfilePic'] = {
        _id: "none",
        FileName: "",
        UserID: this.message['FromUsers'][0]['_id'],
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
  }
  ngAfterViewInit() {
    if (this.message["_id"].length == 24) {
      let elementHtml = document.getElementById(this.message["_id"]) as HTMLElement;
      if (elementHtml != null)
        elementHtml.innerHTML = '<span style="position: relative; margin-right: 4px;">' + this.message['CreateDateTime'] + ' </span> <i class="icon ion-reply" style="position: absolute; font-size: 24px;"></i>';
    }
    this.messageContent.nativeElement.innerHTML = this.message["MessageContent"];
    if ((this.message["FileType"] == "image" || this.message["_id"].includes("message")) && this.message["FileType"] != "none")
      this.messageFile.nativeElement.src = this.message['Files'][0]['FileBaseUrls'][0];
  }
  deleteMessage(input, isfrom) {
    let id = this.message._id;
    if (this.message._id.includes("message"))
      id = input.name;
    this.parentApi.callParentMethod(id);
    this._appService.markmessageasdeleted(id, this.UserData["_id"]).subscribe(data => {
      this.toastr.warning("", "Message deleted successfully.");
    });
  }
}
