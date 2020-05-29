import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {IndexComponent} from './index.component';
import {PageComponent} from './page.component';

const routes: Routes = [
    {path: 'application/apps/angular', component: IndexComponent},
    {path: 'application/apps/angular/page', component: PageComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
