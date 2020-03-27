import { Component, OnInit, Input } from "@angular/core";
import { AppService } from "../../.././services/app.service";

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.css"]
})
export class MessageComponent implements OnInit {
  @Input("message") message: any;
  public UserData: any;
  constructor(private _appService: AppService) {}

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
  }
}
