import { Component, OnInit, Input } from "@angular/core";
import { AppService } from "../../.././services/app.service";

@Component({
  selector: "app-comment",
  templateUrl: "./comment.component.html",
  styleUrls: ["./comment.component.css"]
})
export class CommentComponent implements OnInit {
  @Input("comment") comment: any;
  public commentDate = "";
  constructor(private _appService: AppService) {}

  ngOnInit(): void {
    this.commentDate = this._appService.convertDateTimeToWord(this.comment["CreateDateTime"],this.comment["DateTimeNow"]);
  }
  ngOnChanges() {
    // create header using child_id
    this.commentDate = this._appService.convertDateTimeToWord(this.comment["CreateDateTime"],this.comment["DateTimeNow"]);
  }
}
