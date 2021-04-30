import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoadingSpinnerComponent } from './spinners/loading-spinner/loading-spinner.component';

import { DataPropertyGetterPipe } from './components/overview/data-property-getter-pipe/data-property-getter.pipe';

// ng zorro
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { TemplateComponent } from './components/template/template.component';
import { DecisionModalComponent } from './components/decision-modal/decision-modal.component';
import { OverviewComponent } from './components/overview/overview.component';
import { PeoplePickerComponent } from './components/people-picker/people-picker.component';
import { MaterialModule } from './material/material.module';
import { MatButtonLoadingDirective } from './directive/mat-button-loading.directive';
import { CustomToolTipComponent } from './components/utility/custom-tooltip/custom-tooltip.component';
import { ToolTipRendererDirective } from './directive/tool-tip-renderer.directive';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  APP_DATE_FORMATS,
  GermanDateAdapter,
} from './common/format-datepicker';
import { MatSelectSearchComponent } from './components/utility/mat-select-search/mat-select-search.component';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { DragDropFileComponent } from './components/drag-drop-file/drag-drop-file.component';
import { DragDropFileDirective } from './directive/drag-drop-file.directive';
import { MatTableExporterModule } from 'mat-table-exporter';
import { NavbarModalComponent } from './components/navbar/navbar-modal/navbar-modal.component';
import { MultiPeoplePickerComponent } from './components/multi-people-picker/multi-people-picker.component';

registerLocaleData(en);

declare global {
  interface Window {
    $SP: Function;
  }
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoadingSpinnerComponent,
    TemplateComponent,
    DecisionModalComponent,
    OverviewComponent,
    DataPropertyGetterPipe,
    PeoplePickerComponent,
    ToolTipRendererDirective,
    MatButtonLoadingDirective,
    CustomToolTipComponent,
    MatSelectSearchComponent,
    MultiSelectComponent,
    DragDropFileComponent,
    DragDropFileDirective,
    NavbarModalComponent,
    MultiPeoplePickerComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    MatTableExporterModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill' },
    },
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: LOCALE_ID, useValue: 'de-DE' },
    { provide: DateAdapter, useClass: GermanDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
