import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

function parseTokenGrid(contents: string): string[] {
	let rows = contents.split(/[\r\n]+/).filter(row => row !== '');
	let rowCount = rows.length;
	let row1 = rows[0];
	let colCount = row1.split(/[\s]+/).filter(value => value !== '').length;
	
	const grid: string[][] = Array.from({ length: rowCount }, () => 
	  Array(colCount).fill('')
	);

	for (let ii = 0; ii < rowCount; ii++){
		let row = rows[ii];
		let values = row.split(/[\s]+/).filter(value => value !== '');
		for (let jj = 0; jj < colCount; jj++){
			grid[ii][jj] = values[jj];
		}
	}
	
	console.log(grid);
	
	return grid;
}

function parseCephalopodGrid(contents: string): string[] {
	let rows = contents.split(/[\r\n]+/).filter(row => row !== '');
	let rowCount = rows.length;
	let row1 = rows[0];
	let characterCount = row1.length;
	
	const grid: string[][] = Array.from({ length: rowCount }, () => []);
	
	let lastDividerIndex = -1;
	for (let colIndex = 0; colIndex < characterCount; colIndex++){
		let allSpaces = true;
		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++){
			if (rows[rowIndex][colIndex] != ' '){
				allSpaces = false;
			}
		}
		if (allSpaces || colIndex == characterCount - 1){
			// take everything from the last divider up to this divider column and add to array
			let newDivider = colIndex;
			if (colIndex == characterCount - 1){
				newDivider++;
			}
			for (let ii = 0; ii < rowCount; ii++){
				let cellValue = '';
				for (let jj = lastDividerIndex + 1; jj < newDivider; jj++){
					cellValue += rows[ii][jj];
				}
				grid[ii].push(cellValue);
			}
			lastDividerIndex = newDivider;
		}
	}
	
	console.log(grid);
	
	return grid;
}

function computeMathSum(contents: string): number {
	let tokenGrid = parseTokenGrid(contents);
	let rowCount = tokenGrid.length;
	let colCount = tokenGrid[0].length;
	
	let runningSum = 0;
	for (let ii = 0; ii < colCount; ii++){
		let operationString = tokenGrid[rowCount - 1][ii];
		if (operationString == '*')
		{
			let columnProduct = 1;
			for (let jj = 0; jj < rowCount - 1; jj++)
			{
				columnProduct *= parseInt(tokenGrid[jj][ii]);
			}
			runningSum += columnProduct;
			console.log(columnProduct);
		}
		else
		{
			let columnSum = 0;
			for (let jj = 0; jj < rowCount - 1; jj++)
			{
				columnSum += parseInt(tokenGrid[jj][ii]);
			}
			runningSum += columnSum;
			console.log(columnSum);
		}
	}
	
	return runningSum;
}

function computeCephalopodMathSum(contents: string): number {
	let tokenGrid = parseCephalopodGrid(contents);
	let rowCount = tokenGrid.length;
	let colCount = tokenGrid[0].length;
	
	let runningSum = 0;
	for (let ii = 0; ii < colCount; ii++){	// looping over each column/problem
		let columnLength = tokenGrid[0][ii].length;
		let operationString = tokenGrid[rowCount - 1][ii].trim();
		let currentProblemRunningValue = 0;
		if (operationString == '*')
		{
			currentProblemRunningValue = 1;
		}
		
		for (let subColumnIndex = 0; subColumnIndex < columnLength; subColumnIndex++){		// looping over each vertical number for the given problem
			// loop over each row to concatenate the current number, then add/multiply it
			let numericString = '';
			for (let rowIndex = 0; rowIndex < rowCount - 1; rowIndex++)
			{
				numericString += tokenGrid[rowIndex][ii][subColumnIndex];
			}
			numericString = numericString.trim();
			if (operationString == '*')
			{
				currentProblemRunningValue *= parseInt(numericString);
			}
			else
			{
				currentProblemRunningValue += parseInt(numericString);
			}
		}
		console.log(`adding ${currentProblemRunningValue}`);
		runningSum += currentProblemRunningValue;
	}
	
	return runningSum;
}

console.log(computeMathSum(inputContents));
console.log(computeCephalopodMathSum(inputContents));
