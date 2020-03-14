import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
@Component({
  selector: "app-post",
  templateUrl: "./post.component.html",
  styleUrls: ["./post.component.css"]
})
export class PostComponent implements OnInit {
  @Input("post") post: string;
  public fileType = "none";
  public profileRoute = false;
  public postLink = "";
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.postLink = "/post/" + this.post["_id"];
    if (this.post["Files"].length > 0)
      this.fileType = this.post["Files"][0]["FileType"];
    this.profileRoute = this.router.url.includes("/profile");
  }
}
