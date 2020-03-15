import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-post",
  templateUrl: "./post.component.html",
  styleUrls: ["./post.component.css"]
})
export class PostComponent implements OnInit {
  @Input("post") post: any;
  public comments: any;
  public fileType = "none";
  public profileRoute = false;
  public postLink = "";
  private UserData = null;
  private latestComment: any;
  public postDate = "";
  public commentsCount = 0;
  public likesCount = 0;
  public disLikesCount = 0;
  constructor(private router: Router, private _appService: AppService) {}

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this.postLink = "/post/" + this.post["_id"];
    this.comments = this.post["Comments"];
    this.postDate = this._appService.convertDateTimeToWord(
      this.post["CreateDateTime"],
      this.post["DateTimeNow"]
    );
    this.commentsCount = this.post["CommentsCount"];
    this.likesCount = this.post["DislikesCount"];
    this.disLikesCount = this.post["LikesCount"];
    this.profileRoute = this.router.url.includes("/profile");
  }
  createComment(form: NgForm, filePreviewImg, fileInput, filePreviewVid) {
    let formData = new FormData();
    formData.append("CommentContent", form.value["CommentContent"]);
    formData.append("File", fileInput.files[0]);
    formData.append("FileType", this.fileType);
    formData.append("UserID", this.UserData["_id"]);
    formData.append("PostID", this.post["_id"]);
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    this._appService.createComment(form, formData);
    setTimeout(() => {
      this.latestComment = setInterval(() => {
        this._appService
          .retrievecommentlatest(this.post["_id"],this.comments.length == 0 ? "" : this.comments[0]["_id"])
          .subscribe(data => {
            console.log(data);
            if (data != null) {
              this.commentsCount++;
              this.comments = [];
              this.comments.push(data);
              if (this.latestComment) {
                clearInterval(this.latestComment);
              }
            }
          });
      }, 1000);
    }, 500);
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
  like(){
    alert("hello world");
  }
  dislike(){
        alert("hello world 2");
  }
}
