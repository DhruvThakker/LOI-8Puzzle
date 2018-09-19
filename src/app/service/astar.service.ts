import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { InversionCountService } from './inversion-count.service';
import { PriorityQueueService } from './priority-queue.service';

export interface State {
  puzzle: number[][];
  blankSpace: {row: number, column: number};
  direction: string;
  mh: number;
}
export interface BlankSpace {
  row: number,
  column: number,
}
export interface NumberAndAction {
  number: number;
  blankSpace: BlankSpace;
  action: string;
  puzzle: number[][];
}

@Injectable()
export class AStarService {
  openList: {[puzzle: string]: any} = {};
  closedList: {[puzzle: string]: any} = {};
  goalState: State;
  initialState: State;
  treePath: {[childPuzzle: string]: any} = {};
  heuristicIndex: number;
  constructor(
    private priorityQueue: PriorityQueueService,
    private inversionService: InversionCountService) {
  }

  generateGoalState(num: number) {
    let index = 0;
    const total = (num * num) - 1;
    let tempArr = [];
    const goalS = [];
    while (index < total) {
      tempArr.push(index + 1);
      if ((index + 1) % (num) === 0) {
        goalS.push(tempArr);
        tempArr = [];
      }
      index += 1;
    }
    tempArr[num - 1] = 0;
    goalS.push(tempArr);
    this.goalState = {puzzle: goalS, blankSpace: null, direction: null, mh: 0};
  };

