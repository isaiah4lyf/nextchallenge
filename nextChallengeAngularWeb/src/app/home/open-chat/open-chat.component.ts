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
  public Configurations: any;
  public emojis: any = [];
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
  public Settings: any = null;
  constructor(private _appService: AppService, private router: Router, private route: ActivatedRoute, private _notificationsService: NotificationsService) { }
  getParentApi(): ParentComponentApi {
    return {
      callParentMethod: (name) => {
        this.parentMethod(name);
      }
    }
  }
  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this.Settings = this._appService.getlocalsettings();
      this._appService.retrieveUserDataWithName(this.route.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => {
        if (data == null) {
          this.router.navigate(["/chat"]);
        } else {
          this.ToUserData = data;
          this.DataLoaded = true;
          this._appService.retrievemessages(this.UserData["Email"].split("@")[0], this.route.snapshot.paramMap.get("id"),this.UserData["_id"]).subscribe(data => {
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
          if (this.ToUserData != null)
            if (this.ToUserData['ProfilePic'] == null)
              this.ToUserData['ProfilePic'] = {
                _id: "none",
                FileName: "",
                UserID: this.ToUserData['_id'],
                FileType: "image",
                UploadDateTime: new Date(),
                FileBaseUrls: ["assets/images/image_placeholder.jpg"]
              };
          if (this.ToUserData != null)
            if (this.ToUserData['ProfileCoverPic'] == null)
              this.ToUserData['ProfileCoverPic'] = {
                _id: "none",
                FileName: "",
                UserID: this.ToUserData['_id'],
                FileType: "image",
                UploadDateTime: new Date(),
                FileBaseUrls: ["assets/images/image_placeholder.jpg"]
              };
        }
      });
      this._notificationsService.updateChatStatus();
      this.Configurations = this._appService.getconfigurations();
      if (this.Configurations == null) {
        this._appService.retrieveconfigurations().subscribe(data => {
          this._appService.setconfigurations(data);
          this.Configurations = this._appService.getconfigurations();
          this.emojis = JSON.parse(this.Configurations.find(c => c.Name == "emojis").Value);
        });
      } else {
        this.emojis = JSON.parse(this.Configurations.find(c => c.Name == "emojis").Value);
      }
    }
  }
  ngOnDestroy() {
    this.stillActive = false;
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() < $(document).height() / 3 && this.lastMessageID != null && !this.messagesRequested) {
      this.messagesRequested = true;
      this._appService.retrievemessagesafter(this.UserData["Email"].split("@")[0], this.route.snapshot.paramMap.get("id"), this.lastMessageID,this.UserData["_id"]).subscribe(data => {
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
    if (this.Settings != null) {
      if (this.Settings.find(s => s.Name == "SUBMIT_CHAT_MESSAGE_WITH_ENTER").Value) {
        event.preventDefault();
        sumbitbutton.click();
      }
    } else {
      event.preventDefault();
      sumbitbutton.click();
    }
  }
  createMessage(form: NgForm, filePreviewImg, fileInput, filePreviewVid, textarea, emojisRef) {
    if (textarea.innerHTML != "" || fileInput.files.length > 0) {
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
    }
    this._notificationsService.updateChatStatus();
  }
  clearFileInput(filePreviewImg, filePreviewVid, fileInput) {
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    fileInput.value = "";
    this.fileType = "none";
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
      let elementHtmlInput = document.getElementById(messageId + '-input') as HTMLInputElement;
      elementHtmlInput.name = message['_id'];
      elementHtml.innerHTML = '<span style="position: relative; margin-right: 4px;">' + this._appService.convertDateTimeToWord(message['CreateDateTime'], message['DateTimeNow']) + '</span> <i class="icon ion-reply" style="position: absolute; font-size: 24px;"></i>';
      this.notificationsSocket.send(JSON.stringify(notificationData));
    }
  }
  parentMethod(name: any) {
    this.messages.splice(this.messages.indexOf(this.messages.find(s => s._id == name)), 1);
  }
}
export interface ParentComponentApi {
  callParentMethod: (any) => void
}
