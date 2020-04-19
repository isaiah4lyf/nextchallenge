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
  public emojis = ["+1", "-1", "ant", "100"];
  public messages: any;
  public UserData: any;
  public ToUserData: any;
  public fileType = "none";
  public messagesTemp: any;
  public lastMessageID: string;
  public messagesRequested = true;
  public notificationsSocket: any;
  public stillActive = true;
  public messageInc = 0;
  public DataLoaded = false;
  constructor(private _appService: AppService, private router: Router, private route: ActivatedRoute, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrieveUserDataWithName(this.route.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => {
        if (data == null) {
          this.router.navigate(["/chat"]);
        } else {
          this.ToUserData = data;
          this.DataLoaded = true;
          this._appService.retrievemessages(this.UserData["Email"].split("@")[0], this.route.snapshot.paramMap.get("id")).subscribe(data => {
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
          this._appService.markmessagesasread(this.route.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => {
            if (data > 0) {
              let notificationData = {
                NotificationType: "MESSAGES_READ",
                NotificationFrom: this.UserData["_id"],
                NotificationTo: this.UserData["_id"],
                Data: "none"
              };
              setTimeout(() => {
                this.notificationsSocket.send(JSON.stringify(notificationData));
              }, 1000);
            }
          });
        }
      });
      this._notificationsService.updateChatStatus();
    }
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
      this._notificationsService.updateChatStatus();
    }
  }
  submitWithEnter(event, textarea, sumbitbutton) {
    event.preventDefault();
    sumbitbutton.click();
  }
  createMessage(form: NgForm, filePreviewImg, fileInput, filePreviewVid, textarea, emojisRef) {
    if (fileInput.files.length == 0)
      this.fileType = "none";
    let formData = new FormData();
    formData.append("MessageContent", textarea.innerHTML);
    formData.append("File", fileInput.files[0]);
    formData.append("FileType", this.fileType);
    formData.append("FromUserID", this.UserData["_id"]);
    formData.append("ToUserID", this.ToUserData["_id"]);
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    let message = {
      _id: "message-" + String(this.messageInc),
      FromUserID: this.UserData["_id"],
      ToUserID: this.ToUserData["_id"],
      MessageContent: textarea.innerHTML,
      FileType: this.fileType,
      MessageRead: false,
      CreateDateTime: new Date(),
      Files: fileInput.files.length == 0 ? [] : [
        {
          _id: "none",
          FileName: "none",
          UserID: this.UserData["_id"],
          FileType: this.fileType,
          UploadDateTime: new Date(),
          FileBaseUrls: [window.URL.createObjectURL(fileInput.files[0])]
        }
      ],
      FromUsers: [this.UserData],
      ToUsers: [this.ToUserData],
      DateTimeNow: new Date()
    };
    this.messages.push(message);
    if (this.messages.length > 4) {
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 500);
    }
    this._appService.createmessge(formData, this.messageCallBack, "message-" + String(this.messageInc));
    this.messageInc++;
    fileInput.value = "";
    this.fileType = "none";
    textarea.innerHTML = "";
    emojisRef.style.display = "none";
    this._notificationsService.updateChatStatus();
  }
  emojiClick(textarea, emoji) {
    textarea.innerHTML += '<img class="message-emoji" src="assets/css/emoji/' + emoji + '.png" />';
  }
  emojisClick(emojisRef) {
    if (emojisRef.style.display == "none") {
      emojisRef.style.display = "block";
    } else {
      emojisRef.style.display = "none";
    }
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
    let notification = JSON.parse(data.data);
    if (this.router.url.includes("/chat/")) {
      if (notification.NotificationType == "MESSAGE") {
        if (this.ToUserData["_id"] == notification.NotificationFrom) {
          this.messages.push(JSON.parse(notification.Data));
          setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight);
          }, 10);
          setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight);
          }, 500);
          this._appService.markmessagesasread(this.route.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => { });
        }
        else {
          notification.NotificationType = "NEW_EXTERNAL_MESSAGE";
          this.notificationsSocket.send(JSON.stringify(notification));
        }
      }
      else if (notification.NotificationType == "UPDATE_CHAT_STATUS") {
        if (this.ToUserData["_id"] == notification.NotificationFrom) {
          this.ToUserData["ChatStatus"] = notification.Data;
        }
      }
    }
  }
  messageCallBack = (data: any, messageId: any): void => {
    if (this.router.url.includes("/chat/")) {
      let notificationData = {
        NotificationType: "MESSAGE",
        NotificationFrom: this.UserData["_id"],
        NotificationTo: this.ToUserData["_id"],
        Data: data
      };
      let message = JSON.parse(data);
      let elementHtml = document.getElementById(messageId) as HTMLElement;
      elementHtml.innerHTML = '<span style="position: absolute; right: 14px;">' + this._appService.convertDateTimeToWord(message['CreateDateTime'], message['DateTimeNow']) + '</span> <i class="icon ion-reply" style="position: absolute; font-size: 24px; right: -8px;"></i>';
      this.notificationsSocket.send(JSON.stringify(notificationData));
    }
  }
}
