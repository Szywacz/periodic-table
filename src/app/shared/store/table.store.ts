import { PeriodicElement } from '../models/PeriodicElement.model';
import { signalStore, withState } from '@ngrx/signals';

type TableState = {
  elements: PeriodicElement[];
  selectedElement: PeriodicElement | null;
  loading: boolean;
};

const initialState: TableState = {
  elements: [],
  selectedElement: null,
  loading: false,
};

export const TableStore = signalStore(
  { providedIn: 'root' },
  withState<TableState>(initialState)
);
