import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { QueryComponent } from './components/query/query.component';
import { DetailsComponent } from './components/details/details.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'query', component: QueryComponent },
    { path: 'query/:q', component: QueryComponent },
    { path: 'detail/:filename', component: DetailsComponent }
];
