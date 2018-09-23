import { Component, OnInit, ElementRef, Renderer, QueryList, AfterViewInit, ViewChildren } from '@angular/core';
import { AStarService } from './service/astar.service';
import { isNullOrUndefined } from 'util';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  puzzle: number[]  = [];
  actionsList: string[];
  numbersAndActionsList: {numberAsString: string, action: string}[];
  showResults: boolean;
  elDict: {[ID: string]: ElementRef}[];
  N: number;
  generateCount: number;
  heuristicList: string[];
  myMoves: number;
  running: boolean;
  @ViewChildren('numInSquare') elList: QueryList<ElementRef>;

  constructor(private aStar: AStarService, private render: Renderer) {
  }

  ngOnInit() {
    this.showResults = false;
    this.actionsList = [];
    this.numbersAndActionsList = [];
    this.elDict = [];
    this.N = 3;
    this.generateCount = 0;
    this.myMoves = 0;
    this.running = false;
    this.generate();
    this.heuristicList = [ 'Manhattan', 'Hamming', 'Eucledian' ];
    this.aStar.heuristicIndex = 0;
  }

  onHeuristicChange(heuristic) {
    if (heuristic === 'Manhattan') {
      this.aStar.heuristicIndex = 0;
    }
    if (heuristic === 'Hamming') {
      this.aStar.heuristicIndex = 1;
    }
    if (heuristic === 'Eucledian') {
      console.log('Eucledian');
      this.aStar.heuristicIndex = 2;
    }
  }

  ngAfterViewInit() {
    this.elList.map((item: ElementRef) => {
      this.elDict[item.nativeElement.id] = item.nativeElement;
    });
  }

  regenerate() {
    this.generateCount += 1;
    this.actionsList = [];
    this.elList.map(item => {
      this.render.setElementStyle(item.nativeElement, 'transform', 'translate(0,0)');
    });
    this.generate();
  }

  generate() {
    this.myMoves = 0;
    this.showResults = false;
    this.aStar.generateGoalState(this.N);
    do {
      this.aStar.generateInitialState(this.N);
    } while (!this.aStar.checkIfSolvable(this.aStar.initialState.puzzle, this.aStar.initialState.blankSpace.row, this.N));
    this.showResults = false;
    this.puzzle = this.aStar.flatten(this.aStar.initialState.puzzle);
  }

  solve() {
    console.log('Clicked');
    this.running = true;
    this.showResults = true;
    const result = this.aStar.aStarAlgo(this.N);
    this.actionsList = result.actionList;
    this.myMoves = this.actionsList.length;
    this.numbersAndActionsList = result.numbersAndActions;
    const translateXDict: {[action: string]: number} = {};
    const translateYDict: {[action: string]: number} = {};
    let x;
    let y;
    const steps = 106;
    let nativeEl;
    for (let i = 0; i < this.numbersAndActionsList.length; i += 1) {
      setTimeout(() => {
        const item = this.numbersAndActionsList[i];
        nativeEl = this.elDict[item.numberAsString];
        if (isNullOrUndefined(translateXDict[item.numberAsString])) {
          translateXDict[item.numberAsString] = 0;
        }
        if (isNullOrUndefined(translateYDict[item.numberAsString])) {
          translateYDict[item.numberAsString] = 0;
        }
        x = translateXDict[item.numberAsString];
        y = translateYDict[item.numberAsString];
        switch (item.action) {
          case 'left': x -= steps; break;
          case 'right': x += steps; break;
          case 'up': y -= steps; break;
          case 'down': y += steps; break;
        }
        translateXDict[item.numberAsString] = x;
        translateYDict[item.numberAsString] = y;
        this.render.setElementStyle(nativeEl, 'transform', 'translate(' + x + '%,' + y + '%');
      }, 450 * (i + 1));
    }
    const llen = this.numbersAndActionsList.length; 
    setTimeout(() => {
      this.running = false;
    }, 450 * (llen));
  }

  reset() {
    this.actionsList = [];
    this.myMoves = 0;
    this.elList.map(item => {
      this.render.setElementStyle(item.nativeElement, 'transform', 'translate(0,0)');
    });
  }

  // For testing N > this.N
  test() {
    this.showResults = false;
    this.aStar.generateGoalState(4);
    do {
      this.aStar.generateInitialState(4);
    } while (!this.aStar.checkIfSolvable(this.aStar.initialState.puzzle, this.aStar.initialState.blankSpace.row, 4));
    // this.puzzle = this.aStar.flatten(this.aStar.initialState.puzzle);
    // const result = this.aStar.aStarAlgo(this.N);
    // console.log(result);
    debugger;
    this.aStar.IDA(4);
  }
}

