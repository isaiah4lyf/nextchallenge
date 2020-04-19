import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from "@angular/router";
import { AppService } from "../.././services/app.service";
import { NotificationsService } from "../.././services/notifications.service";

@Component({
  selector: 'app-complete-buy',
  templateUrl: './complete-buy.component.html',
  styleUrls: ['./complete-buy.component.css']
})
export class CompleteBuyComponent implements OnInit {
  public UserData: any;
  public CurrentPurchaseId = "";
  public Configurations: any;
  public ReturnUrl: string = "";
  public NotifyUrl: string = "";
  public CancelURL: string = "";
  public MerchantId: string = "";
  public MerchantKey: string = "";
  public PayFastURL: string = "";
  public AttemptsPurchaseData: any;
  public DataLoaded = false;
  public DateTime: any = "";
  public NewAttempts: any = 0;
  constructor(private route: ActivatedRoute, private _appService: AppService, private _notificationsService: NotificationsService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrieveattemptpuchase(this.route.snapshot.paramMap.get("id")).subscribe(data => {
        this._appService.retrieveattemptscount(this.UserData["_id"]).subscribe(data => {
          this.NewAttempts = data;
          let elementHtml = document.getElementById("attempts-element") as HTMLElement;
          setTimeout(() => {
            if (data > this.UserData["Attempts"]) {
              if (elementHtml != null) elementHtml.innerText = " " + data + " attempts";
              let newUserData = this.UserData["Attempts"];
              this._appService.setUserData(newUserData);
                  this.toastr.info("You have purchased " + ( this.NewAttempts - this.UserData["Attempts"]) + " attempts.", "Purchase successful!");
            }
          }, 1000);
        });
        this.AttemptsPurchaseData = data;
        this.DateTime = new Date(this.AttemptsPurchaseData['PurchaseDateTime']).toLocaleString();
        if (this.AttemptsPurchaseData == null) {
          this.router.navigate(["/buy"]);
        }
        else {
          if (this.Configurations != null) {
            this.setupFormData();
          }
          else {
            this._appService.retrieveconfigurations().subscribe(data => {
              this.Configurations = data;
              this.setupFormData();
            });
          }
        }
      });
      this._notificationsService.updateChatStatus();
    }
  }
  setupFormData() {
    this.NotifyUrl = this.Configurations.find(config => config.Name == "notify_url" && config.Group == "PAY_FAST_MERCHANT").Value;
    this.MerchantId = this.Configurations.find(config => config.Name == "merchant_id" && config.Group == "PAY_FAST_MERCHANT").Value;
    this.PayFastURL = this.Configurations.find(config => config.Name == "payfast_url" && config.Group == "PAY_FAST_MERCHANT").Value;
    this.MerchantKey = this.Configurations.find(config => config.Name == "merchant_key" && config.Group == "PAY_FAST_MERCHANT").Value;
    this.ReturnUrl = this.Configurations.find(config => config.Name == "PRIMARY_WEB_URL" && config.Group == "WEB_CONFIG").Value + '/processed/';
    this.CancelURL = this.Configurations.find(config => config.Name == "PRIMARY_WEB_URL" && config.Group == "WEB_CONFIG").Value + '/cancelled/';
    this.DataLoaded = true;
  }
  createPurchase(createPurchaseSpinner, purchaseForm) {
    let purchase = {
      UserID: this.UserData["_id"],
      AttemptsPriceID: this.AttemptsPurchaseData["Prices"][0]["_id"],
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
  backButton() {
    this.router.navigate(["/buy"]);
  }
}
