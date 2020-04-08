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
  public emojis = [
    "+1",
    "-1",
    "ant",
    "100",
    "stuck_out_tongue",
    "stuck_out_tongue_closed_eyes",
    "stuck_out_tongue_winking_eye",
    "sun_with_face",
    "sunflower",
    "sunglasses",
    "sunny",
    "sunrise",
    "surfer",
    "sushi",
    "suspect",
    "suspension_railway",
    "sweat",
    "sweat_drops",
    "sweat_smile",
    "sweet_potato",
    "swimmer",
    "symbols",
    "syringe",
    "tada",
    "tanabata_tree",
    "tangerine",
    "taurus"
  ];
  constructor(private _appService: AppService) {}

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
  }
  createPost(
    form: NgForm,
    filePreviewImg,
    fileInput,
    createPostSpinnerRef,
    filePreviewVid,
    textarea
  ) {
    let formData = new FormData();
    formData.append("PostContent", textarea.innerHTML);
    formData.append("File", fileInput.files[0]);
    formData.append("FileType", this.fileType);
    formData.append("UserID", this.UserData["_id"]);
    createPostSpinnerRef.style.display = "block";
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    this._appService.createPost(form, formData, createPostSpinnerRef);
  }
  emojiClick(textarea, emoji) {
    textarea.innerHTML +=
      '<img class="message-emoji" src="assets/css/emoji/' +
      emoji +
      '.png" />';
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
