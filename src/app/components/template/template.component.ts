import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelect } from 'src/app/services/dataModels/multiSelect';
import { TableColumn } from 'src/app/services/dataModels/tableColumn';
import {
  ExcelExportService,
  IExportAsExcelProps,
} from 'src/app/services/excel-export.service';
import { DecisionModalComponent } from '../decision-modal/decision-modal.component';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { UserInfoService } from 'src/app/services/sharepoint/user-info.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
  providers: [CurrencyPipe, DecimalPipe, PercentPipe],
})
export class TemplateComponent implements OnInit {
  overviewData;
  overviewHeaders: TableColumn[];
  dataLength;
  files = [];
  pdfExport: boolean = false;

  group = this.fb.group({
    input: ['', Validators.required],
    inputTwo: ['', Validators.required],
    multiSelect: [['B', 'C'], Validators.required],
    multiSelectTwo: ['', Validators.required],
    multiPeoplePicker: [
      [
        {
          email: 'Vedad.Njuhovic@partner.bmwgroup.com',
          name: 'Njuhovic Vedad, (Vedad.Njuhovic@partner.bmwgroup.com)',
        },
      ],
      Validators.required,
    ],
  });

  multiSelectData: MultiSelect[] = [
    { name: 'Switzerland', id: 'A' },
    { name: 'Bank B (Switzerland)', id: 'B' },
    { name: 'France', id: 'C' },
    { name: 'Bank D (France)', id: 'D' },
    { name: 'Bank E (France)', id: 'E' },
    { name: 'Bank F (Italy)', id: 'F' },
    { name: 'Bank G (Italy)', id: 'G' },
    { name: 'Bank H (Italy)', id: 'H' },
    { name: 'Bank I (Italy)', id: 'I' },
    { name: 'Bank J (Italy)', id: 'J' },
    { name: 'Bank K (Italy)', id: 'K' },
    { name: 'Bank L (Germany)', id: 'L' },
    { name: 'Bank M (Germany)', id: 'M' },
    { name: 'Bank N (Germany)', id: 'N' },
    { name: 'Bank O (Germany)', id: 'O' },
    { name: 'Bank P (Germany)', id: 'P' },
    { name: 'Bank Q (Germany)', id: 'Q' },
    { name: 'Bank R (Germany)', id: 'R' },
  ];

  constructor(
    private dialog: MatDialog,
    private excelExportS: ExcelExportService,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userInfoS: UserInfoService
  ) {
    console.log(window.location.href);
  }

  ngOnInit(): void {
    this.initializeColumns();
    this.getRepoIssues().subscribe((dataInfo)=>{
      this.dataLength = dataInfo.length;
      this.overviewData = dataInfo.items.slice(0,10);
    });

    this.exportToPdf();

    this.userInfoS.allUserInfo.subscribe((value) => {
      console.log(value);
    });
  }

  writeValue() {}

  public openModal(): void {
    let dialogRef = this.dialog.open(DecisionModalComponent, {
      width: '400px',
      data: {
        modalTitle: 'Modal title',
        modalBody: 'Modal body',
        acceptButtonTxt: 'Save',
        declineButtonTxt: 'Cancel',
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((decision) => {
      // if decision === true => button accept clicked
      // if decision === false => button decline clicked
      console.log(decision);
    });
  }

  exportToExcel() {
    let exportProps: IExportAsExcelProps = {
      data: [],
      fileName: 'fileName',
    };
    this.excelExportS.exportAsExcel(exportProps);
  }
  onExportToPdf() {
    let href = window.location.href + '/pdf';
    console.log(href);

    window.open(href, '_blank');
  }

  exportToPdf() {
    if (this.router.url.includes('/pdf')) {
      this.pdfExport = true;
      window.print();

      window.onafterprint = function () {
        window.close();
      };
    }
  }

  rowAction(row) {
    console.log(row);
    //make your own row action
  }

  initializeColumns(): void {
    this.overviewHeaders = [
      {
        name: 'Name',
        dataKey: 'name',
        position: 'left',
        isSortable: true,
      },
      {
        name: 'Surname',
        dataKey: 'surname',
        position: 'left',
        isSortable: false,
      },
      {
        name: 'Address',
        dataKey: 'adress',
        position: 'left',
        isSortable: true,
      },
      {
        name: 'Phone',
        dataKey: 'phone',
        position: 'left',
        isSortable: false,
      },
    ];
  }

  getRepoIssues(sort: string = '', order: string = '', query: string = '', startIndex: number = 0, endIndex: number = null): Observable<any> {
    const href = 'https://api.github.com/search/issues';
    let requestUrl = `${href}?q=repo:angular/components`;

    let fakeSort;
    if(order){
      if(sort=='Name'){
        fakeSort = 'created';
      } else if(sort=='Address'){
        fakeSort = 'updated';
      }
    }

    if(fakeSort){
      requestUrl += `&sort=${fakeSort}`
    }
    if(query){
      requestUrl += `&q=${query}`
    }
    if(order){
      requestUrl += `&order=${order}`
    }
    return this.http.get(requestUrl).pipe(map((data: any)=>{
      if(!data?.items){
        return [];
      }
      let items = data.items;
      let totalLength = items.length;
      items.forEach((item)=>{
        item.name = item.title;
        item.surname = item.active_lock_reason;
        item.adress = item.body;
        item.phone = item.id;
      })
      return {
        length: totalLength,
        items: endIndex ? items.slice(startIndex, endIndex) : items.slice(startIndex)
      }
    }));
  }

  addFile(ev) {
    console.log(ev);
    console.log(this.files);
    for (let index = 0; index < ev.length; index++) {
      const element = ev[index];
      this.files.push(element.name);
    }
  }

  deleteFile(index) {
    console.log(index);
    this.files.splice(index, 1);
  }
}
