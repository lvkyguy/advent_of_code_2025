import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

class Joltage {
	public numbers: number[];
	public remaining: number;

	constructor(numbers: number[]) {
		this.numbers = numbers;
		
		const hasNegativeNumber: boolean = this.numbers.some(v => v < 0);
		if (hasNegativeNumber){
			this.remaining = -1;
		} else {
			this.remaining = this.numbers.reduce((acc, currentVal) => acc + currentVal, 0);
		}
	}
	
	public stringify(): string {
		let joltString = '{';
		for (let ii = 0; ii < this.numbers.length; ii++){
			joltString += this.numbers[ii] + ',';
		}
		joltString += '}';
		return joltString;
	}
}

function printLights(lights: boolean[]): string {
	let resultString = '';
	for (const light of lights) {
		if (light){
			resultString += '#';
		}
		else {
			resultString += '.';
		}
	}
	return resultString;
}

class Button {
	public lightIndexString;
	public lightIndexes: number[];
	public buttonIndex: number;

	constructor(lightIndexString: string, buttonIndexParam: number) {
		this.lightIndexString = lightIndexString;
		this.lightIndexes = lightIndexString.split(',');
		this.buttonIndex = buttonIndexParam;
	}
	
	public pushButton(lights: boolean[]): boolean[] {
		let newLights = [...lights];
		for (let ii = 0; ii < this.lightIndexes.length; ii++){
			let index = this.lightIndexes[ii];
			newLights[index] = !newLights[index];
		}
		return newLights;
	}
	
	public isEven(): boolean {
		return (this.lightIndexes.length % 2 == 0);
	}
	
	public getIndexCount(): number {
		return this.lightIndexes.length;
	}
	
	public checkMismatchedJoltage(joltage: Joltage): boolean {
		for (let ii = 0; ii < this.lightIndexes.length; ii++){
			let index = this.lightIndexes[ii];
			//console.log(joltage);
			if (joltage.numbers[index] <= 0){
				return true;
			}
		}
		return false;
	}
	
	public containsIndex(checkIndex: number): boolean {
		for (let ii = 0; ii < this.lightIndexes.length; ii++){
			if (this.lightIndexes[ii] == checkIndex){
				return true;
			}
		}
		return false;
		//return this.lightIndexes.indexOf(checkIndex) > -1;
	}
	
	public applyJoltage(joltage: Joltage, iterations: number): Joltage {
		let newJoltageNumbers = [...joltage.numbers];
		for (let jj = 0; jj < iterations; jj++){
			for (let ii = 0; ii < this.lightIndexes.length; ii++){
				let index = this.lightIndexes[ii];
				newJoltageNumbers[index]--;
			}
		}
		return new Joltage(newJoltageNumbers);
	}
	
	public stringify(): string {
		return 'push ' + this.lightIndexString;
	}
}

class ButtonApplication {
	public button: Button;
	public offByCount: number;

	constructor(buttonParam: Button, offByParam: number) {
		this.button = buttonParam;
		this.offByCount = offByParam;
	}
}

class JoltageApplication {
	public button: Button;
	public offByCount: number

	constructor(buttonParam: Button, offByCount: number) {
		this.button = buttonParam;
		this.offByCount = offByCount;
	}
}

function countLightsOn(lights: boolean[]): number {
	return lights.filter(x => x == true).length;
}

