import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

class Range {
  public min: number;
  public max: number;

  constructor(rangeString: string) {
	let values = rangeString.split('-');
	this.min = parseInt(values[0]);
	this.max = parseInt(values[1]);
  }

  public isNumberInRange(input: number): boolean {
	return (input >= this.min && input <= this.max);
  }
}

function populateRanges(contents: string): Range[] {
	let rows = contents.split(/[\r\n\s]+/);
	let ranges = [];
	rows.forEach((row: string) => {
		if (row.includes('-'))
		{
			ranges.push(new Range(row));
		}
	});
	return ranges;
}

function countTotalIngredients(ranges: Range[]): number {
	let totalFreshIngredientCount = 0;
	ranges.forEach((range: Range) => {
		totalFreshIngredientCount += (range.max - (range.min - 1));
		//console.log(`${range.min} ${range.max} ${totalFreshIngredientCount}`);
	});
	return totalFreshIngredientCount;
}

function canConsolidate(ranges: Range[]): boolean {
	ranges.sort((a, b) => a.min - b.min);
	for (let ii = ranges.length - 1; ii > 0; ii--)
	{
		if (ranges[ii].min <= (ranges[ii-1].max + 1))
		{
			return true;
		}
	}
	return false;
}

function consolidateRanges(ranges: Range[]): Range[] {
	ranges.sort((a, b) => a.min - b.min);
	for (let ii = ranges.length - 1; ii > 0; ii--)
	{
		//console.log(`${ii} comparing ${ranges[ii].min} ${ranges[ii-1].max}`);
		// merge this range with the prior range if they overlap
		if (ranges[ii].min <= (ranges[ii-1].max + 1))
		{
			if (ranges[ii].max > ranges[ii-1].max)
			{
				ranges[ii-1].max = ranges[ii].max;
			}
			ranges.splice(ii, 1);
			//console.log(`${ii}: ${inputRange1Str} vs ${inputRange2Str} - Merging down to ${ranges.length} ranges {ranges[ii-1]}`);
		}
	}
	return ranges;
}

function populateIngredients(contents: string): Number[] {
	let rows = contents.split(/[\r\n\s]+/);
	let ingredients = [];
	rows.forEach((row: string) => {
		if (!row.includes('-'))
		{
			ingredients.push(parseInt(row));
		}
	});
	return ingredients;
}

function countFreshIngredients(contents: string): number {
	let ranges = populateRanges(contents);
	let ingredients = populateIngredients(contents);
	while (canConsolidate(ranges)){
		ranges = consolidateRanges(ranges);
	}
	
	let freshIngredientCount = 0;
	ingredients.forEach((ingredient: number) => {
		let fresh = false;
		ranges.forEach((range: Range) => {
			if (!fresh){
				if (range.isNumberInRange(ingredient))
				{
					fresh = true;
				}
			}
		});
		if (fresh)
		{
			freshIngredientCount++;
		}
	});
	
	return freshIngredientCount;
}

function countPossibleFreshIngredients(contents: string): number {
	let ranges = populateRanges(contents);
	while (canConsolidate(ranges)){
		ranges = consolidateRanges(ranges);
	}
	return countTotalIngredients(ranges);
}

console.log(countFreshIngredients(inputContents));
console.log(countPossibleFreshIngredients(inputContents));
