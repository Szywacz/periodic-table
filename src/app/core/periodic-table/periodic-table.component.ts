import {
  Component,
  computed,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PeriodicElement } from '@shared/models/PeriodicElement.model';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { PeriodicTableService } from '@shared/services/periodic-table.service';

import { rxState } from '@rx-angular/state';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { rxActions } from '@rx-angular/state/actions';

interface ComponentState {
  elements: PeriodicElement[];
  loading: boolean;
  searchTerm: string;
  error: string | null;
}

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
  constructor(
    private dialog: MatDialog,
    private periodicTableService: PeriodicTableService,
    private snackBar: MatSnackBar
  ) {}

  private actions = rxActions<{
    search: string;
    updateElement: any;
  }>();

  private _state = rxState<ComponentState>(({ set, connect }) => {
    set({
      elements: [],
      loading: false,
      searchTerm: '',
      error: null,
    });

    connect(
      'searchTerm',
      this.actions.search$.pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        catchError((error) => {
          this._state.set({ error: error.message });
          this.showErrorMessage(error.message);
          return '';
        })
      )
    );
  });

  readonly filteredElements = computed(() => {
    const elements = this.elements();
    const searchTerm = this.searchTerm().toLowerCase();
    if (!searchTerm) return elements;
    return elements.filter((element) =>
      Object.values(element).some((value) =>
        String(value).toLowerCase().includes(searchTerm)
      )
    );
  });
  readonly elements = this._state.signal('elements');
  readonly loading = this._state.signal('loading');
  readonly searchTerm = this._state.signal('searchTerm');
  readonly error = this._state.signal('error');

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource: WritableSignal<PeriodicElement[]> = signal([]);

  ngOnInit() {
    this.fetchElements();
  }

  private updateEffect = this.actions.onUpdateElement((element$) =>
    element$.pipe(
      tap(() => this._state.set({ loading: true })),
      switchMap((element) =>
        this.periodicTableService.updateElement(element.id, element).pipe(
          tap((updatedElement) => {
            this._state.set((state) => ({
              elements: state.elements.map((e) =>
                e.id === updatedElement.id ? updatedElement : e
              ),
              loading: false,
            }));
          }),
          catchError((error) => {
            this._state.set({
              error: error.message,
              loading: false,
            });
            this.showErrorMessage(error.message);
            return of(null);
          })
        )
      )
    )
  );

  private fetchElements() {
    this._state.set({ loading: true });
    this._state.connect(
      'elements',
      this.periodicTableService
        .getElements()
        .pipe(tap(() => this._state.set({ loading: false })))
    );
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

    if (!propertyType || !value) return;

    switch (propertyType) {
      case 'number':
        return Number(value);
      case 'string':
        return value.toString();
      default:
        return value;
    }
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  applySearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.actions.search(value);
  }

  openUpdateElementDialog(
    element: PeriodicElement,
    property: keyof PeriodicElement
  ): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title: property, value: element[property] },
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (!result) return;
      const formattedValue = this.formatValue(property, result);
      const newElement = { ...element, [property]: formattedValue };

      if (JSON.stringify(newElement) === JSON.stringify(element)) return;

      this.actions.updateElement(newElement);
    });
  }
}