function findMinJoltagePressesAlt3(joltage: Joltage, buttons: Button[], buttonsPressed: number, bestSolutionSoFar: number, currentSolutionString: string, bestSolutionString: string): number {
	// order buttons by putting those with the least frequent light indexes first, use size as tie-breaker
	// apply button and call recursively
	
	// or, order buttons by the ones that hit the most indexes, apply and call recursively
	
	
	if (joltage.remaining == 0)
	{
		console.log('found_solution!!!  ' + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + currentSolutionString);
		return buttonsPressed;
	}
	if (buttons.length == 0){
		return bestSolutionSoFar;
	}
	if (buttons[0].isEven() && joltage.remaining % 2 != 0){
		// can't get there with even buttons, so bail out
		return bestSolutionSoFar;
	}
	// get minimal number of still required button presses by taking max joltage level
	if (buttonsPressed + Math.max(...joltage.numbers) >= bestSolutionSoFar && bestSolutionSoFar != -1){
		return bestSolutionSoFar;
	}
	
	if (buttons.length == 1){
		let indexCount = buttons[0].getIndexCount();
		if (joltage.remaining % indexCount != 0){
			return bestSolutionSoFar
		}
	}

	let allButtonsLeftToTry = [...buttons];
	
	//at each point along the way, check if there are any buttons in the list that have an index that I don't need and if so, remove them from the list
	for (let nn = allButtonsLeftToTry.length - 1; nn >= 0; nn--){
		if (allButtonsLeftToTry[nn].checkMismatchedJoltage(joltage)){
			allButtonsLeftToTry.splice(nn, 1);
		}
	}
	// also check whether all of the indexes I need are covered by at least 1 of the remaining buttons
	for (let oo = joltage.numbers.length - 1; oo >= 0; oo--){
		if (joltage.numbers[oo] > 0){
			let isJoltageCovered = false;
			for (let pp = 0; pp < allButtonsLeftToTry.length && !isJoltageCovered; pp++){
				if (allButtonsLeftToTry[pp].containsIndex(oo)){
					//console.log('button covers joltage');
					//console.log(allButtonsLeftToTry[pp].stringify());
					isJoltageCovered = true;
				}
				else {
					//console.log('button missing joltage');
					//console.log(allButtonsLeftToTry[pp].stringify());
				}
			}
			if (!isJoltageCovered){
				return bestSolutionSoFar;
			}
		}
	}
	buttons = [...allButtonsLeftToTry];

	let bestIterativeSolution = bestSolutionSoFar;
	for (let jj = 0; jj < buttons.length; jj++){
		if (buttons[jj].isEven() && joltage.remaining % 2 != 0){
			// can't get there with even buttons, so bail out
			return bestIterativeSolution;
		}
		if (jj == buttons.length - 1){
			let indexCount = buttons[jj].getIndexCount();
			if (joltage.remaining % indexCount != 0){
				//console.log(buttonsPressed + ' - ' + checkJoltage(joltage) + ' - ' + indexCount + ' - ' + buttons[jj].stringify());
				return bestIterativeSolution;
			}
			else {
				let requiredApplications = joltage.remaining / indexCount;
				if (bestIterativeSolution != -1 && buttonsPressed + requiredApplications >= bestIterativeSolution){
					return bestIterativeSolution;
				}
				let iterativeJoltage = buttons[jj].applyJoltage(joltage, requiredApplications);
				
				let result = findMinJoltagePressesAlt3(iterativeJoltage, [], buttonsPressed + requiredApplications, bestIterativeSolution, currentSolutionString + buttons[jj].stringify() + 'x' + requiredApplications, bestSolutionString);
				if ((bestIterativeSolution == -1 && result != -1)
					|| (bestIterativeSolution != -1 && result != -1 && result < bestIterativeSolution)){
					bestIterativeSolution = result;
				}
			}
		}
		else {
			// how many times can this button be applied?
			let applications = 1;
			let testJoltage = buttons[jj].applyJoltage(joltage, 1);
			if (testJoltage.remaining == -1){
				continue;
			}
			while (testJoltage.remaining != -1){
				testJoltage = buttons[jj].applyJoltage(testJoltage, 1);
				applications++;
			}
			applications--;
			allButtonsLeftToTry.splice(allButtonsLeftToTry.indexOf(buttons[jj], 0), 1);
			let startingValue = 0;
			let incrementValue = 1;
			// this gives big time savings
			if (jj < buttons.length - 1 && !buttons[jj].isEven() && buttons[jj+1].isEven()){
				// this is the last odd button, check if it should be pressed an even or odd amount of times, odd amount of times if the current mod by 2 is not 0
				// even amount if the joltage % 2 == 0
				//if (buttons[jj].stringify().includes('push 3,4,5,6,7x4')){
				//	console.log('found odd button before evens');
				//}
				incrementValue = 2;
				if (testJoltage.remaining % 2 != 0){
					startingValue = 1;
				}
				for (let kk = startingValue; kk < applications && (bestIterativeSolution == -1 || (buttonsPressed + kk + 1 < bestIterativeSolution)); kk += incrementValue){
					let iterativeJoltage = joltage;
					for (let mm = 0; mm < kk + 1; mm++){
						iterativeJoltage = buttons[jj].applyJoltage(iterativeJoltage, 1);
					}
					//let debugLog = 'starting joltage: ' + checkJoltage(joltage) + '   pressed button ' + buttons[jj].stringify() + 'x' + (kk + 1) + '  new joltage: ' + checkJoltage(iterativeJoltage);
					//console.log(debugLog);
					
					let result = findMinJoltagePressesAlt3(iterativeJoltage, allButtonsLeftToTry, buttonsPressed + kk + 1, bestIterativeSolution, currentSolutionString + buttons[jj].stringify() + 'x' + (kk + 1), bestSolutionString);
					if ((bestIterativeSolution == -1 && result != -1)
						|| (bestIterativeSolution != -1 && result < bestIterativeSolution)){
						bestIterativeSolution = result;
					}
				}
			}
			else {
				for (let kk = startingValue; kk < applications && (bestIterativeSolution == -1 || (buttonsPressed + kk + 1 < bestIterativeSolution)); kk += incrementValue){
					let iterativeJoltage = joltage;
					for (let mm = 0; mm < kk + 1; mm++){
						iterativeJoltage = buttons[jj].applyJoltage(iterativeJoltage, 1);
					}
					//let debugLog = 'starting joltage: ' + checkJoltage(joltage) + '   pressed button ' + buttons[jj].stringify() + 'x' + (kk + 1) + '  new joltage: ' + checkJoltage(iterativeJoltage);
					//console.log(debugLog);
					
					let result = findMinJoltagePressesAlt3(iterativeJoltage, allButtonsLeftToTry, buttonsPressed + kk + 1, bestIterativeSolution, currentSolutionString + buttons[jj].stringify() + 'x' + (kk + 1), bestSolutionString);
					if ((bestIterativeSolution == -1 && result != -1)
						|| (bestIterativeSolution != -1 && result < bestIterativeSolution)){
						bestIterativeSolution = result;
					}
				}
			}
		}
		
	}
	
	return bestIterativeSolution;
}

