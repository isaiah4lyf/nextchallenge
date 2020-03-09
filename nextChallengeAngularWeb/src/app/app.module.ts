import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
    SessionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
