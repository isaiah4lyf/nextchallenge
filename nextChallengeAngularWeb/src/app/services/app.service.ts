import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";
import { NgForm } from "@angular/forms";

@Injectable({
  providedIn: "root"
})
export class AppService {
  private configUrl = "http://localhost:44357/api/index/";
  private httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };
  private httpOptionsMultipart = {
    headers: new HttpHeaders({
      "Content-Type":
        "multipart/form-data; boundary=--------------------------654287500409823045608277"
    })
  };
  private UserData = null;

  constructor(private router: Router, private http: HttpClient) { }

  login(form: NgForm) {
    return this.http.get(
      this.configUrl +
      "login?email=" +
      form.value.Email +
      "&password=" +
      form.value.Password
    );
  }

  register(form: NgForm) {
    return this.http.post(
      this.configUrl + "createuser",
      JSON.stringify(form.value),
      this.httpOptions
    );
  }
  setUserData(data: Object) {
    this.UserData = data;
    localStorage.setItem("logon", JSON.stringify(data));
  }
  getUserData() {
    if (this.UserData == null) {
      if (
        localStorage.getItem("logon") != "" &&
        localStorage.getItem("logon") != null
      ) {
        this.UserData = JSON.parse(localStorage.getItem("logon"));
      } else {
        this.router.navigate(["/login"]);
      }
    }
    return this.UserData;
  }
  retrieveUserDataWithName(name) {
    return this.http.get(
      this.configUrl + "retrieveuser?name=" + name,
      this.httpOptions
    );
  }
  createPost(form: NgForm, formData: FormData, createPostSpinnerRef) {
    this.http.post(this.configUrl + "createpost", formData).subscribe(data => {
      setTimeout(() => {
        createPostSpinnerRef.style.display = "none";
        form.reset();
      }, 1000);
    });
  }
  retrieveposts(userid) {
    return this.http.get(
      this.configUrl + "retrieveposts?userid=" + userid,
      this.httpOptions
    );
  }
  retrievepostsafter(lastPostId, userid) {
    return this.http.get(
      this.configUrl +
      "retrievepostsafter?postid=" +
      lastPostId +
      "&userid=" +
      userid,
      this.httpOptions
    );
  }
  retrievepost(postid, userid) {
    return this.http.get(
      this.configUrl + "retrievepost?postid=" + postid + "&userid=" + userid,
      this.httpOptions
    );
  }
  createComment(form: NgForm, formData: FormData) {
    this.http
      .post(this.configUrl + "createcomment", formData)
      .subscribe(data => {
        setTimeout(() => {
          form.reset();
        }, 1000);
      });
  }
  retrievecomments(postid) {
    return this.http.get(
      this.configUrl + "retrievecomments?postid=" + postid,
      this.httpOptions
    );
  }
  retrievecommentsafter(commentid, postid) {
    return this.http.get(
      this.configUrl +
      "retrievecommentsafter?commentid=" +
      commentid +
      "&postid=" +
      postid,
      this.httpOptions
    );
  }
  retrievecommentslatest(commentid, postid) {
    return this.http.get(
      this.configUrl +
      "retrievecommentslatest?commentid=" +
      commentid +
      "&postid=" +
      postid,
      this.httpOptions
    );
  }
  retrievecommentlatest(postid, topofcommentid) {
    return this.http.get(
      this.configUrl +
      "retrievecommentlatest?postid=" +
      postid +
      "&topofcommentid=" +
      topofcommentid,
      this.httpOptions
    );
  }
  convertDateTimeToWord(datetime, datetimecurrent) {
    let createdatetime = new Date(datetime);
    let currentdatetime = new Date(datetimecurrent);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    let yesterday =
      createdatetime.getFullYear() == currentdatetime.getFullYear() &&
      createdatetime.getMonth() == currentdatetime.getMonth() &&
      currentdatetime.getDate() - createdatetime.getDate() == 1;
    let aboutMins =
      createdatetime.getFullYear() == currentdatetime.getFullYear() &&
      createdatetime.getMonth() == currentdatetime.getMonth() &&
      createdatetime.getDate() == currentdatetime.getDate() &&
      (createdatetime.getHours() == currentdatetime.getHours() ||
        (currentdatetime.getHours() - createdatetime.getHours() == 1 &&
          currentdatetime.getMinutes() + 60 - createdatetime.getMinutes() <
          60));
    let aboutHours =
      createdatetime.getFullYear() == currentdatetime.getFullYear() &&
      createdatetime.getMonth() == currentdatetime.getMonth() &&
      createdatetime.getDate() == currentdatetime.getDate();
    let minutes =
      String(createdatetime.getMinutes()).length == 1
        ? "0" + createdatetime.getMinutes()
        : createdatetime.getMinutes();
    let year =
      createdatetime.getFullYear() == currentdatetime.getFullYear()
        ? ""
        : createdatetime.getFullYear();
    if (aboutMins) {
      let minDif =
        currentdatetime.getHours() - createdatetime.getHours() == 0
          ? currentdatetime.getMinutes() - createdatetime.getMinutes()
          : currentdatetime.getMinutes() + 60 - createdatetime.getMinutes();
      return minDif == 0
        ? "Now"
        : "about " + minDif + (minDif == 1 ? " minute ago" : " minutes ago");
    } else if (aboutHours) {
      let horDif = currentdatetime.getHours() - createdatetime.getHours();
      return horDif == 1
        ? "about " + horDif + " hour ago"
        : "about " + horDif + " hours ago";
    } else if (yesterday) {
      return "Yesterday" + " at " + createdatetime.getHours() + ":" + minutes;
    } else {
      return (
        createdatetime.getDate() +
        " " +
        monthNames[createdatetime.getMonth()] +
        " " +
        year +
        " at " +
        createdatetime.getHours() +
        ":" +
        minutes
      );
    }
  }
  likepost(postid, userid) {
    this.http
      .post(
        this.configUrl + "likepost?postid=" + postid + "&userid=" + userid,
        this.httpOptions
      )
      .subscribe(data => {
        console.log(data);
      });
  }
  deletepostlike(postid, userid) {
    this.http
      .delete(
        this.configUrl +
        "deletepostlike?postid=" +
        postid +
        "&userid=" +
        userid,
        this.httpOptions
      )
      .subscribe(data => {
        console.log(data);
      });
  }
  dislikepost(postid, userid) {
    this.http
      .post(
        this.configUrl + "dislikepost?postid=" + postid + "&userid=" + userid,
        this.httpOptions
      )
      .subscribe(data => {
        console.log(data);
      });
  }
  deletepostdislike(postid, userid) {
    this.http
      .delete(
        this.configUrl +
        "deletepostdislike?postid=" +
        postid +
        "&userid=" +
        userid,
        this.httpOptions
      )
      .subscribe(data => {
        console.log(data);
      });
  }
  createmessge(formData: FormData) {
    this.http
      .post(this.configUrl + "createmessage", formData)
      .subscribe(data => { });
  }
  retrievemessages(userone, usertwo) {
    return this.http.get(
      this.configUrl +
      "retrievemessages?userone=" +
      userone +
      "&usertwo=" +
      usertwo,
      this.httpOptions
    );
  }
  retrievemessagesafter(userone, usertwo, lastmessageid) {
    return this.http.get(
      this.configUrl +
      "retrievemessagesafter?userone=" +
      userone +
      "&usertwo=" +
      usertwo +
      "&lastmessageid=" +
      lastmessageid,
      this.httpOptions
    );
  }
  retrieveactivechats(userid) {
    return this.http.get(
      this.configUrl + "retrieveactivechats?userid=" + userid,
      this.httpOptions
    );
  }
  uploadfiles(formData: FormData, callBackFunction, extraParam, extraParam1) {
    this.http.post(this.configUrl + "uploadfiles", formData).subscribe(data => {
      callBackFunction(data, extraParam, extraParam1);
    });
  }
  retrieveleaderboards(userid, orderby, page, prevPages) {
    return this.http.post(
      this.configUrl +
      "retrieveleaderboards?userid=" +
      userid +
      "&orderby=" +
      orderby +
      "&page=" +
      page, prevPages,
      this.httpOptions
    );
  }
}
