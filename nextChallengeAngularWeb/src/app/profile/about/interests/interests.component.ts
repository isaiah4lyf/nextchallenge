import { Component, OnInit } from '@angular/core';
import { AppService } from "../../.././services/app.service";
import { NotificationsService } from "../../.././services/notifications.service";

@Component({
  selector: 'app-interests',
  templateUrl: './interests.component.html',
  styleUrls: ['./interests.component.css']
})
export class InterestsComponent implements OnInit {
  public UserData: any;
  public MyInterests = [];
  public MyInterestsTemp: any;
  public CommonInterests = [
    {
      InterestName: 'photgraphy',
      IconName: 'icon ion-ios-camera'
    },
    {
      InterestName: 'shopping',
      IconName: 'icon ion-android-cart'
    },
    {
      InterestName: 'traveling',
      IconName: 'icon ion-android-plane'
    },
    {
      InterestName: 'Eating',
      IconName: 'icon ion-android-restaurant'
    }
  ];
  public CommonInterestsSearch = [];
  constructor(private _appService: AppService, private _notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    if (this.UserData != null) {
      this._appService.retrieveinterests(this.UserData["_id"]).subscribe(data => {
        this.MyInterestsTemp = data;
        this.MyInterestsTemp.forEach(element => {
          this.MyInterests.push(element);
        });
      });
      this._notificationsService.updateChatStatus();
    }
  }
  addInterest(interestbox) {
    if (interestbox.value != "") {
      let data = {
        InterestName: interestbox.value,
        IconName: 'icon ion-ios-heart-outline'
      };
      this.CommonInterests.forEach(element => {
        if (element['InterestName'].toLowerCase() == interestbox.value.toLowerCase()) {
          data = element;
        }
      });
      if (!this.MyInterests.some(e => e.InterestName === data.InterestName))
        this.MyInterests.push(data);
      interestbox.value = "";
      data["UserID"] = this.UserData["_id"]
      this._appService.createinterest(JSON.stringify(data)).subscribe(data => { });
    }
    this._notificationsService.updateChatStatus();
  }
  interestTextBoxChange(interestbox) {
    let data = [];
    this.CommonInterests.forEach(element => {
      if (element['InterestName'].toLowerCase().includes(interestbox.value.toLowerCase())) {
        data.push(element);
      }
    });
    this.CommonInterestsSearch = data;
    this._notificationsService.updateChatStatus();
  }
  selectInterest(interest, interestbox) {
    interestbox.value = interest['InterestName'];
    this.CommonInterestsSearch = [];
    this._notificationsService.updateChatStatus();
  }
  removeInterent(i) {
    this._appService.deleteinterest(this.MyInterests[i]["_id"]).subscribe(data => { console.log(data); });
    this.MyInterests.splice(i, 1);
    this._notificationsService.updateChatStatus();
  }
}
