import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

function getInvalidIdSum(contents: string): number {
	let ranges = contents.split(',');
	let invalidIdSum = 0;
	ranges.forEach((range: string) => {
		let rangeValues = range.split('-');
		let min = parseInt(rangeValues[0]);
		let max = parseInt(rangeValues[1]);
		for (let ii = min; ii <= max; ii++){
			let indexString = ii.toString();
			let stringLen = indexString.length;
			if (stringLen % 2 == 0){
				let part1 = indexString.substr(0, stringLen/2);
				let part2 = indexString.substr(stringLen/2, stringLen/2);
				if (part1 == part2){
					invalidIdSum += ii;
				}
			}
		}
	});
	return invalidIdSum;
}

function checkForRepeatedPatternBySize(fullId: string, patternSize: number): boolean {
	let stringLen = fullId.length;
	if (stringLen % patternSize != 0)
	{
		return false;
	}
	else
	{
		let part1 = fullId.substr(0, patternSize);
		let repeatCount = stringLen / patternSize;
		let repeatedString = '';
		for (let ii = 0; ii < repeatCount; ii++){
			repeatedString += part1;
		}
		if (repeatedString == fullId){
			return true;
		}
	}
	return false;
}

function getInvalidIdSumOfAnySizePattern(contents: string): number {
	let ranges = contents.split(',');
	let invalidIdSum = 0;
	ranges.forEach((range: string) => {
		let rangeValues = range.split('-');
		let min = parseInt(rangeValues[0]);
		let max = parseInt(rangeValues[1]);
		for (let ii = min; ii <= max; ii++){
			let indexString = ii.toString();
			let stringLen = indexString.length;
			let invalidIdConfirmed = false;
			for (let patternSize = 1; patternSize <= stringLen / 2; patternSize++){
				if (!invalidIdConfirmed && checkForRepeatedPatternBySize(indexString, patternSize)){
					invalidIdConfirmed = true;
				}
			}
			if (invalidIdConfirmed){
				invalidIdSum += ii;
			}
		}
	});
	return invalidIdSum;
}

console.log(getInvalidIdSum(inputContents));
console.log(getInvalidIdSumOfAnySizePattern(inputContents));
