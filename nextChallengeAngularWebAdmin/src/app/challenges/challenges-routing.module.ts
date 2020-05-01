import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllChallengesComponent } from './all-challenges/all-challenges.component';

const routes: Routes = [{ path: 'all-challenges', component: AllChallengesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChallengesRoutingModule { }
