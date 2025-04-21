import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true, // Marca el pipe como standalone
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, ...keys: string[]): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();
    return items.filter(item =>
      keys.some(key => item[key]?.toString().toLowerCase().includes(searchText))
    );
  }
}