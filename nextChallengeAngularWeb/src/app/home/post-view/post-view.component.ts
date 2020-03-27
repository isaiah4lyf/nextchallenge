import { Component, OnInit, HostListener } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-post-view",
  templateUrl: "./post-view.component.html",
  styleUrls: ["./post-view.component.css"]
})
export class PostViewComponent implements OnInit {
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

  constructor(private route: ActivatedRoute, private _appService: AppService) {}

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this._appService
      .retrievepost(
        this.route.snapshot.paramMap.get("id"),
        this.UserData["_id"]
      )
      .subscribe(data => {
        this.post = data;
        this.postLoaded = true;
        this.postDate = this._appService.convertDateTimeToWord(
          this.post["CreateDateTime"],
          this.post["DateTimeNow"]
        );
        this.commentsCount = this.post["CommentsCount"];
        this.likesCount = this.post["LikesCount"];
        this.disLikesCount = this.post["DislikesCount"];
        this.postLikedClass = this.post["PostLiked"]
          ? "btn text-blue"
          : "btn text-green";
        this.postDisLikedClass = this.post["PostDisLiked"]
          ? "btn text-blue"
          : "btn text-red";
        this.PostLiked = this.post["PostLiked"];
        this.PostDisLiked = this.post["PostDisLiked"];
      });
    this._appService
      .retrievecomments(this.route.snapshot.paramMap.get("id"))
      .subscribe(data => {
        this.comments = data;
        if (this.comments.length > 0) {
          this.topCommentId = this.comments[0]["_id"];
          this.lastCommentID = this.comments[this.comments.length - 1]["_id"];
        }
        this.commentsRequested = false;
        this.latestPostCheck = setInterval(() => {
          this._appService
            .retrievecommentslatest(
              this.topCommentId,
              this.route.snapshot.paramMap.get("id")
            )
            .subscribe(data => {
              console.log(data);
              this.commentsTemp = data;
              this.commentsTemp.forEach(element => {
                this.comments.unshift(element);
              });
              if (this.commentsTemp.length > 0)
                this.topCommentId = this.commentsTemp[0]["_id"];
            });
        }, 2000);
      });
  }
  ngOnDestroy() {
    if (this.latestPostCheck) {
      clearInterval(this.latestPostCheck);
    }
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if (
      $(window).scrollTop() + $(window).height() + 150 > $(document).height() &&
      this.lastCommentID != null &&
      !this.commentsRequested
    ) {
      this.commentsRequested = true;
      this._appService
        .retrievecommentsafter(
          this.lastCommentID,
          this.route.snapshot.paramMap.get("id")
        )
        .subscribe(data => {
          this.commentsTempScroll = data;
          this.commentsTempScroll.forEach(element => {
            this.comments.push(element);
          });
          if (this.commentsTempScroll.length > 3) {
            this.lastCommentID =
              this.commentsTempScroll[this.commentsTempScroll.length - 1]["_id"];
            this.commentsRequested = false;
          }
        });
    }
  }
  createComment(form: NgForm, filePreviewImg, fileInput, filePreviewVid) {
    let formData = new FormData();
    formData.append("CommentContent", form.value["CommentContent"]);
    formData.append("File", fileInput.files[0]);
    formData.append("FileType", this.fileType);
    formData.append("UserID", this.UserData["_id"]);
    formData.append("PostID", this.route.snapshot.paramMap.get("id"));
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    this._appService.createComment(form, formData);
    this.commentsCount++;
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
      this._appService.deletepostdislike(
        this.post["_id"],
        this.UserData["_id"]
      );
      this.PostDisLiked = false;
      this.postDisLikedClass = "btn text-red";
    }
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
  }
}
