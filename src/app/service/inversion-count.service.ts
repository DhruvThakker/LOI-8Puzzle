import { Injectable } from '@angular/core';

@Injectable()
export class InversionCountService {

  constructor() {
  }

  // modified from https://jsfiddle.net/GRIFFnDOOR/pxu9x/
  // modified from http://www.geeksforgeeks.org/counting-inversions/
  mergeSort(arr): any {
  if (arr.length < 2) {return {arr: arr, inversion: 0}; };
  const mid = Math.floor(arr.length / 2);
  const left = this.mergeSort(arr.slice(0, mid));
  const right = this.mergeSort(arr.slice(mid));
  const inversion = left.inversion + right.inversion;
  return this.merge(left.arr, right.arr, inversion, mid);
  }

  merge(a, b, inversion, mid): any {
    const result = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
      if (a[i] < b[j]) {
        result.push(a[i]);
        i += 1;
      } else {
        result.push(b[j]);
        j += 1;
        inversion += (mid - i);
      }
    }
    while (i < a.length) {
      result.push(a[i]);
      i += 1;
    }
    while (j < b.length) {
      result.push(b[j]);
      j += 1;
    }
    return {arr: result, inversion: inversion};
  }
}

