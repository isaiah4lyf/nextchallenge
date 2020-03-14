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

  constructor(private router: Router, private http: HttpClient) {}

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
  createPost(form: NgForm, formData: FormData, createPostSpinnerRef) {
    this.http.post(this.configUrl + "createpost", formData).subscribe(data => {
      setTimeout(() => {
        createPostSpinnerRef.style.display = "none";
        form.reset();
      }, 1000);
    });
  }
  retrieveposts() {
    return this.http.get(this.configUrl + "retrieveposts", this.httpOptions);
  }
  retrievepostsafter(lastPostId) {
    return this.http.get(
      this.configUrl + "retrievepostsafter?postid=" + lastPostId,
      this.httpOptions
    );
  }
  retrievepost(postid) {
    return this.http.get(
      this.configUrl + "retrievepost?postid=" + postid,
      this.httpOptions
    );
  }
  createComment(form: NgForm, formData: FormData) {
    this.http.post(this.configUrl + "createcomment", formData).subscribe(data => {
      setTimeout(() => {
        form.reset();
      }, 1000);
    });
  }
}
