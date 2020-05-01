import { Component, OnInit, Input } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-create-post",
  templateUrl: "./create-post.component.html",
  styleUrls: ["./create-post.component.css"]
})
export class CreatePostComponent implements OnInit {
  @Input("UserID") UserID: any;
  @Input("PostOnTimeline") PostOnTimeline: any;
  @Input("TimelineUserID") TimelineUserID: any;
  public PostText = "Create a challenge";
  private fileType = "none";
  private UserData = null;
  public Configurations: any;
  public emojis: any = [];
  constructor(public route: ActivatedRoute, private _appService: AppService, public router: Router, private _notificationsService: NotificationsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
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
  createPost(form: NgForm, filePreviewImg, fileInput, createPostSpinnerRef, filePreviewVid, textarea, emojisRef) {
    if (fileInput.files.length == 0)
      this.fileType = "none";
    filePreviewImg.style.display = "none";
    filePreviewVid.style.display = "none";
    if (textarea.innerHTML != "" || fileInput.files.length > 0) {
      let formData = new FormData();
      formData.append("PostContent", textarea.innerHTML);
      formData.append("File", fileInput.files[0]);
      formData.append("FileType", this.fileType);
      formData.append("UserID", this.UserID);
      formData.append("TimelineUserID", this.TimelineUserID);
      formData.append("PostOnTimeline", this.PostOnTimeline);
      createPostSpinnerRef.style.display = "block";
      this._appService.createPost(form, formData, createPostSpinnerRef, this.filesUploadCallBack);
      this._notificationsService.updateChatStatus();
      textarea.innerHTML = "";
      emojisRef.style.display = "none";
      fileInput.value = "";
    }

  }
  filesUploadCallBack = (result, createPostSpinnerRef): void => {
    this.toastr.info("", "Challenge published successfully.");
    if (this.PostOnTimeline == "true") {
      this.router.navigate(["/" + this.route.parent.snapshot.paramMap.get("id") + "/about"]);
      let element = document.getElementsByClassName("spinner-wrapper-parent").item(0) as HTMLElement;
      element.style.display = "block";
      setTimeout(() => {
        this.router.navigate(["/" + this.route.parent.snapshot.paramMap.get("id") + "/timeline"]);
        setTimeout(() => {
          element.style.display = "none";
        }, 1000);
      }, 5);
    }
    setTimeout(() => {
      createPostSpinnerRef.style.display = "none";
    }, 1000);
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
}
