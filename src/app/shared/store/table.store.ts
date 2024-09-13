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
  loading: boolean;
  searchTerm: string;
};

const initialState: TableState = {
  elements: [],
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
        const observable = await periodicTableService.getElements();
        observable.subscribe({
          next: (elements: PeriodicElement[]) => {
              patchState(store, { elements, loading: false });
            },
            error: (error) => {
              console.error(error);
              patchState(store, { loading: false });
            }
          });
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
      async updateElement(
        element: PeriodicElement
      ) {
        patchState(store, { loading: true });
        const observable = await periodicTableService.updateElement(element.id, element);
        observable.subscribe({
            next: (updatedElement) => {
              patchState(store, (state) => ({
                elements: state.elements.map((e) =>
                  e.id === updatedElement.id
                    ? updatedElement
                    : e
                ),
                loading: false,
              }));
            },
            error: (error) => {
              console.error(error);
              patchState(store, { loading: false });
            }
          });
      },
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
