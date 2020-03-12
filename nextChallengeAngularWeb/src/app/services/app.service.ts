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

  constructor(private router: Router, private http: HttpClient) {}

  login(form: NgForm) {
    return this.http.get(this.configUrl + "getusers");
  }

  register(form: NgForm) {
    var jsn = JSON.parse(JSON.stringify(form.value));
    jsn["DateOfBirth"] = {
      Day: jsn["Day"],
      Month: jsn["Month"],
      Year: jsn["Year"]
    };
    delete jsn["Day"];
    delete jsn["Month"];
    delete jsn["Year"];
    return this.http.post(this.configUrl + "createuser",JSON.stringify(jsn),this.httpOptions);
  }
}
