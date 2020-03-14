import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AppService } from "../.././services/app.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-create-post",
  templateUrl: "./create-post.component.html",
  styleUrls: ["./create-post.component.css"]
})
export class CreatePostComponent implements OnInit {
  private fileType = "none";
  private UserData = null;
  constructor(private _appService: AppService) {}

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
  }
  createPost(
    form: NgForm,
    filePreviewImg,
    fileInput,
    createPostSpinnerRef,
    filePreviewVid
  ) {
    let formData = new FormData();
    formData.append("PostContent", form.value["PostContent"]);
    formData.append("File", fileInput.files[0]);
    formData.append("FileType", this.fileType);
    formData.append("UserID", this.UserData["_id"]);
    createPostSpinnerRef.style.display = "block";
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    this._appService.createPost(form, formData, createPostSpinnerRef);
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
