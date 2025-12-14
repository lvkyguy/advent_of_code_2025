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

// 0 - unknown tile color
// 1 - red
// 2 - green
// 3 - confirmed to be outside loop
function traverseTilePath(tileGrid: number[][], points: Point[]) {
	tileGrid[points[0].x][points[0].y] = 1;
	let lastPoint = points[0];
	for (let pointIndex = 1; pointIndex < points.length; pointIndex++)
	{
		//console.log(pointIndex);
		//printGrid(tileGrid);
		let point = points[pointIndex];
		tileGrid[point.x][point.y] = 1;
		// everything between point and last point is green
		if (point.x == lastPoint.x && point.y != lastPoint.y)
		{
			let startingIndex = Math.min(point.y, lastPoint.y);
			let endingIndex = Math.max(point.y, lastPoint.y);
			for (let ii = startingIndex + 1; ii < endingIndex; ii++)
			{
				tileGrid[point.x][ii] = 2;
			}
		}
		else if (point.y == lastPoint.y && point.x != lastPoint.x)
		{
			let startingIndex = Math.min(point.x, lastPoint.x);
			let endingIndex = Math.max(point.x, lastPoint.x);
			for (let ii = startingIndex + 1; ii < endingIndex; ii++)
			{
				tileGrid[ii][point.y] = 2;
			}
		}
		lastPoint = point;
	}
}

function markPointsOutsideLoop(tileGrid: number[][], x: number, y: number) {
	tileGrid[x][y] = 3;
	if (x > 0 && tileGrid[x-1][y] == 0)
	{
		markPointsOutsideLoop(tileGrid, x-1, y);
	}
	if (y > 0 && tileGrid[x][y-1] == 0)
	{
		markPointsOutsideLoop(tileGrid, x, y-1);
	}
	if (x + 1 < tileGrid.length && tileGrid[x+1][y] == 0)
	{
		markPointsOutsideLoop(tileGrid, x+1, y);
	}
	if (y + 1 < tileGrid[0].length && tileGrid[x][y+1] == 0)
	{
		markPointsOutsideLoop(tileGrid, x, y+1);
	}
}

function assignLoopInterior(tileGrid: number[][]) {
	for (let ii = 0; ii < tileGrid.length; ii++){
		for (let jj = 0; jj < tileGrid[0].length; jj++){
			if (tileGrid[ii][jj] == 0)
			{
				tileGrid[ii][jj] = 2;
			}
		}
	}
}

function checkRectangleSizesInsideLoop(tileGrid, points): number {
	let largestArea = 0;
	for (let ii = 0; ii < points.length; ii++)
	{
		for (let jj = ii + 1; jj < points.length; jj++)
		{
			if (calculateAreaInsideLoop(tileGrid, points[ii], points[jj]) > largestArea)
			{
				largestArea = calculateAreaInsideLoop(tileGrid, points[ii], points[jj]);
			}
		}
	}
	
	return largestArea;
}

function printGrid(tileGrid: number[][]) {
	tileGrid.forEach(row => {
		let rowStr = '';
		row.forEach(cell => {
			if (cell == 0)
			{
				rowStr += '-';
			}
			else if (cell == 1)
			{
				rowStr += '#';
			}
			else if (cell == 2)
			{
				rowStr += 'X';
			}
			else
			{
				rowStr += ' ';
			}
		});
		console.log(rowStr);
	});
}

function analyzeTileGrid(contents: string): number {
	let points = parseCoordinates(contents);
	let maxX = 0;
	let maxY = 0;
	points.forEach((point: Point) => {
		if (point.x > maxX)
		{
			maxX = point.x;
		}
		if (point.y > maxY)
		{
			maxY = point.y;
		}
	});
	let tileGrid: number[][] = Array.from({ length: maxX + 1 }, () => 
	  Array(maxY + 1).fill(0)
	);

	points.push(points[0]);
	console.log("traversing tile path");
	traverseTilePath(tileGrid, points);
	printGrid(tileGrid);
	console.log("marking outside loop");
	markPointsOutsideLoop(tileGrid, 0, 0);
	printGrid(tileGrid);
	console.log("assigning green inside loop");
	assignLoopInterior(tileGrid);
	printGrid(tileGrid);
	return checkRectangleSizesInsideLoop(tileGrid, points);
}

console.log(checkRectangleSizes(inputContents));
console.log(analyzeTileGrid(inputContents));
