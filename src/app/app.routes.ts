import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { QueryComponent } from './components/query/query.component';
import { DetailsComponent } from './components/details/details.component';
import { LoginComponent } from './components/login/login.component';
import { UploadComponent } from './components/login/upload/upload.component';
import { authGuard } from './guards/authGuard';
import { AdminComponent } from './components/login/admin/admin.component';
import { adminGuard } from './guards/adminGuard';
import { OntologyComponent } from './components/ontology/ontology.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'query', component: QueryComponent },
    { path: 'query/:q', component: QueryComponent },
    { path: 'detail/:filename', component: DetailsComponent },
    { path: 'login', component: LoginComponent }, 
    { path: 'ontology', component: OntologyComponent},
    { 
      path: 'upload', 
      component: UploadComponent, 
      canActivate: [authGuard]
    },
      { 
      path: 'admin', 
      component: AdminComponent, 
      canActivate: [adminGuard]
    }
];
