import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return (value || '')
      .trim()
      .split(' ')
      .map(word => word[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
