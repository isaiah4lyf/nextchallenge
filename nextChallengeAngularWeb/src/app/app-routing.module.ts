import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ProfileComponent } from "./profile/profile.component";
import { DefaultComponent } from "./home/default/default.component";
import { SessionComponent } from "./home/session/session.component";
import { BuyAttemptsComponent } from "./home/buy-attempts/buy-attempts.component";
import { PlayComponent } from "./home/play/play.component";
import { SessionsComponent } from "./home/sessions/sessions.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    children: [
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
      },
      { path: "home", component: DefaultComponent },
      { path: "buyattempts", component: BuyAttemptsComponent },
      { path: "play", component: PlayComponent },
      { path: "play/:id", component: SessionsComponent },
      { path: "play/:id/:id", component: SessionComponent }
    ]
  },
  { path: "profile", component: ProfileComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
