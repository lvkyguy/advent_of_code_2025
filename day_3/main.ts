import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

function pickFirstHighestBatteryDigitPosition(remainingBattery: string, endingDigitsToIgnore: number): number {
	let optionsSubstring = remainingBattery.substring(0, remainingBattery.length - endingDigitsToIgnore);
	let characters = optionsSubstring.split('');
	let highestDigitFound = parseInt(characters[0]);
	let highestDigitFoundPosition = 0;
	for (let characterIndex = 1; characterIndex < characters.length; characterIndex++){
		if (parseInt(characters[characterIndex]) > highestDigitFound){
			highestDigitFound = parseInt(characters[characterIndex]);
			highestDigitFoundPosition = characterIndex;
		}
	}
	return highestDigitFoundPosition;
}

function getJoltageSum(contents: string, digitsToToggle: number): number {
	let batteries = contents.split(/[\r\n\s]+/);
	let joltageSum = 0;
	batteries.forEach((battery: string) => {
		let toggledBattery = '';
		let remainingBattery = battery;
		for (let ii = 0; ii < digitsToToggle; ii++){
			let endingDigitsToIgnore = digitsToToggle - (ii + 1);
			let selectedDigitPosition = pickFirstHighestBatteryDigitPosition(remainingBattery, endingDigitsToIgnore);
			toggledBattery += remainingBattery[selectedDigitPosition].toString();
			remainingBattery = remainingBattery.substring(selectedDigitPosition + 1);
		}
		joltageSum += parseInt(toggledBattery);
	});
	return joltageSum;
}

console.log(getJoltageSum(inputContents, 2));
console.log(getJoltageSum(inputContents, 12));
