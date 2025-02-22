import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.css"]
})
export class SessionComponent implements OnInit {
  public Configurations: any;
  public emojis: any = [];
  private fileType = "none";
  public sessionContents = [];
  public sessionSocket: any;
  public self = this;
  public sessionsCount = 0;
  public MessageLocalIdInc = 0;
  public element: HTMLElement;
  public UserData = null;
  public ServerData: any;
  public Settings: any = null;
  public MutlipleChoice: any = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  public CurrentChallenge: any = null;
  public Quit = false;
  constructor(private _appService: AppService, private router: Router, private route: ActivatedRoute, private _notificationsService: NotificationsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this.Settings = this._appService.getlocalsettings();
      if (this.Settings.find(s => s.Name == "SESSION_COMMANDS_LIST_MESSAGE").Value) {
        let messageData = {
          Command: "SESSION_COMMANDS",
          CommandJsonData: "commands"
        };
        this.sessionContents.push(messageData);
      }
      if (this._appService.CurrentLevel == this.route.snapshot.paramMap.get("id") && this._appService.CurrentSession == this.route.snapshot.paramMap.get("session") && this._appService.sessionSocket != null) {
        this.sessionSocket = this._appService.sessionSocket;
        if (this._appService.getSssionContents() != null && this._appService.getSssionContents() != undefined) {
          this.sessionContents = this._appService.getSssionContents();
          this.sessionsCount = this.sessionContents.length;
          this.MessageLocalIdInc = this.sessionContents.length;
          setTimeout(() => {
            this.sessionContents.forEach(element => {
              if (JSON.stringify(element).includes("MessageLocalId")) {
                let elementHtml = document.getElementById(element["MessageLocalId"]) as HTMLElement;
                if (elementHtml != null) elementHtml.innerHTML = '<span style="position: absolute; right: 12px;">' + new Date(element["DateTime"]).toLocaleString().split(",")[1] + '</span> <i class="icon ion-reply" style="position: absolute; font-size: 24px; right: -10px;"></i>';

              }
            });
          }, 500);
        }
      }
      else {
        if (this._appService.sessionSocket != null) {
          let messageData = {
            Command: "LEAVE_SESSION",
            CommandJsonData: this.UserData["_id"],
          };
          this._appService.sessionSocket.send(JSON.stringify(messageData));
          setTimeout(() => {
            this.connectSessionServer();
          }, 1000);
        } else {
          this.connectSessionServer();
        }

      }
      this._appService.CurrentLevel = this.route.snapshot.paramMap.get("id");
      this._appService.CurrentSession = this.route.snapshot.paramMap.get("session");
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
    this._appService.setSssionContents(this.sessionContents);
  }
  connectSessionServer() {
    this._appService.retrieveserver("ntp045df5").subscribe(data => {
      this.ServerData = data;
      this.sessionSocket = new WebSocket("ws://" + this.ServerData.IPAddresses.find(p => p.Name == "WebSocket").IPAddress + ":" + this.ServerData.Ports.find(p => p.Name == "WebSocket").Port + "/_df$socket$/session/" + this.route.snapshot.paramMap.get("id"));
      this.sessionSocket.onopen = this.processOpen;
      this.sessionSocket.onmessage = this.processMessage;
      this.sessionSocket.onerror = this.processError;
      this.sessionSocket.onclose = this.processClose;
    });
  }
  processOpen = message => {
    let messageData = {
      Command: "JOIN_GAME_SESSION",
      CommandJsonData: JSON.stringify({
        UserId: this.UserData["_id"],
        SessionId: Number(this.route.snapshot.paramMap.get("session"))
      })
    };
    this._appService.sessionSocket = this.sessionSocket;
    this.sessionSocket.send(JSON.stringify(messageData));
  };
  processMessage = message => {
    let messageData = JSON.parse(message.data);
    if (messageData.Command === "REMAINING_TIME") {
      this.element = document.getElementById("session-challenge-" + (this.sessionsCount - 1)) as HTMLElement;
      if (this.element != null) this.element.innerText = String(messageData.CommandJsonData - 1);
    }
    else if (messageData.Command == "JOINED_SESSION") {
      let data = JSON.parse(messageData.CommandJsonData);
      data["Command"] = String(messageData.Command);
      data["Message"] = "joined the session..";
      this.sessionContents.push(data);
    }
    else if (messageData.Command == "LEFT_SESSION") {
      let data = JSON.parse(messageData.CommandJsonData);
      data["Command"] = String(messageData.Command);
      data["Message"] = "left the session..";
      this.sessionContents.push(data);
    }
    else if (messageData.Command == "LEAVE_SESSION") {
      if (this.Quit) {
        this.sessionContents = null;
        this._appService.sessionSocket = null;
        this._appService.CurrentLevel = "";
        this._appService.CurrentSession = "";
        this.router.navigate(["/play"]);
      }
    }
    else if (messageData.Command == "LEVEL_LOCKED") {
      this.sessionContents = null;
      this._appService.sessionSocket = null;
      this._appService.CurrentLevel = "";
      this._appService.CurrentSession = "";
      this.router.navigate(["/play"]);
      this.toastr.warning("", "Level locked!");
    }
    else if (messageData.Command == "RETRIEVE_ATTEMPTS") {
      let elementHtml = document.getElementById("attempts-element") as HTMLElement;
      if (elementHtml != null) elementHtml.innerText = " " + messageData.CommandJsonData + " attempts";
    } else {
      let data = JSON.parse(messageData.CommandJsonData);
      data["Command"] = String(messageData.Command);
      let pushData = true;
      if (messageData.Command === "SESSION_CHALLENGE") {
        data["challnegeId"] = "session-challenge-" + this.sessionsCount;
        this.sessionsCount++;
        if (this.CurrentChallenge != null && this.sessionsCount == 2)
          if (this.CurrentChallenge._id == data._id) {
            pushData = false;
            this.sessionsCount--;
          }
        this.CurrentChallenge = data;
        if (data.ChallengeType == "Multiple Choice") {
          data.MultipleAnswers = this.shuffle(data.MultipleAnswers);
          let multi = data.MultipleAnswers;
          for (let i = 0; i < multi.length; i++) {
            multi[i] = this.MutlipleChoice[i] + ". " + multi[i];
          }
        }

      }
      if (pushData) this.sessionContents.push(data);
      this._appService.setSssionContents(this.sessionContents);
      if (this.sessionContents.length > 3) {
        setTimeout(() => {
          if (this.sessionContents.length > 3 && this.Settings.find(s => s.Name == "SESSION_SCROLL").Value) {
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(() => { window.scrollTo(0, document.body.scrollHeight); }, 200);
            setTimeout(() => { window.scrollTo(0, document.body.scrollHeight); }, 500);
            setTimeout(() => { window.scrollTo(0, document.body.scrollHeight); }, 800);
          }
        }, 100);
      }
    }
  };
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  processError = message => { };
  processClose = message => { };

