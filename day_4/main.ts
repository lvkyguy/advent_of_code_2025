import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

function buildGridOfRolls(contents: string): boolean[][] {
	let rows = contents.split(/[\r\n\s]+/);
	let rowCount = rows.length;
	let column1 = rows[0];
	let colCount = column1.length;
	
	const grid: boolean[][] = Array.from({ length: rowCount }, () => 
	  Array(colCount).fill(false)
	);

	for (let ii = 0; ii < rowCount; ii++){
		for (let jj = 0; jj < colCount; jj++){
			if (rows[ii][jj] == '@'){
				grid[ii][jj] = true;
			}
		}
	}
	
	return grid;
}

function checkCellWithSafeguards(grid: boolean[][], rowToCheck: number, colToCheck: number): boolean {
	if (rowToCheck >= 0 && colToCheck >= 0 && rowToCheck < grid.length && colToCheck < grid[0].length){
		return grid[rowToCheck][colToCheck];
	}
	return false;
}

function checkCellForAccess(grid: boolean[][], rowToCheck: number, colToCheck: number): boolean {
	let rowCount = grid.length;
	let colCount = grid[0].length;
	let surroundingRolls = 0;
	if (checkCellWithSafeguards(grid, rowToCheck-1, colToCheck-1)){
		surroundingRolls++;
	}
	if (checkCellWithSafeguards(grid, rowToCheck-1, colToCheck)){
		surroundingRolls++;
	}
	if (checkCellWithSafeguards(grid, rowToCheck-1, colToCheck+1)){
		surroundingRolls++;
	}
	if (checkCellWithSafeguards(grid, rowToCheck, colToCheck-1)){
		surroundingRolls++;
	}
	if (checkCellWithSafeguards(grid, rowToCheck, colToCheck+1)){
		surroundingRolls++;
	}
	if (checkCellWithSafeguards(grid, rowToCheck+1, colToCheck-1)){
		surroundingRolls++;
	}
	if (checkCellWithSafeguards(grid, rowToCheck+1, colToCheck)){
		surroundingRolls++;
	}
	if (checkCellWithSafeguards(grid, rowToCheck+1, colToCheck+1)){
		surroundingRolls++;
	}
	return (checkCellWithSafeguards(grid, rowToCheck, colToCheck) && surroundingRolls < 4);
}

function countAccessibleRollsFromGrid(grid: boolean[][]): number {
	let rowCount = grid.length;
	let colCount = grid[0].length;
	let accessibleRolls = 0;
	
	for (let ii = 0; ii < rowCount; ii++){
		for (let jj = 0; jj < colCount; jj++){
			if (checkCellForAccess(grid, ii, jj)){
				accessibleRolls++;
			}
		}
	}
	return accessibleRolls;
}

function countAccessibleRolls(contents: string): number {
	let grid = buildGridOfRolls(contents);
	return countAccessibleRollsFromGrid(grid);
}

function countRemovableRolls(contents: string): number {
	let grid = buildGridOfRolls(contents);
	let accessibleRolls = countAccessibleRollsFromGrid(grid);

	let removedRolls = 0;
	while (accessibleRolls > 0){
		// loop through grid, find and flip accessible rolls, add to the count of removed rolls, recount accessible rolls
		for (let ii = 0; ii < grid.length; ii++){
			for (let jj = 0; jj < grid[0].length; jj++){
				if (checkCellForAccess(grid, ii, jj)){
					removedRolls++;
					grid[ii][jj] = false;
				}
			}
		}
		accessibleRolls = countAccessibleRollsFromGrid(grid);
	}
	
	return removedRolls;
}

console.log(countAccessibleRolls(inputContents));
console.log(countRemovableRolls(inputContents));
