import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

class Point {
	public x: number;
	public y: number;

	constructor(coordinateString: string) {
		let values = coordinateString.split(',');
		this.x = parseInt(values[0]);
		this.y = parseInt(values[1]);
	}
}

// 0 - unknown tile color
// 1 - red
// 2 - green
// 3 - confirmed to be outside loop
class GridPoint {
	public x: number;
	public y: number;
	public tileValue: number;

	constructor(xParam: number, yParam: number, tileValueParam: number) {
		this.x = xParam;
		this.y = yParam;
		this.tileValue = tileValueParam;
	}
}

class CondensedTileGrid {
	public grid: GridPoint[][];
	public distinctXPoints: number[];
	public distinctYPoints: number[];

	constructor(gridParam: GridPoint[][], distinctXPointsParam: number[], distinctYPointsParam: number[]) {
		this.grid = gridParam;
		this.distinctXPoints = distinctXPointsParam;
		this.distinctYPoints = distinctYPointsParam;
	}
	
	public getXIndexFromRealPosition(xPos: number) {
		return this.distinctXPoints.findIndex(pt => pt == xPos) + 1;
	}
	
	public getYIndexFromRealPosition(yPos: number) {
		return this.distinctYPoints.findIndex(pt => pt == yPos) + 1;
	}
	
	public markPoint(xPos: number, yPos: number, tileValueParam: number) {
		// look up which index of distinct points this corresponds to
		let xIndex = this.getXIndexFromRealPosition(xPos);
		let yIndex = this.getYIndexFromRealPosition(yPos);
		//console.log(`${xPos} ${yPos} maps to ${xIndex} ${yIndex} `);
		this.grid[xIndex][yIndex].tileValue = tileValueParam;
	}

	public markBetweenTwoPoints(point1: Point, point2: Point, tileValueParam: number) {
		if (point1.x == point2.x && point1.y != point2.y)
		{
			let xIndex = this.getXIndexFromRealPosition(point1.x);
			let startingIndex = Math.min(this.getYIndexFromRealPosition(point1.y), this.getYIndexFromRealPosition(point2.y));
			let endingIndex = Math.max(this.getYIndexFromRealPosition(point1.y), this.getYIndexFromRealPosition(point2.y));
			for (let ii = startingIndex + 1; ii < endingIndex; ii++)
			{
				this.grid[xIndex][ii].tileValue = tileValueParam;
			}
		}
		else if (point1.y == point2.y && point1.x != point2.x)
		{
			let yIndex = this.getYIndexFromRealPosition(point1.y);
			let startingIndex = Math.min(this.getXIndexFromRealPosition(point1.x), this.getXIndexFromRealPosition(point2.x));
			let endingIndex = Math.max(this.getXIndexFromRealPosition(point1.x), this.getXIndexFromRealPosition(point2.x));
			for (let ii = startingIndex + 1; ii < endingIndex; ii++)
			{
				this.grid[ii][yIndex].tileValue = tileValueParam;
			}
		}
	}
	
	public printGrid() {
		this.grid.forEach(row => {
			//console.log(row);
			let rowStr = '';
			row.forEach(cell => {
				if (cell.tileValue == 0)
				{
					rowStr += '-';
				}
				else if (cell.tileValue == 1)
				{
					rowStr += '#';
				}
				else if (cell.tileValue == 2)
				{
					rowStr += 'X';
				}
				else if (cell.tileValue == 3)
				{
					rowStr += ' ';
				}
				else
				{
					rowStr += '?';
				}
			});
			//console.log(rowStr);
		});
	}
	
	public getLargestRectangeInsideLoop(points: Point[]): number {
		let largestArea = 0;
		for (let ii = 0; ii < points.length; ii++)
		{
			for (let jj = ii + 1; jj < points.length; jj++)
			{
				let point1 = points[ii];
				let point2 = points[jj];
				if (this.isRectangeWithinLoop(point1, point2))
				{
					let realArea = (Math.abs(point1.x - point2.x) + 1) * (Math.abs(point1.y - point2.y) + 1);
					if (realArea > largestArea)
					{
						console.log(`found new largest: ${point1.x} ${point1.y} ${point2.x} ${point2.y} `);
						largestArea = realArea;
					}
				}
			}
		}
		
		return largestArea;
	}

