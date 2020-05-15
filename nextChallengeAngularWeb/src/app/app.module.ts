import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NavigationMenuComponent } from './navigation-menu/navigation-menu.component';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { HomeComponent } from './home/home.component';
import { CreatePostComponent } from './home/create-post/create-post.component';
import { PostComponent } from './home/post/post.component';
import { ProfileComponent } from './profile/profile.component';
import { SessionComponent } from './home/session/session.component';
import { DefaultComponent } from './home/default/default.component';
import { PlayComponent } from './home/play/play.component';
import { BuyAttemptsComponent } from './home/buy-attempts/buy-attempts.component';
import { SessionsComponent } from './home/sessions/sessions.component';
import { LeaderboardsComponent } from './home/leaderboards/leaderboards.component';
import { PrizesComponent } from './home/prizes/prizes.component';
import { SettingsComponent } from './home/settings/settings.component';
import { ContactComponent } from './home/contact/contact.component';
import { HelpComponent } from './home/help/help.component';
import { FriendRequestsComponent } from './home/friend-requests/friend-requests.component';
import { ChatComponent } from './home/chat/chat.component';
import { NotificationsComponent } from './home/notifications/notifications.component';
import { OpenChatComponent } from './home/open-chat/open-chat.component';
import { IndexComponent } from './index/index.component';
import { TimelineComponent } from './profile/timeline/timeline.component';
import { AboutComponent } from './profile/about/about.component';
import { GalleryComponent } from './profile/gallery/gallery.component';
import { FriendsComponent } from './profile/friends/friends.component';
import { AboutViewComponent } from './profile/about/about-view/about-view.component';
import { AboutEditComponent } from './profile/about/about-edit/about-edit.component';
import { AppService } from './services/app.service';
import { LoginComponent } from './index/login/login.component';
import { RegisterComponent } from './index/register/register.component';
import { PostViewComponent } from './home/post-view/post-view.component';
import { CommentComponent } from './home/post-view/comment/comment.component';
import { MessageComponent } from './home/open-chat/message/message.component';
import { ChatUserComponent } from './home/chat/chat-user/chat-user.component';
import { InterestsComponent } from './profile/about/interests/interests.component';
import { ChangePasswordComponent } from './profile/about/change-password/change-password.component';
import { SessionChallengeComponent } from './home/session/session-challenge/session-challenge.component';
import { SessionMessageComponent } from './home/session/session-message/session-message.component';
import { SessionAnswerComponent } from './home/session/session-answer/session-answer.component';
import { EducationComponent } from './profile/about/education/education.component';
import { WorkComponent } from './profile/about/work/work.component';
import { SessionLeaderboardsComponent } from './home/session/session-leaderboards/session-leaderboards.component';
import { NotificationsService } from './services/notifications.service';
import { SuggestionComponent } from './suggestions/suggestion/suggestion.component';
import { CompleteBuyComponent } from './home/complete-buy/complete-buy.component';
import { CancelBuyComponent } from './home/cancel-buy/cancel-buy.component';
import { ConfirmEmailComponent } from './home/confirm-email/confirm-email/confirm-email.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavigationMenuComponent,
    SuggestionsComponent,
    HomeComponent,
    CreatePostComponent,
    PostComponent,
    ProfileComponent,
    SessionComponent,
    DefaultComponent,
    PlayComponent,
    BuyAttemptsComponent,
    SessionsComponent,
    LeaderboardsComponent,
    PrizesComponent,
    SettingsComponent,
    ContactComponent,
    HelpComponent,
    FriendRequestsComponent,
    ChatComponent,
    NotificationsComponent,
    OpenChatComponent,
    IndexComponent,
    TimelineComponent,
    AboutComponent,
    GalleryComponent,
    FriendsComponent,
    AboutViewComponent,
    AboutEditComponent,
    LoginComponent,
    RegisterComponent,
    PostViewComponent,
    CommentComponent,
    MessageComponent,
    ChatUserComponent,
    InterestsComponent,
    ChangePasswordComponent,
    SessionChallengeComponent,
    SessionMessageComponent,
    SessionAnswerComponent,
    EducationComponent,
    WorkComponent,
    SessionLeaderboardsComponent,
    SuggestionComponent,
    CompleteBuyComponent,
    CancelBuyComponent,
    ConfirmEmailComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3500,
      progressBar: true,
      progressAnimation: 'increasing',
      preventDuplicates: true,
      enableHtml: true,
      closeButton: true
    })
  ],
  providers: [AppService, NotificationsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
