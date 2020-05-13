import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: 'app-prizes',
  templateUrl: './prizes.component.html',
  styleUrls: ['./prizes.component.css']
})
export class PrizesComponent implements OnInit {
  private UserData: any;
  public prizeMethod = 0;
  public Prizes: any = [];
  public updateSpinner = false;
  public PrizeDetails: any = null;
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._notificationsService.updateChatStatus();
      this._appService.retrieveprizes(this.UserData["_id"]).subscribe(data => {
        this.Prizes = data["Prizes"];
        this.PrizeDetails = data["PrizeDetatils"];
        this.prizeMethod = this.PrizeDetails.PrizeMethod;
      });
    }
  }
  submitDetailsBankAccount(Details) {
    this.updateSpinner = true;
    this.PrizeDetails.PrizeMethod = this.prizeMethod;
    this.PrizeDetails.BankAccount = Details.value.account_number;
    this.PrizeDetails.Bank = Details.value.bank;
    this.PrizeDetails.BranchCode = Details.value.branch_code;
    this._appService.updatedetailprize(this.PrizeDetails).subscribe(data => {
      setTimeout(() => {
        this.updateSpinner = false;
      }, 400);
    });
  }
  submitDetailseWallet(Details) {
    this.updateSpinner = true;
    this.PrizeDetails.PrizeMethod = this.prizeMethod;
    this.PrizeDetails.eWalletPhone = Details.value.SA_Cell_phone;
    this._appService.updatedetailprize(this.PrizeDetails).subscribe(data => {
      setTimeout(() => {
        this.updateSpinner = false;
      }, 400);
    });
  }
  submitDetailsInstantMoney(Details) {
    this.updateSpinner = true;
    this.PrizeDetails.PrizeMethod = this.prizeMethod;
    this.PrizeDetails.PhoneEmail = Details.value.phone_email;
    this._appService.updatedetailprize(this.PrizeDetails).subscribe(data => {
      setTimeout(() => {
        this.updateSpinner = false;
      }, 400);
    });
  }
  submitDetailsAirtime(Details) {
    this.updateSpinner = true;
    this.PrizeDetails.PrizeMethod = this.prizeMethod;
    this.PrizeDetails.Phone = Details.value.number;
    this.PrizeDetails.Network = Details.value.network;
    this._appService.updatedetailprize(this.PrizeDetails).subscribe(data => {
      setTimeout(() => {
        this.updateSpinner = false;
      }, 400);
    });
  }
  methodChange(methodInput) {
    this.prizeMethod = methodInput.value;
  }
}