	public isRectangeWithinLoop(point1: Point, point2: Point): boolean {
		let point1XIndex = this.getXIndexFromRealPosition(point1.x);
		let point1YIndex = this.getYIndexFromRealPosition(point1.y);
		let point2XIndex = this.getXIndexFromRealPosition(point2.x);
		let point2YIndex = this.getYIndexFromRealPosition(point2.y);
		
		let minX = Math.min(point1XIndex, point2XIndex);
		let maxX = Math.max(point1XIndex, point2XIndex);
		let minY = Math.min(point1YIndex, point2YIndex);
		let maxY = Math.max(point1YIndex, point2YIndex);
		
		let valid = true;
		for (let ii = minX; ii <= maxX && valid; ii++){
			for (let jj = minY; jj <= maxY && valid; jj++){
				if (this.grid[ii][jj].tileValue == 3)
				{
					valid = false;
				}
			}
		}
		return valid;
	}
}

function parseCoordinates(contents: string): Point[] {
	let rows = contents.split(/[\r\n]+/).filter(row => row !== '');
	let points = [];
	rows.forEach((row: string) => {
		points.push(new Point(row));
	});
	return points;
}

function calculateArea(point1: Point, point2: Point): number {
	return (Math.abs(point1.x - point2.x) + 1) * (Math.abs(point1.y - point2.y) + 1);
}

function calculateAreaInsideLoop(tileGrid: number[][], point1: Point, point2: Point): number {
	let minX = Math.min(point1.x, point2.x);
	let maxX = Math.max(point1.x, point2.x);
	let minY = Math.min(point1.y, point2.y);
	let maxY = Math.max(point1.y, point2.y);
	let disqualified = false;
	for (let ii = minX; ii <= maxX && !disqualified; ii++){
		for (let jj = minY; jj <= maxY && !disqualified; jj++){
			if (tileGrid[ii][jj] == 3)
			{
				disqualified = true;
			}
		}
	}
	return (disqualified ? 0 : (Math.abs(point1.x - point2.x) + 1) * (Math.abs(point1.y - point2.y) + 1));
}

function checkRectangleSizes(contents: string): number {
	let points = parseCoordinates(contents);
	let largestArea = 0;
	for (let ii = 0; ii < points.length; ii++)
	{
		for (let jj = ii + 1; jj < points.length; jj++)
		{
			if (calculateArea(points[ii], points[jj]) > largestArea)
			{
				largestArea = calculateArea(points[ii], points[jj]);
			}
		}
	}
	
	return largestArea;
}

function traverseTilePath(tileGrid: CondensedTileGrid, points: Point[]) {
	// mark the origin point red
	tileGrid.markPoint(points[0].x, points[0].y, 1);
	//console.log(0);
	tileGrid.printGrid();
	let lastPoint = points[0];
	for (let pointIndex = 1; pointIndex < points.length; pointIndex++)
	{
		//console.log(pointIndex);
		tileGrid.printGrid();
		let point = points[pointIndex];
		tileGrid.markPoint(point.x, point.y, 1);
		// everything between point and last point is green
		tileGrid.markBetweenTwoPoints(point, lastPoint, 2);
		lastPoint = point;
	}
}

function countPointsOutsideLoop(tileGrid: CondensedTileGrid) {
	let counter = 0;
	for (let ii = 0; ii < tileGrid.grid.length; ii++){
		for (let jj = 0; jj < tileGrid.grid[0].length; jj++){
			if (tileGrid.grid[ii][jj].tileValue == 3)
			{
				counter++;
			}
		}
	}
	return counter;
}

function markImmediateSurroundingsOutsideLoop(tileGrid: CondensedTileGrid, x: number, y: number) {
	if (x > 0 && tileGrid.grid[x-1][y].tileValue == 0)
	{
		tileGrid.grid[x-1][y].tileValue = 3;
	}
	if (y > 0 && tileGrid.grid[x][y-1].tileValue == 0)
	{
		tileGrid.grid[x][y-1].tileValue = 3;
	}
	if (x + 1 < tileGrid.grid.length && tileGrid.grid[x+1][y].tileValue == 0)
	{
		tileGrid.grid[x+1][y].tileValue = 3;
	}
	if (y + 1 < tileGrid.grid[0].length && tileGrid.grid[x][y+1].tileValue == 0)
	{
		tileGrid.grid[x][y+1].tileValue = 3;
	}
}