function parseLines(contents: string): string[] {
	let rows = contents.split(/[\r\n]+/).filter(row => row !== '');
	return rows;
}

function parseJoltage(line: string): Joltage {
	let joltageString = line.split(' ').at(-1);
	let trimmedString = joltageString.slice(1, -1);
	let joltages = trimmedString.split(',').map(Number);
	return new Joltage(joltages);
}

//[#####] (0,1,3) (0,3,4) (0,4) (2,3,4) (0,1,2) (0,1,3,4) (1,2,3,4) {17,19,27,35,35}
function parseLights(line: string): boolean[] {
	let lightString = line.split(' ')[0];
	let lights = lightString.slice(1, -1);
	let lightBooleans = [];
	for (const character of lights) {
		if (character == '#'){
			lightBooleans.push(true);
		}
		else {
			lightBooleans.push(false);
		}
	}
	return lightBooleans;
}

function parseButtons(line: string): Button[] {
	let sections = line.split(' ');
	sections.shift();
	sections.pop();
	let buttons = [];
	let buttonIndex = 0;
	for (const section of sections) {
		let indexString = section.slice(1, -1);
		buttons.push(new Button(indexString, buttonIndex));
		buttonIndex++;
	}
	return buttons;
}

function sumButtonPresses(contents: string): number {
	let lines = parseLines(contents);
	let totalButtonPresses = 0;
	lines.forEach(line => {
		let lights = parseLights(line);
		let buttons = parseButtons(line);
		//console.log(line);
		//console.log(lights);
		//console.log(buttons);
		console.log(printLights(lights));
		let buttonPresses = findMinButtons(lights, buttons, 0, buttons.length, -1, '', '');
		totalButtonPresses += buttonPresses;
		console.log('solved in ' + buttonPresses);
	});

	return totalButtonPresses;
}

function sumJoltagePresses(contents: string): number {
	let lines = parseLines(contents);
	let totalButtonPresses = 0;
	lines.forEach(line => {
		const start: number = performance.now();
		let buttons = parseButtons(line);
		let oddButtons = buttons.filter(but => !but.isEven());
		oddButtons.sort((a, b) => a.getIndexCount() - b.getIndexCount());
		let evenButtons = buttons.filter(but => but.isEven());
		evenButtons.sort((a, b) => a.getIndexCount() - b.getIndexCount());
		let orderedButtons = [...oddButtons, ...evenButtons];
		let joltageRequirements = parseJoltage(line);
		//console.log(joltages);
		//console.log(buttons);
		let buttonsString = '';
		orderedButtons.forEach(btn => { buttonsString += btn.stringify() + '  '; });
		let buttonPresses = findMinJoltagePressesAlt3(joltageRequirements, orderedButtons, 0, -1, '', '');
		totalButtonPresses += buttonPresses;
		const end: number = performance.now();
		const duration: number = end - start; // Duration in milliseconds
		console.log('solved in ' + buttonPresses + '  ms: ' + duration + ', reqs:' + joltageRequirements.stringify() + buttonsString);
	});

	return totalButtonPresses;
}

//console.log("configuring status lights");
//console.log(sumButtonPresses(inputContents));
console.log("configuring joltage");
console.log(sumJoltagePresses(inputContents));
