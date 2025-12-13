import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

function processPosition(grid: string[], row: number, col: number): string[] {
	if (grid[row][col] == 'S' || grid[row][col] == '|')
	{
		if (grid[row+1][col] == '.')
		{
			grid[row+1] = grid[row+1].slice(0, col) + '|' + grid[row+1].slice(col+1);
		}
		else if (grid[row+1][col] == '^')
		{
			if (col - 1 >= 0)
			{
				grid[row+1] = grid[row+1].slice(0, col-1) + '|' + grid[row+1].slice(col);
			}
			if (col + 1 < grid[row+1].length)
			{
				grid[row+1] = grid[row+1].slice(0, col+1) + '|' + grid[row+1].slice(col+2);
			}
		}
	}
}

function parseManifold(contents: string): string[] {
	let rows = contents.split(/[\r\n]+/).filter(row => row !== '');
	return rows;
}

function logGrid(grid: string[]) {
	for (let ii = 0; ii < grid.length; ii++)
	{
		console.log(grid[ii]);
	}
}

function countSplits(grid: string[]): number {
	let splitCount = 0;
	for (let ii = 1; ii < grid.length; ii++)
	{
		for (let jj = 0; jj < grid[ii].length; jj++)
		{
			if (grid[ii][jj] == '^' & grid[ii-1][jj] == '|')
			{
				splitCount++;
			}
		}
	}
	return splitCount;
}

function traceBeams(contents: string): number {
	let grid = parseManifold(contents);
	for (let ii = 0; ii < grid.length - 1; ii++)
	{
		let row = grid[ii];
		for (let jj = 0; jj < grid[ii].length; jj++)
		{
			processPosition(grid, ii, jj);
		}
	}
	logGrid(grid);
	
	return countSplits(grid);
}

function recurseBeams(grid: string[], row: number, col: number, incomingCount: number, traversal: string, cachedTraversals: number[][]): number {
	if (cachedTraversals[row][col] != 0)
	{
		return cachedTraversals[row][col];
	}
	// for each position of the beam, it will either continue as is, or split and take 1 or 2 paths
	if (row + 1 == grid.length)	// leaf node found
	{
		cachedTraversals[row][col] = 1;
		return 1;
	}
	else if (grid[row+1][col] == '.')
	{
		let traversalCount = recurseBeams(grid, row+1, col, incomingCount, traversal + '-', cachedTraversals);
		cachedTraversals[row][col] = traversalCount;
		return traversalCount;
	}
	else if (grid[row+1][col] == '^')
	{
		let leftPaths = 0;
		let rightPaths = 0;
		if (col - 1 >= 0)
		{
			leftPaths = recurseBeams(grid, row+1, col-1, 0, traversal + '_', cachedTraversals);
		}
		if (col + 1 < grid[row+1].length)
		{
			rightPaths = recurseBeams(grid, row+1, col+1, 0, traversal + '*', cachedTraversals);
		}
		return leftPaths + rightPaths;
		
		let traversalCount = leftPaths + rightPaths;
		cachedTraversals[row][col] = traversalCount;
		return traversalCount;
	}
}

function countBeamPaths(contents: string): number {
	let grid = parseManifold(contents);
	let cachedTraversals: number[][] = Array.from({ length: grid.length }, () => 
	  Array(grid[0].length).fill(0)
	);
	let midpoint = (grid[0].length - 1)/2;
	let numberPaths = recurseBeams(grid, 0, midpoint, 0, '', cachedTraversals);
	return numberPaths;
}

console.log(traceBeams(inputContents));
console.log(countBeamPaths(inputContents));
