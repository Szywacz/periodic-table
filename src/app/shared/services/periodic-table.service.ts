import { Injectable } from '@angular/core';
import { PeriodicElement } from '../models/PeriodicElement.model';
import { delay, Observable, of } from 'rxjs';
import ELEMENT_DATA from '@shared/data/PeriodicTableData';
@Injectable({
  providedIn: 'root',
})
export class PeriodicTableService {
  constructor() {}

  // Mock get call
  getElements(): Observable<PeriodicElement[]> {
    return of(ELEMENT_DATA).pipe(delay(2000));
  }

  // Mock patch call
  updateElement(
    position: number,
    element: PeriodicElement
  ): Observable<PeriodicElement> {
    console.log('element updated', element);
    return of(element).pipe(delay(200));
  }
}
