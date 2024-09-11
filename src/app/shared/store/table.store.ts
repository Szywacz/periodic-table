import { PeriodicTableService } from '@shared/services/periodic-table.service';
import { PeriodicElement } from '../models/PeriodicElement.model';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, tap, pipe } from 'rxjs';

type TableState = {
  elements: PeriodicElement[];
  selectedElement: PeriodicElement | null;
  loading: boolean;
  searchTerm: string;
};

const initialState: TableState = {
  elements: [],
  selectedElement: null,
  loading: false,
  searchTerm: '',
};

export const TableStore = signalStore(
  { providedIn: 'root' },
  withState<TableState>(initialState),
  withMethods(
    (
      store,
      periodicTableService: PeriodicTableService = inject(PeriodicTableService)
    ) => ({
      async loadElements() {
        patchState(store, { loading: true });
        await periodicTableService.getElements().then((_) =>
          _.subscribe((elements: PeriodicElement[]) => {
            patchState(store, { elements: elements, loading: false });
          })
        );
      },
      applySearchFilter: rxMethod<string>(
        pipe(
          debounceTime(2000),
          distinctUntilChanged(),
          tap((searchTerm) => {
            patchState(store, { searchTerm: searchTerm });
          })
        )
      ),
    })
  ),
  withComputed(({ elements, searchTerm }) => ({
    filteredElements: computed(() => {
      return elements().filter((element) => {
        return Object.values(element).some((value) =>
          String(value).toLowerCase().includes(searchTerm().toLowerCase())
        );
      });
    }),
  }))
);
