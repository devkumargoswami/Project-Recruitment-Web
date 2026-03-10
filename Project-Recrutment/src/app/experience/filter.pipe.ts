import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filterKey: string): any[] {
    if (!items || !filterKey) return items;
    return items.filter(item => item[filterKey] === true);
  }
}