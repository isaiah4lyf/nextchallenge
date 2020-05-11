import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";
import { NgForm } from "@angular/forms";
import { Observable } from 'rxjs-observable';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: "root"
})
export class AppService {
  private configUrl = "http://www.nextchallenge.co.za/api/api/index/";
  //private configUrl = "http://localhost:44357/api/index/";
  private httpOptions = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };
  private httpOptionsMultipart = { headers: new HttpHeaders({ "Content-Type": "multipart/form-data; boundary=--------------------------654287500409823045608277" }) };
  private UserData = null;
  private UserViewData = null;
  private SessionContentGlobal: any;
  private Configurations: any = null;
  private Settings: any = null;
  public UserDataObservable = new BehaviorSubject(null);
  constructor(private router: Router, private http: HttpClient) { }

  setconfigurations(Configurations) {
    this.Configurations = Configurations;
    if (sessionStorage.getItem("logon") != "" && sessionStorage.getItem("logon") != null && sessionStorage.getItem("logon") != "null") {
      sessionStorage.setItem("configurations", JSON.stringify(Configurations));
    }
    else {
      localStorage.setItem("configurations", JSON.stringify(Configurations));
    }
  }
  getconfigurations() {
    if (this.Configurations == null) {
      if (sessionStorage.getItem("configurations") != "" && sessionStorage.getItem("configurations") != null && sessionStorage.getItem("configurations") != "null") {
        this.Configurations = JSON.parse(sessionStorage.getItem("configurations"));
      }
      else if (localStorage.getItem("configurations") != "" && localStorage.getItem("configurations") != null && localStorage.getItem("configurations") != "null") {
        this.Configurations = JSON.parse(localStorage.getItem("configurations"));
      }
    }
    return this.Configurations;
  }
  updateconfiguration(body) {
    return this.http.put(this.configUrl + "updateconfiguration", body, this.httpOptions);
  }
  retrieveconfigurations() {
    return this.http.get(this.configUrl + "retrieveconfigurations", this.httpOptions);
  }
  setSssionContents(SessionContents) {
    this.SessionContentGlobal = SessionContents;
  }
  getSssionContents() {
    return this.SessionContentGlobal;
  }
  login(form: NgForm) {
    return this.http.get(this.configUrl + "login?email=" + form.value.Email + "&password=" + form.value.Password);
  }
  retrievelogonupdate(userid) {
    return this.http.get(this.configUrl + "retrievelogonupdate?userid=" + userid, this.httpOptions);
  }
  logout() {
    this.setUserData(null);
    this.Settings = null;
    this.Configurations = null;
    localStorage.setItem("settings", JSON.stringify(null));
    sessionStorage.setItem("settings", JSON.stringify(null));
    localStorage.setItem("configurations", JSON.stringify(null));
    sessionStorage.setItem("configurations", JSON.stringify(null));
    this.router.navigate(["/login"]);
  }
  register(form: NgForm) {
    return this.http.post(this.configUrl + "createuser", JSON.stringify(form.value), this.httpOptions);
  }
  checkemail(email, userid) {
    return this.http.get(this.configUrl + "checkemail?email=" + email + "&userid=" + userid, this.httpOptions);
  }
  updatebasicinfo(form) {
    return this.http.post(this.configUrl + "updatebasicinfo", form, this.httpOptions);
  }
  updateprofilepic(form, callback) {
    this.http.post(this.configUrl + "updateprofilepic", form).subscribe(data => {
      callback(data);
    });
  }
  retrieveattemptscount(userid) {
    return this.http.get(this.configUrl + "retrieveattemptscount?userid=" + userid, this.httpOptions);
  }
  updateprofilecoverpic(form, callback) {
    this.http.post(this.configUrl + "updateprofilecoverpic", form).subscribe(data => {
      callback(data);
    });
  }
  updateschools(schools) {
    return this.http.post(this.configUrl + "updateschools", schools, this.httpOptions);
  }
  retrieveschools(userid) {
    return this.http.get(this.configUrl + "retrieveschools?userid=" + userid, this.httpOptions);
  }
  deleteschool(schoolid) {
    return this.http.delete(this.configUrl + "deleteschool?schoolid=" + schoolid, this.httpOptions);
  }
  updatecompanies(companies) {
    return this.http.post(this.configUrl + "updatecompanies", companies, this.httpOptions);
  }
  retrievecompanies(userid) {
    return this.http.get(this.configUrl + "retrievecompanies?userid=" + userid, this.httpOptions);
  }
  deletecompany(companyid) {
    return this.http.delete(this.configUrl + "deletecompany?companyid=" + companyid, this.httpOptions);
  }
  createinterest(interest) {
    return this.http.post(this.configUrl + "createinterest", interest, this.httpOptions);
  }
  retrieveinterests(userid) {
    return this.http.get(this.configUrl + "retrieveinterests?userid=" + userid, this.httpOptions);
  }
  deleteinterest(interestid) {
    return this.http.delete(this.configUrl + "deleteinterest?interestid=" + interestid, this.httpOptions);
  }
  retrieveabout(userid) {
    return this.http.get(this.configUrl + "retrieveabout?userid=" + userid, this.httpOptions);
  }
  setUserData(data) {
    if (data != null) {
      if (data["RememberMe"] != undefined) {
        if (data["RememberMe"]) {
          delete data.RememberMe;
          localStorage.setItem("logon", JSON.stringify(data));
        }
        else {
          delete data.RememberMe;
          sessionStorage.setItem("logon", JSON.stringify(data));
        }
      }
      else {
        if (sessionStorage.getItem("logon") != "" && sessionStorage.getItem("logon") != null && sessionStorage.getItem("logon") != "null") {
          sessionStorage.setItem("logon", JSON.stringify(data));
        }
        else {
          localStorage.setItem("logon", JSON.stringify(data));
        }
      }
      this.UserData = data;
    }
    else {
      this.UserData = data;
      localStorage.setItem("logon", JSON.stringify(data));
      sessionStorage.setItem("logon", JSON.stringify(data));
    }
    this.UserDataObservable.next(this.UserData);
  }
  getUserData() {
    if (this.UserData == null) {
      if (sessionStorage.getItem("logon") != "" && sessionStorage.getItem("logon") != null && sessionStorage.getItem("logon") != "null") {
        this.UserData = JSON.parse(sessionStorage.getItem("logon"));
      }
      else if (localStorage.getItem("logon") != "" && localStorage.getItem("logon") != null && localStorage.getItem("logon") != "null") {
        this.UserData = JSON.parse(localStorage.getItem("logon"));
      }
      else {
        this.router.navigate(["/login"]);
      }
    }
    if (this.UserData != null)
      if (this.UserData['ProfilePic'] == null)
        this.UserData['ProfilePic'] = {
          _id: "none",
          FileName: "",
          UserID: this.UserData['_id'],
          FileType: "image",
          UploadDateTime: new Date(),
          FileBaseUrls: ["assets/images/image_placeholder.jpg"]
        };
    if (this.UserData != null)
      if (this.UserData['ProfileCoverPic'] == null)
        this.UserData['ProfileCoverPic'] = {
          _id: "none",
          FileName: "",
          UserID: this.UserData['_id'],
          FileType: "image",
          UploadDateTime: new Date(),
          FileBaseUrls: ["assets/images/image_placeholder.jpg"]
        };
    return this.UserData;
  }
  retrieveUserDataWithName(name, viewername) {
    return this.http.get(this.configUrl + "retrieveuser?name=" + name + "&viewername=" + viewername, this.httpOptions);
  }
  getUserViewData(name) {
    if (this.UserViewData != null)
      return this.UserViewData;
    return this.UserViewData;
  }
  setUserViewData(userdata) {
    this.UserViewData = userdata;
  }
  createPost(form: NgForm, formData: FormData, createPostSpinnerRef, filesUploadCallBack) {
    this.http.post(this.configUrl + "createpost", formData).subscribe(data => {
      filesUploadCallBack(data, createPostSpinnerRef);
    });
  }
  deletepost(postid) {
    return this.http.delete(this.configUrl + "deletepost?postid=" + postid, this.httpOptions);
  }
  retrieveposts(userid) {
    return this.http.get(this.configUrl + "retrieveposts?userid=" + userid, this.httpOptions);
  }
  retrievepostsafter(lastPostId, userid) {
    return this.http.get(this.configUrl + "retrievepostsafter?postid=" + lastPostId + "&userid=" + userid, this.httpOptions);
  }
  retrievetimelineposts(userid, timelineuserid) {
    return this.http.get(this.configUrl + "retrievetimelineposts?userid=" + userid + "&timelineuserid=" + timelineuserid, this.httpOptions);
  }
  retrievetimelinepostsafter(lastPostId, userid, timelineuserid) {
    return this.http.get(this.configUrl + "retrievetimelinepostsafter?postid=" + lastPostId + "&userid=" + userid + "&timelineuserid=" + timelineuserid, this.httpOptions);
  }
  retrievepost(postid, userid) {
    return this.http.get(this.configUrl + "retrievepost?postid=" + postid + "&userid=" + userid, this.httpOptions);
  }
  createComment(form: NgForm, formData: FormData, id, callBackFun) {
    this.http.post(this.configUrl + "createcomment", formData).subscribe(data => {
      callBackFun(data, id);
    });
  }
  deletecomment(commentid) {
    return this.http.delete(this.configUrl + "deletecomment?commentid=" + commentid, this.httpOptions)
  }
  retrievecomments(postid) {
    return this.http.get(this.configUrl + "retrievecomments?postid=" + postid, this.httpOptions);
  }
  retrievecommentsafter(commentid, postid) {
    return this.http.get(this.configUrl + "retrievecommentsafter?commentid=" + commentid + "&postid=" + postid, this.httpOptions);
  }
  retrievecommentslatest(commentid, postid) {
    return this.http.get(this.configUrl + "retrievecommentslatest?commentid=" + commentid + "&postid=" + postid, this.httpOptions);
  }
  retrievecommentlatest(postid, topofcommentid) {
    return this.http.get(this.configUrl + "retrievecommentlatest?postid=" + postid + "&topofcommentid=" + topofcommentid, this.httpOptions);
  }
  convertDateTimeToWord(datetime, datetimecurrent) {
    let createdatetime = new Date(datetime);
    let currentdatetime = new Date(datetimecurrent);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let yesterday = createdatetime.getFullYear() == currentdatetime.getFullYear() &&
      createdatetime.getMonth() == currentdatetime.getMonth() &&
      currentdatetime.getDate() - createdatetime.getDate() == 1;

    let today = new Date(datetime).getDate() == new Date(datetimecurrent).getDate() &&
      new Date(datetime).getMonth() == new Date(datetimecurrent).getMonth() &&
      new Date(datetime).getFullYear() == new Date(datetimecurrent).getFullYear();

    let minutes = String(createdatetime.getMinutes()).length == 1 ? "0" + createdatetime.getMinutes() : createdatetime.getMinutes();
    let year = createdatetime.getFullYear() == currentdatetime.getFullYear() ? "" : createdatetime.getFullYear();

    let localeTime = createdatetime.toLocaleString().split(",")[1];
    let PM = localeTime.split(" ").length > 2 ? localeTime.split(" ")[2] : "";
    localeTime = localeTime.split(":")[0] + ":" + localeTime.split(":")[1] + " " + PM;

    if (yesterday)
      return "Yesterday" + " at " + localeTime;

    if (today)
      return localeTime;

    return (createdatetime.getDate() + " " + monthNames[createdatetime.getMonth()] + " " + year + " at " + localeTime);
  }
  convertDateTimeToWordWithSec(datetime, datetimecurrent) {
    let createdatetime = new Date(datetime);
    let currentdatetime = new Date(datetimecurrent);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let yesterday = createdatetime.getFullYear() == currentdatetime.getFullYear() &&
      createdatetime.getMonth() == currentdatetime.getMonth() &&
      currentdatetime.getDate() - createdatetime.getDate() == 1;

    let today = new Date(datetime).getDate() == new Date(datetimecurrent).getDate() &&
      new Date(datetime).getMonth() == new Date(datetimecurrent).getMonth() &&
      new Date(datetime).getFullYear() == new Date(datetimecurrent).getFullYear();

    let minutes = String(createdatetime.getMinutes()).length == 1 ? "0" + createdatetime.getMinutes() : createdatetime.getMinutes();
    let year = createdatetime.getFullYear() == currentdatetime.getFullYear() ? "" : createdatetime.getFullYear();

    let localeTime = createdatetime.toLocaleString().split(",")[1];

    if (yesterday)
      return "Yesterday" + " at " + localeTime;

    if (today)
      return localeTime;

    return (createdatetime.getDate() + " " + monthNames[createdatetime.getMonth()] + " " + year + " at " + localeTime);
  }
  likepost(postid, userid) {
    this.http.post(this.configUrl + "likepost?postid=" + postid + "&userid=" + userid, this.httpOptions).subscribe(data => { });
  }
  deletepostlike(postid, userid) {
    this.http.delete(this.configUrl + "deletepostlike?postid=" + postid + "&userid=" + userid, this.httpOptions).subscribe(data => { });
  }
  dislikepost(postid, userid) {
    this.http.post(this.configUrl + "dislikepost?postid=" + postid + "&userid=" + userid, this.httpOptions).subscribe(data => { });
  }
  deletepostdislike(postid, userid) {
    this.http.delete(this.configUrl + "deletepostdislike?postid=" + postid + "&userid=" + userid, this.httpOptions).subscribe(data => { });
  }
  createmessge(formData: FormData, callBack, messageId) {
    this.http.post(this.configUrl + "createmessage", formData).subscribe(data => {
      callBack(data, messageId);
    });
  }
  markmessagesasread(from, to) {
    return this.http.put(this.configUrl + "markmessagesasread?from=" + from + "&to=" + to, []);
  }
  markmessageasdeleted(messageid, deletefor){
    return this.http.put(this.configUrl + "markmessageasdeleted?messageid=" + messageid + "&deletefor=" + deletefor, this.httpOptions);
  }
  retrievemessages(userone, usertwo,retriever) {
    return this.http.get(this.configUrl + "retrievemessages?userone=" + userone + "&usertwo=" + usertwo + "&retriever=" + retriever, this.httpOptions);
  }
  retrievemessagesafter(userone, usertwo, lastmessageid,retriever) {
    return this.http.get(this.configUrl + "retrievemessagesafter?userone=" + userone + "&usertwo=" + usertwo + "&lastmessageid=" + lastmessageid + "&retriever=" + retriever, this.httpOptions);
  }
  retrieveactivechats(userid) {
    return this.http.get(this.configUrl + "retrieveactivechats?userid=" + userid, this.httpOptions);
  }
  uploadfiles(formData: FormData, callBackFunction, extraParam, extraParam1) {
    this.http.post(this.configUrl + "uploadfiles", formData).subscribe(data => {
      callBackFunction(data, extraParam, extraParam1);
    });
  }
  deletefile(fileid){
    return this.http.delete(this.configUrl + "deletefile?fileid=" + fileid,this.httpOptions);
  }
  retrieveleaderboards(userid, orderby, page, prevPages) {
    return this.http.post(this.configUrl + "retrieveleaderboards?userid=" + userid + "&orderby=" + orderby + "&page=" + page, prevPages, this.httpOptions);
  }
  searchleaderboards(query, orderby) {
    return this.http.get(this.configUrl + "searchleaderboards?query=" + query + "&orderby=" + orderby, this.httpOptions);
  }
  createfriendship(friendship) {
    return this.http.post(this.configUrl + "createfriendship", friendship, this.httpOptions);
  }
  approvefriendship(friendshipid) {
    return this.http.post(this.configUrl + "approvefriendship?friendshipid=" + friendshipid, this.httpOptions);
  }
  deletefriendship(friendshipid) {
    return this.http.delete(this.configUrl + "deletefriendship?friendshipid=" + friendshipid, this.httpOptions);
  }
  retrievefriendshiprequests(userid) {
    return this.http.get(this.configUrl + "retrievefriendshiprequests?userid=" + userid, this.httpOptions);
  }
  retrievefriendshiprequestsafter(userid, lastfriendshipid) {
    return this.http.get(this.configUrl + "retrievefriendshiprequestsafter?userid=" + userid + "&lastfriendshipid=" + lastfriendshipid, this.httpOptions);
  }
  retrievefriendships(userid) {
    return this.http.get(this.configUrl + "retrievefriendships?userid=" + userid, this.httpOptions);
  }
  retrievefriendshipsafter(userid, lastfriendshipid) {
    return this.http.get(this.configUrl + "retrievefriendshipsafter?userid=" + userid + "&lastfriendshipid=" + lastfriendshipid, this.httpOptions);
  }
  search(query) {
    return this.http.get(this.configUrl + "search?query=" + query, this.httpOptions);
  }
  createsearchhistory(search) {
    return this.http.post(this.configUrl + "createsearchhistory", search);
  }
  retrievesearchhistory(userid) {
    return this.http.get(this.configUrl + "retrievesearchhistory?userid=" + userid, this.httpOptions);
  }
  retrievegalleryfiles(userid) {
    return this.http.get(this.configUrl + "retrievegalleryfiles?userid=" + userid, this.httpOptions);
  }
  retrievegalleryfilesafter(userid, lastfile) {
    return this.http.get(this.configUrl + "retrievegalleryfilesafter?userid=" + userid + "&lastfile=" + lastfile, this.httpOptions);
  }
  retrieveserver(name) {
    return this.http.get(this.configUrl + "retrieveserver?name=" + name, this.httpOptions);
  }
  retrieveservers(role) {
    return this.http.get(this.configUrl + "retrieveservers?role=" + role, this.httpOptions);
  }
  updatenotification(notification) {
    return this.http.post(this.configUrl + "updatenotification", notification, this.httpOptions);
  }
  markallnotificationsasseen(userid) {
    return this.http.put(this.configUrl + "markallnotificationsasseen?userid=" + userid, this.httpOptions);
  }
  deletenotification(notificationid) {
    return this.http.delete(this.configUrl + "deletenotification?notificationid=" + notificationid, this.httpOptions);
  }
  retrievenotifications(userid) {
    return this.http.get(this.configUrl + "retrievenotifications?userid=" + userid, this.httpOptions);
  }
  retrievenotificationsafter(userid, lastnotificationid) {
    return this.http.get(this.configUrl + "retrievenotificationsafter?userid=" + userid + "&lastnotificationid=" + lastnotificationid, this.httpOptions);
  }
  retrieveheaderstats(userid) {
    return this.http.get(this.configUrl + "retrieveheaderstats?userid=" + userid, this.httpOptions);
  }
  retrievesuggestions(userid) {
    return this.http.get(this.configUrl + "retrievesuggestions?userid=" + userid, this.httpOptions);
  }
  createactivity(activity) {
    return this.http.post(this.configUrl + "createactivity", activity);
  }
  retrieveactivities(userid) {
    return this.http.get(this.configUrl + "retrieveactivities?userid=" + userid, this.httpOptions);
  }
  retrieveattemptsprices() {
    return this.http.get(this.configUrl + "retrieveattemptsprices", this.httpOptions);
  }
  updateattemptpuchase(purchase) {
    return this.http.put(this.configUrl + "updateattemptpuchase", purchase);
  }
  retrieveattemptpuchase(purchaseid) {
    return this.http.get(this.configUrl + "retrieveattemptpuchase?purchaseid=" + purchaseid, this.httpOptions);
  }
  updatesetting(setting) {
    return this.http.put(this.configUrl + "updatesetting", setting);
  }
  retrievesettings(userid) {
    return this.http.get(this.configUrl + "retrievesettings?userid=" + userid, this.httpOptions);
  }
  updatelocalsettings() {
    this.retrievesettings(this.UserData["_id"]).subscribe(data => {
      this.Settings = data;
      if (sessionStorage.getItem("logon") != "" && sessionStorage.getItem("logon") != null && sessionStorage.getItem("logon") != "null") {
        sessionStorage.setItem("settings", JSON.stringify(data));
      }
      else {
        localStorage.setItem("settings", JSON.stringify(data));
      }
    });
  }
  getlocalsettings() {
    if (this.Settings == null) {
      if (sessionStorage.getItem("settings") != "" && sessionStorage.getItem("settings") != null && sessionStorage.getItem("settings") != "null") {
        this.Settings = JSON.parse(sessionStorage.getItem("settings"));
      }
      else if (localStorage.getItem("settings") != "" && localStorage.getItem("settings") != null && localStorage.getItem("settings") != "null") {
        this.Settings = JSON.parse(localStorage.getItem("settings"));
      }
    }
    return this.Settings;
  }
  retrievehelpitems() {
    return this.http.get(this.configUrl + "retrievehelpitems", this.httpOptions);
  }
  retrievedefaultsessionchallengestats(challengeid, userid) {
    return this.http.get(this.configUrl + "retrievedefaultsessionchallengestats?challengeid=" + challengeid + "&userid=" + userid, this.httpOptions);
  }
  retrievelevels(){
    return this.http.get(this.configUrl + "retrievelevels", this.httpOptions);
  }
}
