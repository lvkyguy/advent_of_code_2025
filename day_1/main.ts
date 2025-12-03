import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

function getTurnToZeroCount(directions: string): number {
	let dialPosition = 50;
	let zeroCount = 0;
	let turns = directions.split(/[\r\n\s]+/);
	turns.forEach((turn: string) => {
		let direction = turn[0];
		let steps = parseInt(turn.substring(1));
		dialPosition = dialPosition + (direction == 'R' ? steps : steps*-1);
		while (dialPosition < 0)
		{
			dialPosition += 100;
		}
		dialPosition %= 100;
		if (dialPosition == 0)
		{
			zeroCount++;
		}
		//console.log(`${turn}: turned ${steps} ticks to ${dialPosition}, zero count ${zeroCount}`);
	});
	return zeroCount;
}

function getTotalZeroTraversals(directions: string): number {
	let dialPosition = 50;
	let zeroCount = 0;
	let turns = directions.split(/[\r\n\s]+/);
	turns.forEach((turn: string) => {
		let startingDialPosition = dialPosition;
		let direction = turn[0];
		let steps = parseInt(turn.substring(1));
		for (let ii = 0; ii < steps; ii++){
			if (direction == 'R')
			{
				dialPosition++;
			}
			else if (direction == 'L')
			{
				dialPosition--;
			}
			if (dialPosition < 0)
			{
				 dialPosition += 100;
			}
			dialPosition %= 100;
			if (dialPosition == 0)
			{
				zeroCount++;
			}
		}
		//console.log(`${turn}: turned ${steps} ticks to ${dialPosition}, zero count ${zeroCount}`);
	});
	return zeroCount;
}

console.log(getTurnToZeroCount(inputContents));
console.log(getTotalZeroTraversals(inputContents));

