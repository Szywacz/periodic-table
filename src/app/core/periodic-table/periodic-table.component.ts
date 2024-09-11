import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PeriodicElement } from '@shared/models/PeriodicElement.model';
import { TableStore } from '@shared/store/table.store';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.scss',
})
export class PeriodicTableComponent implements OnInit {
  store = inject(TableStore);

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  initialData: PeriodicElement[] = [];
  dataSource: WritableSignal<PeriodicElement[]> = signal([]);

  ngOnInit() {
    this.store.loadElements();
  }

  applySearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.applySearchFilter(value);
  }
}
