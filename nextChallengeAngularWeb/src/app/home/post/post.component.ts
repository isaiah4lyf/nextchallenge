import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { ParentComponentApi } from '../../profile/timeline/timeline.component';
import { NotificationsService } from "../.././services/notifications.service";
import { NgForm } from "@angular/forms";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-post",
  templateUrl: "./post.component.html",
  styleUrls: ["./post.component.css"]
})
export class PostComponent implements OnInit {
  @Input("post") post: any;
  @Input() parentApi: ParentComponentApi;
  @ViewChild("postContent") postContent: any;
  public emojis: any = [];
  public comments: any;
  public fileType = "none";
  public profileRoute = false;
  public postLink = "";
  public userLink = "";
  public UserData = null;
  private latestComment: any;
  public postDate = "";
  public commentsCount = 0;
  public likesCount = 0;
  public disLikesCount = 0;
  public PostLiked = false;
  public PostDisLiked = false;
  public postLikedClass = "btn text-green";
  public postDisLikedClass = "btn text-red";
  public chatStatusClasses: any;
  public videoControls = false;
  public Settings: any = null;
  public Configurations: any;
  constructor(private router: Router, private _appService: AppService, private _notificationsService: NotificationsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this.Settings = this._appService.getlocalsettings();
    this.postLink = "/post/" + this.post["_id"];
    this.userLink = "/" + this.post["Users"][0]["Email"].split("@")[0];
    this.comments = this.post["Comments"];
    this.postDate = this._appService.convertDateTimeToWord(this.post["CreateDateTime"], this.post["DateTimeNow"]);
    this.commentsCount = this.post["CommentsCount"];
    this.likesCount = this.post["LikesCount"];
    this.disLikesCount = this.post["DislikesCount"];
    this.postLikedClass = this.post["PostLiked"] ? "btn text-blue" : "btn text-green";
    this.postDisLikedClass = this.post["PostDisLiked"] ? "btn text-blue" : "btn text-red";
    this.PostLiked = this.post["PostLiked"];
    this.PostDisLiked = this.post["PostDisLiked"];
    this.profileRoute = this.router.url.endsWith("/timeline");
    this.chatStatusClasses = { 'led-silver-global': this.post['Users'][0]['ChatStatus'] == 'offline', 'led-green-global': this.post['Users'][0]['ChatStatus'] == 'available', 'led-red-global': this.post['Users'][0]['ChatStatus'] == 'busy', 'led-yellow-global': this.post['Users'][0]['ChatStatus'] == 'away' };
    this.chatStatusClasses[this.post['Users'][0]['_id']] = true;

    if (this.post["Users"][0]["ProfilePic"] == null)
      this.post["Users"][0]["ProfilePic"] = {
        _id: "none",
        FileName: "",
        UserID: this.post["Users"][0]["_id"],
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
    if (this.post["Users"][0]["ProfileCoverPic"] == null)
      this.post["Users"][0]["ProfileCoverPic"] = {
        _id: "none",
        FileName: "",
        UserID: this.post["Users"][0]["_id"],
        FileType: "image",
        UploadDateTime: new Date(),
        FileBaseUrls: ["assets/images/image_placeholder.jpg"]
      };
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
  ngAfterViewInit() {
    this.postContent.nativeElement.innerHTML = this.post["PostContent"];
  }
  submitWithEnter(event, textarea, sumbitbutton) {
    if (this.Settings != null) {
      if (this.Settings.find(s => s.Name == "SUBMIT_PUBLISHED_CHALLENGED_COMMENT_WITH_ENTER").Value) {
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
      formData.append("CommentContent", textarea.innerHTML);
      formData.append("File", fileInput.files[0]);
      formData.append("FileType", this.fileType);
      formData.append("UserID", this.UserData["_id"]);
      formData.append("PostID", this.post["_id"]);
      filePreviewImg.style.display = "none";
      filePreviewVid.style.display = "none";
      let comment = {
        _id: "temp-" + this.post["_id"] + "-" + this.commentsCount,
        PostID: this.post["_id"],
        CommentContent: textarea.innerHTML,
        FileType: this.fileType,
        UserID: this.UserData["_id"],
        CreateDateTime: new Date(),
        DateTimeNow: new Date(),
        Files: fileInput.files.length == 0 ? [] : [{
          _id: "temp-file-" + this.post["_id"] + "-" + this.commentsCount,
          FileName: "none",
          UserID: this.UserData["_id"],
          FileType: this.fileType,
          UploadDateTime: new Date(),
          FileBaseUrls: [window.URL.createObjectURL(fileInput.files[0])]
        }],
        Users: [this.UserData]
      };
      this.comments = [];
      setTimeout(() => {
        this.comments = [comment];
      }, 5);
      this._appService.createComment(form, formData, "temp-" + this.post["_id"] + "-" + this.commentsCount, this.commentCallBack);
      this.commentsCount++;
      fileInput.value = "";
      this.fileType = "none";
      textarea.innerHTML = "";
      emojisRef.style.display = "none";
      this._notificationsService.updateChatStatus();
      let activity = {
        UserID: this.UserData["_id"],
        Content: "commented on a challenge",
        ActivityType: "POST_LIKE",
        _redirect: this.post["_id"]
      }
      this._appService.createactivity(activity).subscribe(data => { });
    }
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
  clearFileInput(filePreviewImg, filePreviewVid, fileInput) {
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    fileInput.value = "";
    this.fileType = "none";
  }
  like() {
    if (this.PostLiked) {
      this.likesCount--;
      this._appService.deletepostlike(this.post["_id"], this.UserData["_id"]);
      this.PostLiked = false;
      this.postLikedClass = "btn text-green";
      this.postDisLikedClass = "btn text-red";
    } else {
      this.likesCount++;
      this._appService.likepost(this.post["_id"], this.UserData["_id"]);
      this.PostLiked = true;
      this.postLikedClass = "btn text-blue";
      this.postDisLikedClass = "btn text-red";
      let activity = {
        UserID: this.UserData["_id"],
        Content: "liked a challenge",
        ActivityType: "POST_LIKE",
        _redirect: this.post["_id"]
      }
      this._appService.createactivity(activity).subscribe(data => { });
    }
    if (this.PostDisLiked) {
      this.disLikesCount--;
      this._appService.deletepostdislike(this.post["_id"], this.UserData["_id"]);
      this.PostDisLiked = false;
      this.postDisLikedClass = "btn text-red";
    }
    this._notificationsService.updateChatStatus();
  }
  dislike() {
    if (this.PostDisLiked) {
      this.disLikesCount--;
      this._appService.deletepostdislike(this.post["_id"], this.UserData["_id"]);
      this.PostDisLiked = false;
      this.postLikedClass = "btn text-green";
      this.postDisLikedClass = "btn text-red";
    } else {
      this.disLikesCount++;
      this._appService.dislikepost(this.post["_id"], this.UserData["_id"]);
      this.PostDisLiked = true;
      this.postLikedClass = "btn text-green";
      this.postDisLikedClass = "btn text-blue";
      let activity = {
        UserID: this.UserData["_id"],
        Content: "disliked a challenge",
        ActivityType: "POST_DISLIKE",
        _redirect: this.post["_id"]
      }
      this._appService.createactivity(activity).subscribe(data => { });
    }
    if (this.PostLiked) {
      this.likesCount--;
      this._appService.deletepostlike(this.post["_id"], this.UserData["_id"]);
      this.PostLiked = false;
      this.postLikedClass = "btn text-green";
    }
    this._notificationsService.updateChatStatus();
  }
  deletePost(_id) {
    this._appService.deletepost(_id).subscribe(data => {
      this.parentApi.callParentMethod("RETRIEVE_POSTS");
      this.toastr.warning("", "Challenge deleted successfully.");
    });
    this.parentApi.callParentMethod("INITIALIZE_POSTS");
  }
  commentCallBack = (data: any, id: any): any => {
    setTimeout(() => {
      let elementHtml = document.getElementById(id) as HTMLElement;
      let elementHtmlDel = document.getElementById(id + '-del') as HTMLElement;
      if (elementHtml != null)
        elementHtml.style.display = "none";
      if (elementHtmlDel != null)
        elementHtmlDel.style.display = "block";
    }, 500);
  }
}
