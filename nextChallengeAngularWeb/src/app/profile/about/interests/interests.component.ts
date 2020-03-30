import { Component, OnInit } from '@angular/core';
import { AppService } from "../../.././services/app.service";

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
  constructor(private _appService: AppService) { }

  ngOnInit(): void {
    this.UserData = this._appService.getUserData();
    this._appService.retrieveinterests(this.UserData["_id"]).subscribe(data => {
      this.MyInterestsTemp = data;
      this.MyInterestsTemp.forEach(element => {
        this.MyInterests.push(element);
      });
    });
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
      this._appService.createinterest(JSON.stringify(data)).subscribe(data => {});
    }
  }
  interestTextBoxChange(interestbox) {
    let data = [];
    this.CommonInterests.forEach(element => {
      if (element['InterestName'].toLowerCase().includes(interestbox.value.toLowerCase())) {
        data.push(element);
      }
    });
    this.CommonInterestsSearch = data;
  }
  selectInterest(interest, interestbox) {
    interestbox.value = interest['InterestName'];
    this.CommonInterestsSearch = [];
  }
  removeInterent(i) {
    this._appService.deleteinterest(this.MyInterests[i]["_id"]).subscribe(data => {console.log(data);});
    this.MyInterests.splice(i, 1);
  }
}