  submitWithEnter(event, textarea, sumbitbutton) {
    if (this.Settings != null) {
      if (this.Settings.find(s => s.Name == "SUBMIT_SESSION_ANSWER_WITH_ENTER").Value) {
        event.preventDefault();
        sumbitbutton.click();
      }
    } else {
      event.preventDefault();
      sumbitbutton.click();
    }
  }
  createMessage(form: NgForm, filePreviewImg, fileInput, filePreviewVid, textarea) {
    if (textarea.innerHTML != '') {
      let msg = {
        Command: "MESSAGE_LOCAL",
        FirstName: this.UserData["FirstName"],
        LastName: this.UserData["LastName"],
        UserId: this.UserData["_id"],
        ProfilePic: this.UserData["ProfilePic"],
        Email: this.UserData["Email"],
        ChatStatus: this.UserData["ChatStatus"],
        ProfileCoverPic: this.UserData["ProfileCoverPic"],
        Message: textarea.innerHTML,
        DateTime: new Date(),
        MessageLocalId: "message-local-" + String(this.MessageLocalIdInc),
        FileType: this.fileType,
        fileUrl: fileInput.files.length == 0 ? "" : window.URL.createObjectURL(fileInput.files[0])
      };
      this.sessionContents.push(msg);
      this.MessageLocalIdInc++;
      if (textarea.innerHTML.startsWith(".l") || textarea.innerHTML.startsWith(".L")) {
        let messageData = {
          Command: "RETRIEVE_LEADERBOARDS",
          CommandJsonData: Number(this.route.snapshot.paramMap.get("session"))
        };
        this.sessionSocket.send(JSON.stringify(messageData));
      }
      else if (textarea.innerHTML.startsWith(".q") || textarea.innerHTML.startsWith(".Q")) {
        let messageData = {
          Command: "LEAVE_SESSION",
          CommandJsonData: this.UserData["_id"],
        };
        this.Quit = true;
        this.sessionSocket.send(JSON.stringify(messageData));
        setTimeout(() => {
          this.sessionContents = null;
          this._appService.sessionSocket = null;
          this._appService.CurrentLevel = "";
          this._appService.CurrentSession = "";
          this.router.navigate(["/play"]);
        }, 500);

      }
      else if (textarea.innerHTML.startsWith(".h") || textarea.innerHTML.startsWith(".H")) {
        let messageData = {
          Command: "SESSION_COMMANDS",
          CommandJsonData: "commands"
        };
        this.sessionContents.push(messageData);
      }
      else if (textarea.innerHTML.startsWith(".r") || textarea.innerHTML.startsWith(".R")) {
        this.connectSessionServer();
        this._appService.setSssionContents([]);
        this.sessionContents = [];
      }
      else if (textarea.innerHTML.startsWith(".c") || textarea.innerHTML.startsWith(".C")) {
        this._appService.setSssionContents([]);
        this.sessionContents = [this.CurrentChallenge];
      }
      else {
        if (fileInput.files.length == 0)
          this.fileType = "none";
        if (this.fileType != "none") {
          let formData = new FormData();
          formData.append("FileType", this.fileType);
          formData.append("File", fileInput.files[0]);
          formData.append("FileUploaderID", this.UserData["_id"]);
          this._appService.uploadfiles(formData, this.filesUploadCallBack, this.MessageLocalIdInc, textarea.innerHTML);
        } else {
          let messageToSend = textarea.innerHTML.trim();
          if (messageToSend.length == 1) {
            if (this.CurrentChallenge != null) {
              if (this.CurrentChallenge.ChallengeType == "Multiple Choice") {
                let index = this.MutlipleChoice.indexOf(this.MutlipleChoice.find(s => s == messageToSend.toLocaleUpperCase()));
                if (index != -1) messageToSend = this.CurrentChallenge.MultipleAnswers[index].substring(2);
              }
            }
          }
          let messageData = {
            Command: "",
            CommandJsonData: JSON.stringify({
              UserId: this.UserData["_id"],
              sessionId: 0,
              Message: messageToSend
            })
          };
          this.sessionSocket.send(JSON.stringify(messageData));
        }
      }
      if (this.sessionContents.length > 3) {
        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight);
        }, 100);
      }
      filePreviewImg.style.display = "none";
      filePreviewVid.style.display = "none";
      fileInput.value = "";
      textarea.innerHTML = "";
      if (this.fileType == "none") {
        setTimeout(() => {
          let dateTime = new Date();
          let element = document.getElementById("message-local-" + String(this.MessageLocalIdInc - 1)) as HTMLElement;
          if (element != null)
            element.innerHTML = '<span style="position: absolute; right: 12px;">' + dateTime.toLocaleString().split(",")[1] + '</span> <i class="icon ion-reply" style="position: absolute; font-size: 24px; right: -10px;"></i>';
        }, 100);
      }
      this.fileType = "none";
    }
    this._notificationsService.updateChatStatus();
  }
  clearFileInput(filePreviewImg, filePreviewVid, fileInput) {
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    fileInput.value = "";
    this.fileType = "none";
  }
  filesUploadCallBack = (result, extraParam, extraParam1): void => {
    let data = JSON.parse(result.toString());
    let dateTime = new Date(data[0]["UploadDateTime"]);
    let element = document.getElementById("message-local-" + String(extraParam - 1)) as HTMLElement;

    element.innerHTML = '<span style="position: absolute; right: 12px;">' + dateTime.toLocaleString().split(",")[1] + '</span> <i class="icon ion-reply" style="position: absolute; font-size: 24px; right: -10px;"></i>';

    let messageData = {
      Command: "INCORRECT_ANSWER",
      CommandJsonData: JSON.stringify({
        UserId: this.UserData["_id"],
        sessionId: 0,
        Message: JSON.stringify({
          Message: extraParam1,
          Files: JSON.stringify(data)
        })
      })
    };
    this.sessionSocket.send(JSON.stringify(messageData));
  };
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
}
