import { Injectable } from '@angular/core';

@Injectable()
export class PriorityQueueService {
  index: number;
  size: number;
  pq: any[] = [];

  constructor() {
    this.size = 0;
  }

  push(item: any): any {
    this.size === 0 ? this.index = 1 : this.index += 1;
    this.pq[this.index] = item;
    this.size += 1;
    let i = this.index;
    let temp;
    let parent;
    while (i > 0) {
      i % 2 === 0 ? parent = i / 2 : parent = Math.floor( i / 2 );
      if (parent > 0) {
        if (this.pq[i].mh < this.pq[parent].mh) {
          temp = this.pq[i];
          this.pq[i] = this.pq[parent];
          this.pq[parent] = temp;
        }
      }
      i = parent;
    }
    return this.pq;
  }

  pop(): any {
    let min;
    if (this.pq) {
      min = this.pq[1];
      this.pq[1] = this.pq[this.size];
      this.pq.pop();
      this.index -= 1;
      this.size -= 1;
      this.heapify();
    }
    if (this.size < 0) {
      this.size = 0;
    }
    return min;
  }

  heapify(): any {
    let index = 1;
    let left;
    let right;
    let min;
    let temp;
    while (index <= this.size) {
      left = index * 2;
      right = (index * 2) + 1;
      if (!this.pq[left] || !this.pq[right]) { return; }
      this.pq[left].mh < this.pq[right].mh ? min = left : min = right;
      if (this.pq[min].mh < this.pq[index].mh) {
        temp = this.pq[min];
        this.pq[min] = this.pq[index];
        this.pq[index] = temp;
      }
      index = min;
    }
    return this.pq;
  }
}
