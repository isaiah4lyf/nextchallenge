import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ProfileComponent } from "./profile/profile.component";
import { DefaultComponent } from "./home/default/default.component";
import { SessionComponent } from "./home/session/session.component";
import { BuyAttemptsComponent } from "./home/buy-attempts/buy-attempts.component";
import { PlayComponent } from "./home/play/play.component";
import { SessionsComponent } from "./home/sessions/sessions.component";
import { LeaderboardsComponent } from "./home/leaderboards/leaderboards.component";
import { PrizesComponent } from "./home/prizes/prizes.component";
import { SettingsComponent } from "./home/settings/settings.component";
import { ContactComponent } from "./home/contact/contact.component";
import { HelpComponent } from "./home/help/help.component";
import { FriendRequestsComponent } from "./home/friend-requests/friend-requests.component";
import { NotificationsComponent } from "./home/notifications/notifications.component";
import {ChatComponent } from "./home/chat/chat.component";

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
      { path: "buy", component: BuyAttemptsComponent },
      { path: "play", component: PlayComponent },
      { path: "play/:id", component: SessionsComponent },
      { path: "play/:id/:id", component: SessionComponent },
      { path: "leaderboards", component: LeaderboardsComponent },
      { path: "prizes", component: PrizesComponent },
      { path: "settings", component: SettingsComponent },
      { path: "contact", component: ContactComponent },
      { path: "friendrequests", component: FriendRequestsComponent },
      { path: "notifications", component: NotificationsComponent },
      { path: "chat", component: NotificationsComponent }
    ]
  },
  { path: "profile", component: ProfileComponent },
  { path: "help", component: HelpComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
