import { Component, OnInit } from "@angular/core";
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
  public comments: any;
  private UserData = null;

  constructor(private route: ActivatedRoute, private _appService: AppService) {}

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this._appService
      .retrievepost(this.route.snapshot.paramMap.get("id"))
      .subscribe(data => {
        this.post = data;
        if (this.post["Files"].length > 0)
          this.fileType = this.post["Files"][0]["FileType"];
        this.postLoaded = true;
      });
  }
  createComment(form: NgForm, filePreviewImg, fileInput, filePreviewVid) {
    let formData = new FormData();
    formData.append("CommentContent", form.value["CommentContent"]);
    formData.append("File", fileInput.files[0]);
    formData.append("FileType", this.fileType);
    formData.append("UserID", this.UserData["_id"]);
    formData.append("PostID",this.route.snapshot.paramMap.get("id"));
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    this._appService.createComment(form, formData);
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
