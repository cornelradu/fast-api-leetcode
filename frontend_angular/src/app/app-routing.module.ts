import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { WorkspaceComponent } from './workspace/workspace.component';

const routes: Routes = [{ path: 'workspace', component: WorkspaceComponent },
                        { path: 'login', component: LoginFormComponent},
                        { path: '', redirectTo: '/login', pathMatch: 'full' }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
