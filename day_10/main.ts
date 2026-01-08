import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

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
	
	public stringify(): string {
		return 'push ' + this.lightIndexString;
		for (let ii = 0; ii < this.lightIndexes.length; ii++){
			let index = this.lightIndexes[ii];
			newLights[index] = !newLights[index];
		}
		return newLights;
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

function countLightsOn(lights: boolean[]): number {
	return lights.filter(x => x == true).length;
}

// trying to turn all the lights off, loop over buttons, see how many lights are still on after each button press
// rank buttons by helpfulness and press best option, then call again with button removed and new light array
function findMinButtons(lights: boolean[], buttons: Button[], buttonsPressed: number, bestSolutionSoFar: number, highestButtonIndexPressed: number, currentSolutionString: string, bestSolutionString: string): number {
	//console.log('findMin  lights: ' + countLightsOn(lights) + '/' + lights.length + '   buttons: ' + buttons.length + '   pressed: ' + buttonsPressed + '    best soln: ' + bestSolutionSoFar);
	if (countLightsOn(lights) == 0)
	{
		console.log('SOLVED!!!  ' + printLights(lights) + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString);
		//fs.appendFile('alg_log.txt', 'SOLVED!!!  ' + printLights(lights) + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString + '\r\n', (err) => {
		//  if (err) {
		//	console.error(err);
		//  } else {
		//  }
		//});
		return buttonsPressed;
	}
	if (bestSolutionSoFar <= buttonsPressed + 1)
	{
		return bestSolutionSoFar;
	}
	//console.log(printLights(lights) + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + highestButtonIndexPressed + '   ' + currentSolutionString);
	//fs.appendFile('alg_log.txt', printLights(lights) + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString + '\r\n', (err) => {
	//  if (err) {
	//	console.error(err);
	//  } else {
	//  }
	//});
	
	//let bestOffByCount = -1;
	//let bestOffByIndex = 0;
	let buttonApplications = [];
	for (let ii = 0; ii < buttons.length; ii++){
		if (buttons[ii].buttonIndex > highestButtonIndexPressed){
			let testLights = buttons[ii].pushButton(lights);
			let offByCount = countLightsOn(testLights);
			buttonApplications.push(new ButtonApplication(buttons[ii], offByCount));
			//if (bestOffByCount == -1 || offByCount < bestOffByCount){
			//	bestOffByCount = offByCount;
			//	bestOffByIndex = ii;
			//}
		}
	}
	//no longer supporting, because I'm using button index to reduce permutations and sorting breaks that paradigm
	//buttonApplications.sort((a, b) => a.offByCount - b.offByCount);
	//if (buttonsPressed < 2){
	//	console.log(buttonApplications);
	//}

	let bestIterativeSolution = bestSolutionSoFar;
	let bestApplicationIndex = 0;
	let jj = 0;
	for (jj = 0; jj < buttonApplications.length; jj++){
		//if (buttonsPressed < 1){
		//	console.log('Pressing button ' + jj);
		//}
		let newLights = buttonApplications[jj].button.pushButton(lights);
		let newButtonIndex = buttonApplications[jj].button.buttonIndex;
		let newButtons = [...buttons];
		newButtons.splice(newButtons.indexOf(buttonApplications[jj].button, 0), 1);
		let result = findMinButtons(newLights, newButtons, buttonsPressed + 1, bestIterativeSolution, newButtonIndex, currentSolutionString + buttonApplications[jj].button.stringify(), bestSolutionString);
		if (result < bestIterativeSolution){
			bestIterativeSolution = result;
			bestApplicationIndex = jj;
		}
	}
	//if (buttonsPressed < 2){
	//	console.log('Pressing button ' + jj);
	//	console.log(buttonApplications);
	//}
	
	return bestIterativeSolution;
}

function parseLines(contents: string): string[] {
	let rows = contents.split(/[\r\n]+/).filter(row => row !== '');
	return rows;
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

console.log(sumButtonPresses(inputContents));