  /**
   * Fisher-Yates Shuffle
   * http://stackoverflow.com/questions/2450954
   * /how-to-randomize-shuffle-a-javascript-array
   * @param num
   */
  generateInitialState(num: number) {
    const flatGoalStateArr = this.flatten(this.goalState.puzzle);
    let currentIndex = flatGoalStateArr.length, tempVal, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      tempVal = flatGoalStateArr[currentIndex];
      flatGoalStateArr[currentIndex] = flatGoalStateArr[randomIndex];
      flatGoalStateArr[randomIndex] = tempVal;
    }
    let tempArr = [];
    const initState = [];
    let row = 0;
    const blankSpace: {row: number, column: number} = {row: 0, column: 0};
    flatGoalStateArr.forEach((itemN, i) => {
      tempArr.push(itemN);
      if (itemN === 0) {
        blankSpace.column = i % num;
        blankSpace.row = row;
      }
      if ((i + 1) % num === 0) {
        initState.push(tempArr);
        tempArr = [];
        row += 1;
      }
    });
    this.initialState = {puzzle: initState, blankSpace: blankSpace, direction: null, mh: 0};
  }

  generateSuccessors(puzzle: number[][], blankSpace: BlankSpace, N: number): State[] {
    const directionString = ['left', 'right', 'up', 'down'];
    const listOFSuccessors: any[] = [];
    directionString.forEach(eachString => {
      const pos = this.getDirection(eachString, blankSpace);
      if (pos.column >= N || pos.column < 0 || pos.row >= N || pos.row < 0) {
      } else {
        const clonedArray = JSON.parse(JSON.stringify(puzzle));
        clonedArray[blankSpace.row][blankSpace.column] = clonedArray[pos.row][pos.column];
        clonedArray[pos.row][pos.column] = 0;
        listOFSuccessors.push({puzzle: clonedArray, blankSpace: pos, direction: eachString, mh: 0});
      }
    });
    return listOFSuccessors;
  }

  getDirection(direction: string, blankSpace: BlankSpace): BlankSpace {
    if (direction === 'left') {
      return {row: blankSpace.row, column: blankSpace.column - 1};
    }
    if (direction === 'right') {
      return {row: blankSpace.row, column: blankSpace.column + 1};
    }
    if (direction === 'up') {
      return {row: blankSpace.row - 1, column: blankSpace.column};
    }
    if (direction === 'down') {
      return {row: blankSpace.row + 1, column: blankSpace.column};
    }
  }
  calculatePuzzleHeuristic(puzzle: number[][], hindex: number) {
    if (hindex === 0) {
      console.log('Manhattan');
      return this.calculatePuzzleManhattanHeuristic(puzzle);
    }
    if (hindex === 1) {
      console.log('Hamming');
      return this.calculatePuzzleHammingHeuristic(puzzle);
    }
    if (hindex === 2) {
      console.log('Euclidean');
      return this.calculatePuzzleEuclideanHeuristic(puzzle);
    }
  }
  calculatePuzzleManhattanHeuristic(puzzle: number[][]): number {
    let total = 0;
    const truePosition  = this.determineTruePositions();
    let trueXY, currentXY, currentNumber;
    for (let row = 0; row < puzzle.length; row++) {
      for (let column = 0; column < puzzle[row].length; column++) {
        currentNumber = puzzle[row][column];
        if (currentNumber !== 0) {
          currentXY = {row: row, column: column};
          trueXY = truePosition[currentNumber];
          total += this.calculateManhattanHeuristic(currentXY, trueXY);
        }
      }
    }
    return total;
  }

  calculateManhattanHeuristic(trueXY: BlankSpace, currentXY: BlankSpace) {
    return Math.abs(trueXY.row - currentXY.row)
      + Math.abs(trueXY.column - currentXY.column);
  }

  calculatePuzzleHammingHeuristic(puzzle: number[][]): number {
    let total = 0;
    const truePosition  = this.determineTruePositions();
    let trueXY, currentXY, currentNumber;
    for (let row = 0; row < puzzle.length; row++) {
      for (let column = 0; column < puzzle[row].length; column++) {
        currentNumber = puzzle[row][column];
        if (currentNumber !== 0) {
          currentXY = {row: row, column: column};
          trueXY = truePosition[currentNumber];
          total += this.calculateHammingHeuristic(currentXY, trueXY);
        }
      }
    }
    return total;
  }

  calculateHammingHeuristic(trueXY: BlankSpace, currentXY: BlankSpace) {
    if (trueXY.row !== currentXY.row || trueXY.column !== currentXY.column) {
      return 1;
    } else {
      return 0;
    }
  }

  calculatePuzzleEuclideanHeuristic(puzzle: number[][]): number {
    let total = 0;
    const truePosition  = this.determineTruePositions();
    let trueXY, currentXY, currentNumber;
    for (let row = 0; row < puzzle.length; row++) {
      for (let column = 0; column < puzzle[row].length; column++) {
        currentNumber = puzzle[row][column];
        if (currentNumber !== 0) {
          currentXY = {row: row, column: column};
          trueXY = truePosition[currentNumber];
          total += this.calculateEuclideanHeuristic(currentXY, trueXY);
        }
      }
    }
    return total;
  }

  calculateEuclideanHeuristic(trueXY: BlankSpace, currentXY: BlankSpace) {
    return Math.pow(trueXY.row - currentXY.row, 2)
      + Math.pow(trueXY.column - currentXY.column, 2);
  }

  determineTruePositions() {
    const truePosition: {[tileNum: number]: {row: number, column: number}} = {};
    let currentNum;
    for (let row = 0; row < this.goalState.puzzle.length; row++) {
      for (let column = 0; column < this.goalState.puzzle[row].length; column++) {
        currentNum = this.goalState.puzzle[row][column];
        truePosition[currentNum] = {row: row, column: column};
      }
    }
    return truePosition;
  }

  checkIfGoalState(state: State) {
    if (!isNullOrUndefined(state)) {
      let isGoal = true;
      const goalStateFlattend = this.flatten(this.goalState.puzzle);
      const puzzleState = this.flatten(state.puzzle);
      goalStateFlattend.forEach((number, i) => {
        if (puzzleState[i] !== number) {
          isGoal = false;
        }
      });
      return isGoal;
    } else {
      return false;
    }
  }

  checkIfVisitedState(puzzle: Array<Array<number>>, type: string) {
    const puzzleString = puzzle.toString();
    let result;
    if (type === 'closed') {
      result = this.closedList[puzzleString];
    }
    if (type === 'open') {
      result = this.openList[puzzleString];
    }
    return !isNullOrUndefined(result);
  }

  checkIfSolvable(puzzle: number[][], row: number, N: number) {
    const flatPuzzle = this.flatten(puzzle).filter(item => item !== 0);
    const result = this.inversionService.mergeSort(flatPuzzle);
    if (N % 2 === 0) {
      const sum = result.inversion + row;
      return sum % 2 === 1;
    } else {
      return result.inversion % 2 === 0;
    }
  }

  aStarAlgo(N: number): any {
    this.openList[this.initialState.puzzle.toString()] = this.initialState;
    this.priorityQueue.push(this.initialState);
    let current;
    let successors = [];
    let inOpen: boolean;
    let inClosed: boolean;
    const cachedMH: {[puzzle: string]: any} = {};
    const cost = -1;
    let mh = 0;
    this.treePath = {};
    while (Object.keys(this.openList).length > 0) {
      current = this.priorityQueue.pop();
      if (isNullOrUndefined(current) || this.checkIfGoalState(current)) {
        this.openList = {};
      } else {
        if (isNullOrUndefined(current.cost)) {
          current['cost'] = 0;
        }
        delete this.openList[current.puzzle.toString()];
        this.closedList[current.puzzle.toString()] = current;
        successors = this.generateSuccessors(current.puzzle, current.blankSpace, N);
        successors.map(successor => {
          inClosed = this.checkIfVisitedState(successor.puzzle, 'closed');
          inOpen = this.checkIfVisitedState(successor.puzzle, 'open');
          if (!inClosed && !inOpen) {
            mh = this.calculatePuzzleHeuristic(successor.puzzle, this.heuristicIndex);
            successor['cost'] = current.cost + 1;
            successor.mh = mh;
            this.openList[successor.puzzle.toString()] = successor;
            this.treePath[successor.puzzle.toString()] = {
              direction: successor.direction, parent: current.puzzle.toString()};
            const tempSuccessor = JSON.parse(JSON.stringify(successor));
            tempSuccessor.mh = mh + successor.cost;
            this.priorityQueue.push(tempSuccessor);
            cachedMH[successor.puzzle.toString()] = mh;
          }
        });
      }
    }
    const actionList = this.getActionList();
    const numberAndActionList = this.getNumberAndActionList(actionList);
    this.openList = {};
    this.closedList = {};
    this.priorityQueue.pq = [];
    this.priorityQueue.size = 0;
    return {actionList: actionList, numbersAndActions: numberAndActionList};
  }

  /**
   * https://en.wikipedia.org/wiki/Iterative_deepening_A*
   * https://plus.google.com/+JulienDramaix/posts/4vLG9oghrLy
   * https://algorithmsinsight.wordpress.com/graph-theory-2/ida-star-algorithm-in-general/
   * @param N
   * @returns {number}
   * @constructor
   */
  IDA(N): any {
    let threshold = this.calculatePuzzleHeuristic(this.initialState.puzzle, this.heuristicIndex);
    const FOUND = -1;
    while (true) {
      let temp = this.idaSearch(this.goalState, 0, threshold, N);
      if (temp === FOUND) {
        return FOUND;
      }
      if (temp === Number.POSITIVE_INFINITY) {
        return;
      }
      threshold = temp;
    }
  }

  idaSearch(state, g, threshold, N) {
    const FOUND = -1;
    let f = g + this.calculatePuzzleHeuristic(state.puzzle, this.heuristicIndex);
    if (f > threshold) {
      return f;
    }
    if (this.checkIfGoalState(state)) {
      return FOUND;
    }
    let min = Number.POSITIVE_INFINITY;
    let successors = this.generateSuccessors(state.puzzle, state.blankSpace, N);
    successors.map(successor => {
      let temp = this.idaSearch(successor, g + 1, threshold, N);
      if (temp === FOUND) {
        return FOUND;
      }
      if (temp < min) {
        min = temp;
      }
    });
    return min;
  }


  getActionList(): string[] {
    let actionList = [];
    let child = this.goalState.puzzle.toString();
    let childNode;
    while (child !== this.initialState.puzzle.toString()) {
      childNode = this.treePath[child];
      actionList.push(childNode.direction);
      child = childNode.parent;
    }
    actionList = actionList.reverse();
    return actionList;
  }

  getNumberAndActionList(actionList: string[]): NumberAndAction[] {
    const numberAndActionList = [];
    let puzzle = this.initialState.puzzle;
    let blankSpace = this.initialState.blankSpace;
    let result;
    actionList.map(item => {
      result = this.getNumberAndAction(puzzle, blankSpace, item);
      puzzle = result.puzzle;
      blankSpace = result.blankSpace;
      numberAndActionList.push({numberAsString: result.number, action: result.action});
    });
    return numberAndActionList;
  }

  getNumberAndAction(inputPuzzle: number[][], blankSpace: any, action: string): NumberAndAction {
    const puzzle = JSON.parse(JSON.stringify(inputPuzzle));
    const newBlankSpace = this.getDirection(action, blankSpace);
    const num = puzzle[newBlankSpace.row][newBlankSpace.column].toString();
    this.swap(puzzle, blankSpace, newBlankSpace);
    let newAction = '';
    switch (action) {
      case 'left': newAction = 'right';
        break;
      case 'right': newAction = 'left';
        break;
      case 'up': newAction = 'down';
        break;
      default: newAction = 'up';
        break;
    }
    return {number: num, blankSpace: newBlankSpace, action: newAction, puzzle: puzzle};
  }

  swap(puzzle, currentXY, newXY) {
    const currRow = currentXY.row;
    const currCol = currentXY.column;
    const newRow = newXY.row;
    const newCol = newXY.column;
    const temp = puzzle[currRow][currCol];
    puzzle[currRow][currCol] = puzzle[newRow][newCol];
    puzzle[newRow][newCol] = temp;
  }

  flatten (arrInput: Array<Array<number>>): number[] {
    const flatten = arr =>
      arr.reduce((acc, val) =>
        acc.concat(Array.isArray(val) ? flatten(val) : val), []);
    return flatten(arrInput);
  }
}
