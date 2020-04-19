import { Component, OnInit } from '@angular/core';
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: 'app-buy-attempts',
  templateUrl: './buy-attempts.component.html',
  styleUrls: ['./buy-attempts.component.css']
})
export class BuyAttemptsComponent implements OnInit {
  public UserData: any;
  public CurrentPurchaseId = "";
  public AttemptsPrices: any = [];
  public Configurations: any;
  public ReturnUrl: string = "";
  public NotifyUrl: string = "";
  public CancelURL: string = "";
  public MerchantId: string = "";
  public MerchantKey: string = "";
  public PayFastURL: string = "";

  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this.Configurations = this._appService.getconfigurations();
    if (this.UserData != null) {
      if (this.Configurations != null) {
        this.retrievePrices();
      }
      else {
        this._appService.retrieveconfigurations().subscribe(data => {
          this.Configurations = data;
          this.retrievePrices();
        });
      }
      this._notificationsService.updateChatStatus();
    }
  }
  retrievePrices() {
    this.NotifyUrl = this.Configurations.find(config => config.Name == "notify_url" && config.Group == "PAY_FAST_MERCHANT").Value;
    this.MerchantId = this.Configurations.find(config => config.Name == "merchant_id" && config.Group == "PAY_FAST_MERCHANT").Value;
    this.PayFastURL = this.Configurations.find(config => config.Name == "payfast_url" && config.Group == "PAY_FAST_MERCHANT").Value;
    this.MerchantKey = this.Configurations.find(config => config.Name == "merchant_key" && config.Group == "PAY_FAST_MERCHANT").Value;
    this.ReturnUrl = this.Configurations.find(config => config.Name == "PRIMARY_WEB_URL" && config.Group == "WEB_CONFIG").Value + '/processed/';
    this.CancelURL = this.Configurations.find(config => config.Name == "PRIMARY_WEB_URL" && config.Group == "WEB_CONFIG").Value + '/cancelled/';
    this._appService.retrieveattemptsprices().subscribe(data => {
      this.AttemptsPrices = data;
    });
  }
  createPurchase(createPurchaseSpinner, price, purchaseForm) {
    let purchase = {
      UserID: this.UserData["_id"],
      AttemptsPriceID: price["_id"],
      Status: "IN_PROGRESS"
    };
    createPurchaseSpinner.style.display = "block";
    this._appService.updateattemptpuchase(purchase).subscribe(data => {
      this.CurrentPurchaseId = data["_id"];
      setTimeout(() => {
        purchaseForm.submit();
      }, 1000);

    });
  }
}
