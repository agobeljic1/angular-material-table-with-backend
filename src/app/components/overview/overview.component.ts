import { _isNumberValue } from '@angular/cdk/coercion';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { TableColumn } from 'src/app/services/dataModels/tableColumn';
import { MatTableExporterDirective } from 'mat-table-exporter';

@Component({
  selector: 'overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  public tableDataSource = new MatTableDataSource([]);
  public displayedColumns: string[];

  columnNamesMapper = {};

  @ViewChild(MatPaginator, { static: false }) matPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  @Input() isPageable = false;
  @Input() isSortable = false;
  @Input() isFilterable = false;
  @Input() isPartiallyLoading = false;
  @Input() tableColumns: TableColumn[];
  @Input() rowActionIcon: string;
  @Input() paginationSizes: number[] = [5, 10, 15];
  @Input() defaultPageSize = this.paginationSizes[1];
  @Input() shrinkHeight = true;
  @Input() dataLength = 0;
  @Input() scrollChunkSize = 20;
  @Input() containerHeight = '300px';
  @Input() overlayLoader = false;
  @Input() debounceTime: number = 600;
  @Input() errorMessage: string = 'Error while fetching the data';
  @Input() noDataMessage: string = 'Keine Daten';
  @Input() showDataMessageFirstPart: string = 'Showing ';
  @Input() showDataMessageSecondPart: string = ' results';
  @Input() actionsHeaderText: string = 'Actions';
  @Input() showTableResultsBar: boolean = true;
  @Input() showActionsHeaderText: boolean = false;

  @Input() isExportable = false;
  @Input() exportFileName: string;

  @Input() getData;//Funkcija
  
  @Output() rowAction: EventEmitter<any> = new EventEmitter<any>();

  isLoadingResults: boolean = false;
  scrollLoading: boolean = false;
  searchTerm: string;
  errorActive: boolean = false;


  private searchTerms = new Subject<string>();

  // this property needs to have a setter, to dynamically get changes from parent component
  @Input() set tableData(data: any[]) {
    this.setTableDataSource(data);
  }

  onChangeFilter = (searchFilter) => {
    if(this.isPartiallyLoading){
      this.searchTerms.next(searchFilter);
    }
    else{
      this.tableDataSource.filter = searchFilter?.trim().toLowerCase();
    }
  }

  onChangeSort = (sortParameters: Sort) => {
    if(this.isPartiallyLoading){
      this.resetPaging()
    }
    else{
      this.mapColumnNames();
    }
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const columnNames = this.tableColumns.map(
      (tableColumn: TableColumn) => tableColumn.name
    );
    if (this.rowActionIcon) {
      this.displayedColumns = [this.rowActionIcon, ...columnNames];
    } else {
      this.displayedColumns = columnNames;
    }
  }

  getTableData = () => {
    const pageIndex= this.matPaginator?.pageIndex || 0;
    const pageSize = this.matPaginator?.pageSize || this.paginationSizes[1] || 10;
    const startIndex = pageIndex * pageSize;
    const endIndex = (pageIndex + 1) * pageSize;
    return this.getData( this.matSort.active, this.matSort.direction, this.searchTerm || '', startIndex, endIndex).pipe(
    catchError((er) => {
      this.errorActive = true;
      this.isLoadingResults = false;
      return of(this.tableDataSource.filteredData);
    }));
  }

  setActiveError = () => {
    this.errorActive = true;
  }

  setInactiveError = () => {
    this.errorActive = false;
  }

  ngAfterViewInit(): void {
    if(this.isPartiallyLoading){
      this.subscribeToChanges(this.matSort?.sortChange);
      this.subscribeToChanges(
        this.searchTerms?.pipe(
          debounceTime(this.debounceTime),
          distinctUntilChanged()
        )
      );
      if(this.isPageable){
        this.subscribeToChanges(this.matPaginator?.page, true);
      }
    }
    else{
      this.tableDataSource.sort = this.matSort;
      this.tableDataSource.paginator = this.matPaginator;
    }
  }

  subscribeToChanges = (observable: Observable<any>, paging: boolean = false) => {
    observable?.pipe(
      startWith({}),
      switchMap(() => {
        this.setInactiveError();
        if(!this.overlayLoader){
          this.setTableDataSource([]);
        }
        this.isLoadingResults = true;
        return this.getTableData();
      }),
      map(data => {
        this.isLoadingResults = false;
        return data;
      }),
      catchError((er) => {
        this.isLoadingResults = false;
        this.setActiveError();
        return of(this.tableDataSource.data);
      })
    ).subscribe((res: any)=>{
      this.setTableDataSource(res.items);
      if(!paging){
        this.resetPaging();
      }
      this.dataLength = res.length;
    },error=>{
      this.setActiveError();
    });
  }

  resetPaging(): void {
    if(this.matPaginator){
      this.matPaginator.pageIndex = 0;
    }
  }

  setTableDataSource(data: any) {
    this.tableDataSource = new MatTableDataSource<any>(data);
    if(!this.isPartiallyLoading){
      this.tableDataSource.paginator = this.matPaginator;
      this.tableDataSource.sort = this.matSort;
      this.tableDataSource.sortingDataAccessor = this.sortingDataAccessor;
    }
  }

  mapColumnNames = () => {
    this.columnNamesMapper = {}
    this.tableColumns?.forEach((column)=>{
      this.columnNamesMapper[column.name] = column.dataKey;
    })
  }

  emitRowAction(row: any) {
    this.rowAction.emit(row);
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    if(!this.isPageable && this.isPartiallyLoading){
      if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
        if(this.dataLength > this.tableDataSource?.filteredData?.length && !this.isLoadingResults){
          let startIndex = this.tableDataSource?.filteredData?.length;
          let endIndex = this.dataLength > (startIndex + this.scrollChunkSize) ? (startIndex + this.scrollChunkSize) : this.dataLength;
          this.scrollLoading = true;
          this.getData( this.matSort.active, this.matSort.direction, this.searchTerm || '', startIndex, endIndex).pipe(
            catchError((er) => {
              this.errorActive = true;
              this.scrollLoading = false;
              return of(this.tableDataSource.filteredData);
            })).subscribe((dataInfo)=>{
              this.scrollLoading = false;
              this.dataLength = dataInfo.length;
              this.setTableDataSource(this.tableDataSource.filteredData.concat(dataInfo.items));
            });
        }
      }
    }
  }

  

  sortingDataAccessor = (/**
    * @param {?} data
    * @param {?} sortHeaderId
    * @return {?}
    */
   (data, sortHeaderId) => {
       const MAX_SAFE_INTEGER = 9007199254740991;
       /** @type {?} */
       const columnName = this.columnNamesMapper[sortHeaderId];
       const value = ((/** @type {?} */ (data)))[columnName];
       if (_isNumberValue(value)) {
           /** @type {?} */
           const numberValue = Number(value);
           // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
           // leave them as strings. For more info: https://goo.gl/y5vbSg
           return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
       }
       return value;
   });

   exportToExcel(exporter: MatTableExporterDirective) {
    exporter.exportTable('xlsx', { fileName: this.exportFileName });
  }
}













