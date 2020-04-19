import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-post-view",
  templateUrl: "./post-view.component.html",
  styleUrls: ["./post-view.component.css"]
})
export class PostViewComponent implements OnInit {
  @ViewChild("postContent") postContent: any;
  public emojis = ["+1", "-1", "ant", "100"];
  public post: any;
  public fileType = "none";
  public postLink = "";
  public postLoaded = false;
  public comments = null;
  private UserData = null;
  private latestPostCheck: any;
  private topCommentId = "none";
  private commentsTemp: any;
  public postDate = "";
  public commentsCount = 0;
  public likesCount = 0;
  public disLikesCount = 0;
  public PostLiked = false;
  public PostDisLiked = false;
  public postLikedClass = "btn text-green";
  public postDisLikedClass = "btn text-red";

  public commentsTempScroll: any;
  public lastCommentID: string;
  public commentsRequested = true;
  public chatStatusClasses: any;
  constructor(private route: ActivatedRoute, private _appService: AppService, private _notificationsService: NotificationsService, private router: Router) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrievepost(this.route.snapshot.paramMap.get("id"), this.UserData["_id"]).subscribe(data => {
        this.post = data;
        if (this.post == null) {
          this.router.navigate(["/home"]);
        }
        else {
          this.postLoaded = true;
          this.postDate = this._appService.convertDateTimeToWord(this.post["CreateDateTime"], this.post["DateTimeNow"]);
          this.commentsCount = this.post["CommentsCount"];
          this.likesCount = this.post["LikesCount"];
          this.disLikesCount = this.post["DislikesCount"];
          this.postLikedClass = this.post["PostLiked"] ? "btn text-blue" : "btn text-green";
          this.postDisLikedClass = this.post["PostDisLiked"] ? "btn text-blue" : "btn text-red";
          this.PostLiked = this.post["PostLiked"];
          this.PostDisLiked = this.post["PostDisLiked"];
          setTimeout(() => {
            this.postContent.nativeElement.innerHTML = this.post["PostContent"];
          }, 100);
          this.chatStatusClasses = { 'led-silver-global': this.post['Users'][0]['ChatStatus'] == 'offline', 'led-green-global': this.post['Users'][0]['ChatStatus'] == 'available', 'led-red-global': this.post['Users'][0]['ChatStatus'] == 'busy', 'led-yellow-global': this.post['Users'][0]['ChatStatus'] == 'away' };
          this.chatStatusClasses[this.post['Users'][0]['_id']] = true;
          this._appService.retrievecomments(this.route.snapshot.paramMap.get("id")).subscribe(data => {
            this.comments = data;
            if (this.comments.length > 0) {
              this.topCommentId = this.comments[0]["_id"];
              this.lastCommentID = this.comments[this.comments.length - 1]["_id"];
            }
            this.commentsRequested = false;
          });
        }
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
      });
      this._notificationsService.updateChatStatus();
    }
  }
  ngOnDestroy() {
    if (this.latestPostCheck) {
      clearInterval(this.latestPostCheck);
    }
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() + $(window).height() + 150 > $(document).height() && this.lastCommentID != null && !this.commentsRequested) {
      this.commentsRequested = true;
      this._appService.retrievecommentsafter(this.lastCommentID, this.route.snapshot.paramMap.get("id")).subscribe(data => {
        this.commentsTempScroll = data;
        this.commentsTempScroll.forEach(element => {
          this.comments.push(element);
        });
        if (this.commentsTempScroll.length > 3) {
          this.lastCommentID = this.commentsTempScroll[this.commentsTempScroll.length - 1]["_id"];
          this.commentsRequested = false;
        }
      });
      this._notificationsService.updateChatStatus();
    }
  }
  submitWithEnter(event, textarea, sumbitbutton) {
    event.preventDefault();
    sumbitbutton.click();
  }
  createMessage(form: NgForm, filePreviewImg, fileInput, filePreviewVid, textarea, emojisRef) {
    let formData = new FormData();
    formData.append("CommentContent", textarea.innerHTML);
    formData.append("File", fileInput.files[0]);
    formData.append("FileType", this.fileType);
    formData.append("UserID", this.UserData["_id"]);
    formData.append("PostID", this.route.snapshot.paramMap.get("id"));
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    let comment = {
      _id: "temp-" + this.route.snapshot.paramMap.get("id") + "-" + this.commentsCount,
      PostID: this.route.snapshot.paramMap.get("id"),
      CommentContent: textarea.innerHTML,
      FileType: this.fileType,
      UserID: this.UserData["_id"],
      CreateDateTime: new Date(),
      DateTimeNow: new Date(),
      Files: fileInput.files.length == 0 ? [] : [{
        _id: "temp-file-" + this.route.snapshot.paramMap.get("id") + "-" + this.commentsCount,
        FileName: "none",
        UserID: this.UserData["_id"],
        FileType: this.fileType,
        UploadDateTime: new Date(),
        FileBaseUrls: [window.URL.createObjectURL(fileInput.files[0])]
      }],
      Users: [this.UserData]
    };
    this.comments.unshift(comment);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
    this._appService.createComment(form, formData, "temp-" + this.route.snapshot.paramMap.get("id") + "-" + this.commentsCount);
    this.commentsCount++;
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
    }
    if (this.PostDisLiked) {
      this.disLikesCount--;
      this._appService.deletepostdislike(this.post["_id"], this.UserData["_id"]
      );
      this.PostDisLiked = false;
      this.postDisLikedClass = "btn text-red";
    }
    this._notificationsService.updateChatStatus();
  }
  dislike() {
    if (this.PostDisLiked) {
      this.disLikesCount--;
      this._appService.deletepostdislike(
        this.post["_id"],
        this.UserData["_id"]
      );
      this.PostDisLiked = false;
      this.postLikedClass = "btn text-green";
      this.postDisLikedClass = "btn text-red";
    } else {
      this.disLikesCount++;
      this._appService.dislikepost(this.post["_id"], this.UserData["_id"]);
      this.PostDisLiked = true;
      this.postLikedClass = "btn text-green";
      this.postDisLikedClass = "btn text-blue";
    }
    if (this.PostLiked) {
      this.likesCount--;
      this._appService.deletepostlike(this.post["_id"], this.UserData["_id"]);
      this.PostLiked = false;
      this.postLikedClass = "btn text-green";
    }
    this._notificationsService.updateChatStatus();
  }
}
