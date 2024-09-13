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
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  dialog = inject(MatDialog);

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource: WritableSignal<PeriodicElement[]> = signal([]);

  ngOnInit() {
    this.store.loadElements();
  }

  applySearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.applySearchFilter(value);
  }

  updateElement(
    element: PeriodicElement,
    property: keyof PeriodicElement
  ): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title: property, value: element[property] },
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === undefined) return;
      const formattedValue = this.formatValue(property, result);
      const newElement = { ...element, [property]: formattedValue };

      if (JSON.stringify(newElement) === JSON.stringify(element)) return;

      this.store.updateElement(newElement);
    });
  }

  private formatValue(
    property: keyof PeriodicElement,
    value: string
  ): string | number | undefined {
    const exampleElement: PeriodicElement = {
      id: 1,
      name: 'Hydrogen',
      position: 1,
      weight: 1.0079,
      symbol: 'H',
    };

    const propertyType = typeof exampleElement[property];

    if (propertyType === undefined || value === undefined) return;

    switch (propertyType) {
      case 'number':
        return Number(value);
      case 'string':
        return value.toString();
      default:
        return value;
    }
  }
}