function markPointsOutsideLoop(tileGrid: CondensedTileGrid, x: number, y: number) {
	tileGrid.grid[x][y].tileValue = 3;
	//tileGrid.printGrid();
	let outsideLoopCount = countPointsOutsideLoop(tileGrid);
	let stableCount = false;
	
	while (!stableCount)
	{
		for (let ii = 0; ii < tileGrid.grid.length; ii++){
			for (let jj = 0; jj < tileGrid.grid[0].length; jj++){
				if (tileGrid.grid[ii][jj].tileValue == 3)
				{
					markImmediateSurroundingsOutsideLoop(tileGrid, ii, jj);
				}
			}
		}
		let lastCount = outsideLoopCount;
		outsideLoopCount = countPointsOutsideLoop(tileGrid);
		if (lastCount == outsideLoopCount)
		{
			stableCount = true;
		}
		//tileGrid.printGrid();
	}
}

function assignLoopInterior(tileGrid: CondensedTileGrid) {
	for (let ii = 0; ii < tileGrid.grid.length; ii++){
		for (let jj = 0; jj < tileGrid.grid[0].length; jj++){
			if (tileGrid.grid[ii][jj].tileValue == 0)
			{
				tileGrid.grid[ii][jj].tileValue = 2;
			}
		}
	}
}

function padDistinctPoints(pts: number[]) {
	for (let ii = pts.length - 1; ii >= 0; ii--)
	{
		if (pts[ii+1] > pts[ii] + 1){
			pts.splice(ii+1, 0, pts[ii] + 1);
		}
	}
}

function buildCondensedTileGrid(points: Point[]): CondensedTileGrid {
	let distinctXPoints = Array.from(new Set(points.map(point => point.x))).sort((a, b) => a - b);
	let distinctYPoints = Array.from(new Set(points.map(point => point.y))).sort((a, b) => a - b);
	//console.log(distinctXPoints);
	//console.log(distinctYPoints);
	padDistinctPoints(distinctXPoints);
	padDistinctPoints(distinctYPoints);
	//console.log(distinctXPoints);
	//console.log(distinctYPoints);
	
	console.log(`allocation points array: ${distinctXPoints.length} ${distinctYPoints.length}`);
	let gridPoints: GridPoint[][] = [];//Array.from({ length: distinctXPoints.length + 2 }, () => 
	//  Array(distinctYPoints.length + 2).fill(new GridPoint(0,0,0))
	//);
	for (let rowIndex = 0; rowIndex < distinctXPoints.length + 2; rowIndex++) {
		gridPoints[rowIndex] = []; 
		for (let colIndex = 0; colIndex < distinctYPoints.length + 2; colIndex++) {
			gridPoints[rowIndex][colIndex] = new GridPoint(0, 0, 0);
		}
	}
	
	for (let ii = 0; ii < distinctXPoints.length; ii++)
	{
		for (let jj = 0; jj < distinctYPoints.length; jj++)
		{
			gridPoints[ii+1][jj+1].x = distinctXPoints[ii];
			gridPoints[ii+1][jj+1].y = distinctYPoints[jj];
		}
	}
	let grid = new CondensedTileGrid(gridPoints, distinctXPoints, distinctYPoints);
	
	return grid;
}

function analyzeTileGrid(contents: string): number {
	let points = parseCoordinates(contents);
	console.log("building condensed grid");
	let condensedTileGrid = buildCondensedTileGrid(points);
	condensedTileGrid.printGrid();
	points.push(points[0]);
	console.log("traversing tile path");
	traverseTilePath(condensedTileGrid, points);
	condensedTileGrid.printGrid();
	console.log("marking outside loop");
	markPointsOutsideLoop(condensedTileGrid, 0, 0);
	condensedTileGrid.printGrid();
	console.log("assigning green inside loop");
	assignLoopInterior(condensedTileGrid);
	condensedTileGrid.printGrid();
	return condensedTileGrid.getLargestRectangeInsideLoop(points);
}

console.log(checkRectangleSizes(inputContents));
console.log(analyzeTileGrid(inputContents));
