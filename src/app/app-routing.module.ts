import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { TemplateComponent } from './components/template/template.component';

const routes: Routes = [
  {
    path: 'example',
    component: MultiSelectComponent,
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: TemplateComponent,
  },
  {
    path: 'home/pdf',
    component: TemplateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
