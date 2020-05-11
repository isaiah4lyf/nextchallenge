import { HostListener, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  public UserData: any;
  public GalleryFiles: any;
  public GalleryFilesTemp: any;
  public filesRequested = true;
  public lastFileID: any;
  public deleteImageButton = false;
  constructor(private _appService: AppService, private router: Router, public route: ActivatedRoute, private _notificationsService: NotificationsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this.deleteImageButton = this.UserData["Email"].split("@")[0] == this.route.parent.snapshot.paramMap.get("id")
      if (this.UserData["Email"].split("@")[0] == this.route.parent.snapshot.paramMap.get("id")) {
        if (this.UserData != null) {
          this._appService.retrievegalleryfiles(this.UserData["_id"]).subscribe(data => {
            this.GalleryFiles = data;
            if (this.GalleryFiles.length > 0) {
              this.lastFileID = data[this.GalleryFiles.length - 1]["_id"];
              this.filesRequested = false;
            }
          });
        }
      } else {
        this._appService.retrieveUserDataWithName(this.route.parent.snapshot.paramMap.get("id"), this.UserData["Email"].split("@")[0]).subscribe(data => {
          if (data == null) {
            this.router.navigate(["/home"]);
          } else {
            this.UserData = data;
            if (this.UserData != null) {
              this._appService.retrievegalleryfiles(this.UserData["_id"]).subscribe(data => {
                this.GalleryFiles = data;
                if (this.GalleryFiles.length > 0) {
                  this.lastFileID = data[this.GalleryFiles.length - 1]["_id"];
                  this.filesRequested = false;
                }
              });
            }
          }
        });
      }
      this._notificationsService.updateChatStatus();
    }
  }
  @HostListener("window:scroll", ["$event"])
  scrolled(event): void {
    if ($(window).scrollTop() + $(window).height() + 150 > $(document).height() && this.lastFileID != null && !this.filesRequested) {
      this.filesRequested = true;
      this._appService.retrievegalleryfilesafter(this.UserData["_id"], this.lastFileID).subscribe(data => {
        this.GalleryFilesTemp = data;
        this.GalleryFilesTemp.forEach(element => {
          this.GalleryFiles.push(element);
        });
        if (this.GalleryFilesTemp.length > 3) {
          this.lastFileID = data[this.GalleryFilesTemp.length - 1]["_id"];
          this.filesRequested = false;
        }
      });
      this._notificationsService.updateChatStatus();
    }
  }
  deleteFile(fileid) {
    this.GalleryFiles.splice(this.GalleryFiles.indexOf(this.GalleryFiles.find(s => s._id == fileid)), 1);
    this._appService.deletefile(fileid).subscribe(data => {
      this.toastr.warning("", "File deleted successfully.");
      this._appService.retrievelogonupdate(this.UserData["_id"]).subscribe(data => {
        this._appService.setUserData(data);
      });
    });
  }
  playVid(vid, player) {
    let elementHtml = document.getElementById(vid) as HTMLMediaElement;
    elementHtml.play();
    player.style.display = "none";
  }
}
