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
import { ChatComponent } from "./home/chat/chat.component";
import { OpenChatComponent } from "./home/open-chat/open-chat.component";
import { IndexComponent } from "./index/index.component";
import { TimelineComponent } from "./profile/timeline/timeline.component";
import { AboutComponent } from "./profile/about/about.component";
import { GalleryComponent } from "./profile/gallery/gallery.component";
import { FriendsComponent } from "./profile/friends/friends.component";
import { PostViewComponent } from "./home/post-view/post-view.component";
import { AboutEditComponent } from "./profile/about/about-edit/about-edit.component";
import { InterestsComponent } from "./profile/about/interests/interests.component";
import { ProfileSettingsComponent } from "./profile/about/settings/settings.component";
import { ChangePasswordComponent } from "./profile/about/change-password/change-password.component";
import { EducationComponent } from "./profile/about/education/education.component";
import { WorkComponent } from "./profile/about/work/work.component";
import { CompleteBuyComponent } from "./home/complete-buy/complete-buy.component";
import { CancelBuyComponent } from "./home/cancel-buy/cancel-buy.component";
import { RegisterComponent } from "./index/register/register.component";
import { LoginComponent } from "./index/login/login.component";
import { ForgotPasswordComponent } from './index/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './index/reset-password/reset-password.component';
import { ChangeEmailComponent } from './index/change-email/change-email.component';
import { ConfirmEmailComponent } from './index/confirm-email/confirm-email.component';

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
      { path: "play", component: SessionsComponent },
      { path: "play/:id/:session", component: SessionComponent },
      { path: "leaderboards", component: LeaderboardsComponent },
      { path: "prizes", component: PrizesComponent },
      { path: "settings", component: SettingsComponent },
      { path: "contact", component: ContactComponent },
      { path: "friend-requests", component: FriendRequestsComponent },
      { path: "notifications", component: NotificationsComponent },
      { path: "chat", component: ChatComponent },
      { path: "chat/:id", component: OpenChatComponent },
      { path: "post/:id", component: PostViewComponent },
      { path: "processed/:id", component: CompleteBuyComponent },
      { path: "cancelled/:id", component: CancelBuyComponent }
    ]
  },
  { path: "help", component: HelpComponent },
  { path: "confirm-email/:id", component: ConfirmEmailComponent },
  { path: "change-email/:id", component: ChangeEmailComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "reset-password/:id", component: ResetPasswordComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "index",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: ":id",
    component: ProfileComponent,
    children: [
      {
        path: "",
        redirectTo: "timeline",
        pathMatch: "full"
      },
      { path: "timeline", component: TimelineComponent },
      {
        path: "about",
        component: AboutComponent,
        children: [
          { path: "basic-info", component: AboutEditComponent },
          { path: "education", component: EducationComponent },
          { path: "work", component: WorkComponent },
          { path: "interests", component: InterestsComponent },
          //{ path: "settings", component: ProfileSettingsComponent },
          { path: "change-password", component: ChangePasswordComponent }
        ]
      },
      { path: "gallery", component: GalleryComponent },
      { path: "friends", component: FriendsComponent }
    ]
  },
  { path: "**", redirectTo: "login", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
