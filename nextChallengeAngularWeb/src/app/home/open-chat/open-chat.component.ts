import { Component, OnInit, HostListener } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: "app-open-chat",
  templateUrl: "./open-chat.component.html",
  styleUrls: ["./open-chat.component.css"]
})
export class OpenChatComponent implements OnInit {
  public messages: any;
  public UserData: any;
  public ToUserData: any;
  public fileType = "none";

  public messagesTemp: any;
  public lastMessageID: string;
  public messagesRequested = true;

  public notificationsSocket: any;

  public stillActive = true;
  public touserName = "";
  constructor(
    private _appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private _notificationsService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this._appService
      .retrieveUserDataWithName(this.route.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0])
      .subscribe(data => {
        if (data == null) {
          this.router.navigate(["/chat"]);
        } else {
          this.ToUserData = data;
          this.touserName = this.ToUserData["FirstName"] + " " + this.ToUserData["LastName"];
          this._appService
            .retrievemessages(this.UserData["Email"].split("@")[0], this.route.snapshot.paramMap.get("id"))
            .subscribe(data => {
              this.messages = data;
              this.notificationsSocket = this._notificationsService.getNotificationsSocket(this.notificationsCallBack);

              if (this.messages.length > 0) {
                this.lastMessageID = this.messages[0]["_id"];
              }
              if (this.messages.length > 4) {
                setTimeout(() => {
                  window.scrollTo(0, document.body.scrollHeight);
                }, 500);
                setTimeout(() => {
                  window.scrollTo(0, document.body.scrollHeight);
                  this.messagesRequested = false;
                }, 1000);
              }
            });
        }
      });
  }
  ngOnDestroy() {
    this.stillActive = false;
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() < $(document).height() / 3 && this.lastMessageID != null && !this.messagesRequested) {
      this.messagesRequested = true;
      this._appService.retrievemessagesafter(this.UserData["Email"].split("@")[0], this.route.snapshot.paramMap.get("id"), this.lastMessageID).subscribe(data => {
        this.messagesTemp = data;
        if (this.messagesTemp.length > 11) {
          this.lastMessageID = this.messagesTemp[0]["_id"];
          this.messagesRequested = false;
        }
        this.messagesTemp.slice().reverse().forEach(element => {
          this.messages.unshift(element);
        });

      });
    }
  }
  createMessage(form: NgForm, filePreviewImg, fileInput, filePreviewVid) {
    let formData = new FormData();
    formData.append("MessageContent", form.value["MessageContent"]);
    formData.append("File", fileInput.files[0]);
    formData.append("FileType", this.fileType);
    formData.append("FromUserID", this.UserData["_id"]);
    formData.append("ToUserID", this.ToUserData["_id"]);
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    this._appService.createmessge(formData, this.messageCallBack);
  }
  clikImages(element) {
    element.click();
  }
  clikVideos(element) {
    element.click();
  }
  inputFileChalge(fileInput, filePreviewImg, filePreviewVid) {
    let mimeType = fileInput.files[0]["type"];
    if (mimeType.split("/")[0] === "video") {
      filePreviewImg.style.display = "none";
      filePreviewVid.style.display = "block";
      filePreviewVid.src = window.URL.createObjectURL(fileInput.files[0]);
      this.fileType = "video";
    } else if (mimeType.split("/")[0] === "image") {
      filePreviewVid.style.display = "none";
      filePreviewImg.style.display = "block";
      filePreviewImg.src = window.URL.createObjectURL(fileInput.files[0]);
      this.fileType = "image";
    } else {
      this.fileType = "none";
    }
  }
  notificationsCallBack = (data: any): any => {
    if (this.router.url.includes("/chat/")) {
      this.messages.push(JSON.parse(JSON.parse(data.data).Data));
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 500);
    }
    return this.stillActive;
  }
  messageCallBack = (data: any): void => {
    if (this.router.url.includes("/chat/")) {
      let notificationData = {
        NotificationType: "MESSAGE",
        NotificationFrom: this.UserData["_id"],
        NotificationTo: this.ToUserData["_id"],
        Data: data
      };
      this.notificationsSocket.send(JSON.stringify(notificationData));
    }
  }
}
