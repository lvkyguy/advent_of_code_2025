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
	
	public isEven(): boolean {
		return (this.lightIndexes.length % 2 == 0);
	}
	
	public getIndexCount(): number {
		return this.lightIndexes.length;
	}
	
	public checkMismatchedJoltage(joltage: number[]): boolean {
		for (let ii = 0; ii < this.lightIndexes.length; ii++){
			let index = this.lightIndexes[ii];
			if (joltage[index] == 0){
				return true;
			}
		}
	}
	
	public applyJoltage(joltage: number[]): number[] {
		let newJoltage = [...joltage];
		for (let ii = 0; ii < this.lightIndexes.length; ii++){
			let index = this.lightIndexes[ii];
			newJoltage[index]--;
		}
		return newJoltage;
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

function checkJoltage(joltage: number[]): number {
	const hasNegativeNumber: boolean = joltage.some(v => v < 0);
	if (hasNegativeNumber){
		return -1;
	} else {
		//console.log(joltage);
		//console.log(joltage.reduce((acc, currentVal) => acc + currentVal, 0));
		return joltage.reduce((acc, currentVal) => acc + currentVal, 0);
	}
}

// trying to turn all the lights off, loop over buttons, see how many lights are still on after each button press
// rank buttons by helpfulness and press best option, then call again with button removed and new light array
function findMinButtons(lights: boolean[], buttons: Button[], buttonsPressed: number, bestSolutionSoFar: number, highestButtonIndexPressed: number, currentSolutionString: string, bestSolutionString: string): number {
	if (countLightsOn(lights) == 0)
	{
		console.log('SOLVED!!!  ' + printLights(lights) + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString);
		return buttonsPressed;
	}
	// it's not solved yet, so it's going to take at least 1 more press, if we've already beat that, we can quit
	if (bestSolutionSoFar <= buttonsPressed + 1)
	{
		return bestSolutionSoFar;
	}
	
	let buttonApplications = [];
	for (let ii = 0; ii < buttons.length; ii++){
		if (buttons[ii].buttonIndex > highestButtonIndexPressed){
			let testLights = buttons[ii].pushButton(lights);
			let offByCount = countLightsOn(testLights);
			buttonApplications.push(new ButtonApplication(buttons[ii], offByCount));
		}
	}
	//no longer supporting, because I'm using button index to reduce permutations and sorting breaks that paradigm
	//buttonApplications.sort((a, b) => a.offByCount - b.offByCount);
	let bestIterativeSolution = bestSolutionSoFar;
	let bestApplicationIndex = 0;
	let jj = 0;
	for (jj = 0; jj < buttonApplications.length; jj++){
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
	
	return bestIterativeSolution;
}

function findMinJoltagePresses(joltage: number[], buttons: Button[], buttonsPressed: number, bestSolutionSoFar: number, currentSolutionString: string): number {
	if (checkJoltage(joltage) == 0)
	{
		console.log('SOLVED!!!  ' + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString);
		return buttonsPressed;
	}
	// it's not solved yet, so it's going to take at least 1 more press, if we've already beat that, we can quit
	if (bestSolutionSoFar != -1 && bestSolutionSoFar <= buttonsPressed + 1)
	{
		return bestSolutionSoFar;
	}
	
	let joltageApplications = [];
	let newButtons = [...buttons];
	for (let ii = 0; ii < buttons.length; ii++){
		let testJoltage = buttons[ii].applyJoltage(joltage);
		let offByCount = checkJoltage(testJoltage);
		if (offByCount == -1){
			// can't solve it with this press and can't use this button anymore (may be opportunity for optimization here)
			//console.log("removing impossible button  " + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString);
			newButtons.splice(ii, 1);
		}
		else {
			joltageApplications.push(new JoltageApplication(buttons[ii], offByCount));
		}
	}
	
	//try the buttons first that get us closest to the right joltage
	joltageApplications.sort((a, b) => a.offByCount - b.offByCount);
	
	let bestIterativeSolution = bestSolutionSoFar;
	let jj = 0;
	for (jj = 0; jj < joltageApplications.length; jj++){
		let newJoltage = joltageApplications[jj].button.applyJoltage(joltage);
		let result = findMinJoltagePresses(newJoltage, newButtons, buttonsPressed + 1, bestIterativeSolution, currentSolutionString + joltageApplications[jj].button.stringify());
		if ((bestIterativeSolution == -1 && result != -1)
			|| (bestIterativeSolution != -1 && result < bestIterativeSolution)){
			bestIterativeSolution = result;
		}
	}
	
	return bestIterativeSolution;
}

function findMinJoltagePressesAlt(joltage: number[], buttons: Button[], buttonsPressed: number, bestSolutionSoFar: number, currentSolutionString: string): number {
	if (checkJoltage(joltage) == 0)
	{
		console.log('SOLVED!!!  ' + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString);
		return buttonsPressed;
	}
	// it's not solved yet, so it's going to take at least 1 more press, if we've already beat that, we can quit
	if (bestSolutionSoFar != -1 && bestSolutionSoFar <= buttonsPressed + 1)
	{
		return bestSolutionSoFar;
	}
	
	// take the first button that gets us closest
	// spin off an iteration for all the different number of times I can press it and recurse on each with it removed from the list
	
	let joltageApplications = [];
	let newButtons = [...buttons];
	for (let ii = 0; ii < buttons.length; ii++){
		let testJoltage = buttons[ii].applyJoltage(joltage);
		let offByCount = checkJoltage(testJoltage);
		if (offByCount == -1){
			// can't solve it with this press and can't use this button anymore (may be opportunity for optimization here)
			//console.log("removing impossible button  " + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString);
			newButtons.splice(ii, 1);
		}
		else {
			joltageApplications.push(new JoltageApplication(buttons[ii], offByCount));
		}
	}
	
	//try the buttons first that get us closest to the right joltage
	joltageApplications.sort((a, b) => a.offByCount - b.offByCount);
	
	let bestIterativeSolution = bestSolutionSoFar;
	let jj = 0;
	for (jj = 0; jj < joltageApplications.length; jj++){
		// how many times can this button be applied?
		let applications = 1;
		let testJoltage = joltageApplications[jj].button.applyJoltage(joltage);
		while (checkJoltage(testJoltage) != -1){
			testJoltage = joltageApplications[jj].button.applyJoltage(testJoltage);
			applications++;
		}
		let iterativeJoltage = joltage;
		newButtons.splice(newButtons.indexOf(joltageApplications[jj].button, 0), 1);
		if (buttonsPressed < 1){
			//console.log('Trying button ' + joltageApplications[jj].button.stringify() + ' x times: ' + applications);
		}
		for (let kk = 0; kk < applications - 1; kk++){
			iterativeJoltage = joltageApplications[jj].button.applyJoltage(iterativeJoltage);
			
			let result = findMinJoltagePressesAlt(iterativeJoltage, newButtons, buttonsPressed + kk + 1, bestIterativeSolution, currentSolutionString + joltageApplications[jj].button.stringify() + 'x' + (kk + 1));
			if ((bestIterativeSolution == -1 && result != -1)
				|| (bestIterativeSolution != -1 && result < bestIterativeSolution)){
				bestIterativeSolution = result;
			}
		}
		
	}
	
	return bestIterativeSolution;
}

let counter = 0;

//SOLVED!!!     41    40   push 0,1,3,4x1push 1,2,3,4x13push 0,1,3x1push 0,3,4x10push 2,3,4x10push 0,1,2x4push 0,4x1

function findMinJoltagePressesAlt2(joltage: number[], buttons: Button[], buttonsPressed: number, bestSolutionSoFar: number, currentSolutionString: string): number {
	if (checkJoltage(joltage) == 0)
	{
		console.log('SOLVED!!!  ' + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString);
		return buttonsPressed;
	}
	if (buttons.length == 0){
		return bestSolutionSoFar;
	}
	
	//console.log(bestSolutionSoFar + '    ' + buttonsPressed + '   ' + checkJoltage(joltage) + '   ' + currentSolutionString);
	if (currentSolutionString.includes('push 0,1,3,4x1')
		&& currentSolutionString.includes('push 1,2,3,4x13')
		&& currentSolutionString.includes('push 0,1,3x1')
		&& currentSolutionString.includes('push 0,3,4x10')
		&& currentSolutionString.includes('push 0,1,2x4')
		//&& currentSolutionString.includes('push 0,4x1')
		)
	{
		console.log(bestSolutionSoFar + '    ' + buttonsPressed + '   ' + checkJoltage(joltage) + '   ' + currentSolutionString);
		//console.log(buttons);
	}

	//counter = (counter + 1) % 10000;
	//if (counter == 0){
	//	console.log(bestSolutionSoFar + '    ' + buttonsPressed + '   ' + checkJoltage(joltage) + '   ' + currentSolutionString);
	//}
	
	//console.log(buttons[0]);
	if (buttons[0].isEven() && checkJoltage(joltage) % 2 != 0){
		// can't get there with even buttons, so bail out
		return bestSolutionSoFar;
	}
	if (buttons.length == 1){
		let indexCount = buttons[0].getIndexCount();
		if (checkJoltage(joltage) % indexCount != 0){
			return bestSolutionSoFar
		}
	}
	
	
	//let joltageApplications = [];
	let newButtons = [...buttons];
	//for (let ii = 0; ii < buttons.length; ii++){
	//	let testJoltage = buttons[ii].applyJoltage(joltage);
	//	let offByCount = checkJoltage(testJoltage);
	//	if (offByCount == -1){
	//		// can't solve it with this press and can't use this button anymore (may be opportunity for optimization here)
	//		//console.log("removing impossible button  " + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString);
	//		newButtons.splice(ii, 1);
	//	}
	//	else {
	//		joltageApplications.push(new JoltageApplication(buttons[ii], offByCount));
	//	}
	//}
	
	//try the buttons first that get us closest to the right joltage
	//joltageApplications.sort((a, b) => a.offByCount - b.offByCount);
	
	
	let bestIterativeSolution = bestSolutionSoFar;
	let jj = 0;
	for (jj = 0; jj < buttons.length; jj++){
		if (buttons[jj].isEven() && checkJoltage(joltage) % 2 != 0){
			// can't get there with even buttons, so bail out
			return bestIterativeSolution;
		}
		if (jj == buttons.length - 1){
			let indexCount = buttons[jj].getIndexCount();
			if (checkJoltage(joltage) % indexCount != 0){
				//console.log(buttonsPressed + ' - ' + checkJoltage(joltage) + ' - ' + indexCount + ' - ' + buttons[jj].stringify());
				return bestIterativeSolution;
			}
		}
		// how many times can this button be applied?
		let applications = 1;
		let testJoltage = buttons[jj].applyJoltage(joltage);
		if (checkJoltage(testJoltage) == -1){
			continue;
		}
		while (checkJoltage(testJoltage) != -1){
			testJoltage = buttons[jj].applyJoltage(testJoltage);
			applications++;
		}
		applications--;
		newButtons.splice(newButtons.indexOf(buttons[jj], 0), 1);
		if (buttonsPressed < 1){
			//console.log('Trying button ' + joltageApplications[jj].button.stringify() + ' x times: ' + applications);
		}
		let startingValue = 0;
		let incrementValue = 1;
		if (jj < buttons.length - 1 && !buttons[jj].isEven() && buttons[jj+1].isEven()){
			// this is the last odd button, check if it should be pressed an even or odd amount of times, odd amount of times if the current mod by 2 is not 0
			// even amount if the joltage % 2 == 0
			incrementValue = 2;
			if (checkJoltage(joltage) % 2 == 0){
				startingValue = 1;
			}
		}
		for (let kk = startingValue; kk < applications && (bestIterativeSolution == -1 || (buttonsPressed + kk + 1 < bestIterativeSolution)); kk += incrementValue){
			let iterativeJoltage = joltage;
			for (let mm = 0; mm < kk + 1; mm++){
				iterativeJoltage = buttons[jj].applyJoltage(iterativeJoltage);
			}
			
			//let debugLog = 'starting joltage: ' + checkJoltage(joltage) + '   pressed button ' + buttons[jj].stringify() + 'x' + (kk + 1) + '  new joltage: ' + checkJoltage(iterativeJoltage);
			//console.log(debugLog);
			let result = findMinJoltagePressesAlt2(iterativeJoltage, newButtons, buttonsPressed + kk + 1, bestIterativeSolution, currentSolutionString + buttons[jj].stringify() + 'x' + (kk + 1));
			if ((bestIterativeSolution == -1 && result != -1)
				|| (bestIterativeSolution != -1 && result < bestIterativeSolution)){
				bestIterativeSolution = result;
			}
		}
		
	}
	
	return bestIterativeSolution;
}

function findMinJoltagePressesAlt3(joltage: number[], buttons: Button[], buttonsPressed: number, bestSolutionSoFar: number, currentSolutionString: string): number {
	if (checkJoltage(joltage) == 0)
	{
		console.log('SOLVED!!!  ' + '   ' + bestSolutionSoFar + '    ' + buttonsPressed + '   ' + currentSolutionString);
		return buttonsPressed;
	}
	if (buttons.length == 0){
		return bestSolutionSoFar;
	}
	if (buttons[0].isEven() && checkJoltage(joltage) % 2 != 0){
		// can't get there with even buttons, so bail out
		return bestSolutionSoFar;
	}
	if (buttons.length == 1){
		let indexCount = buttons[0].getIndexCount();
		if (checkJoltage(joltage) % indexCount != 0){
			return bestSolutionSoFar
		}
	}

	//counter = (counter + 1) % 10000;
	//if (counter == 0){
	//	console.log(bestSolutionSoFar + '    ' + buttonsPressed + '   ' + checkJoltage(joltage) + '   ' + currentSolutionString);
	//}
	
	let newButtons = [...buttons];
	
	//at each point along the way, check if there are any buttons in the list that have an index that I don't need and if so, remove them from the list
	for (let nn = newButtons.length - 1; nn >= 0; nn--){
		if (newButtons[nn].checkMismatchedJoltage(joltage)){
			newButtons.splice(nn, 1);
		}
	}
	
	let bestIterativeSolution = bestSolutionSoFar;
	for (let jj = 0; jj < buttons.length; jj++){
		if (buttons[jj].isEven() && checkJoltage(joltage) % 2 != 0){
			// can't get there with even buttons, so bail out
			return bestIterativeSolution;
		}
		if (jj == buttons.length - 1){
			let indexCount = buttons[jj].getIndexCount();
			if (checkJoltage(joltage) % indexCount != 0){
				//console.log(buttonsPressed + ' - ' + checkJoltage(joltage) + ' - ' + indexCount + ' - ' + buttons[jj].stringify());
				return bestIterativeSolution;
			}
			else {
				let requiredApplications = checkJoltage(joltage) / indexCount;
				if (bestIterativeSolution != -1 && buttonsPressed + requiredApplications >= bestIterativeSolution){
					return bestIterativeSolution;
				}
				newButtons = []
				let iterativeJoltage = joltage;
				for (let kk = 0; kk < requiredApplications; kk++){
					iterativeJoltage = buttons[jj].applyJoltage(iterativeJoltage);
				}
				let result = findMinJoltagePressesAlt3(iterativeJoltage, newButtons, buttonsPressed + requiredApplications, bestIterativeSolution, currentSolutionString + buttons[jj].stringify() + 'x' + (requiredApplications));
				if ((bestIterativeSolution == -1 && result != -1)
					|| (bestIterativeSolution != -1 && result != -1 && result < bestIterativeSolution)){
					bestIterativeSolution = result;
				}
			}
		}
		else {
			// how many times can this button be applied?
			let applications = 1;
			let testJoltage = buttons[jj].applyJoltage(joltage);
			if (checkJoltage(testJoltage) == -1){
				continue;
			}
			while (checkJoltage(testJoltage) != -1){
				testJoltage = buttons[jj].applyJoltage(testJoltage);
				applications++;
			}
			applications--;
			newButtons.splice(newButtons.indexOf(buttons[jj], 0), 1);
			let startingValue = 0;
			let incrementValue = 1;
			if (jj < buttons.length - 1 && !buttons[jj].isEven() && buttons[jj+1].isEven()){
				// this is the last odd button, check if it should be pressed an even or odd amount of times, odd amount of times if the current mod by 2 is not 0
				// even amount if the joltage % 2 == 0
				incrementValue = 2;
				if (checkJoltage(joltage) % 2 == 0){
					startingValue = 1;
				}
			}
			for (let kk = startingValue; kk < applications && (bestIterativeSolution == -1 || (buttonsPressed + kk + 1 < bestIterativeSolution)); kk += incrementValue){
				let iterativeJoltage = joltage;
				for (let mm = 0; mm < kk + 1; mm++){
					iterativeJoltage = buttons[jj].applyJoltage(iterativeJoltage);
				}
				
				//let debugLog = 'starting joltage: ' + checkJoltage(joltage) + '   pressed button ' + buttons[jj].stringify() + 'x' + (kk + 1) + '  new joltage: ' + checkJoltage(iterativeJoltage);
				//console.log(debugLog);
				let result = findMinJoltagePressesAlt3(iterativeJoltage, newButtons, buttonsPressed + kk + 1, bestIterativeSolution, currentSolutionString + buttons[jj].stringify() + 'x' + (kk + 1));
				if ((bestIterativeSolution == -1 && result != -1)
					|| (bestIterativeSolution != -1 && result < bestIterativeSolution)){
					bestIterativeSolution = result;
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

function parseJoltage(line: string): number[] {
	let joltageString = line.split(' ').at(-1);
	let trimmedString = joltageString.slice(1, -1);
	let joltages = trimmedString.split(',').map(Number);
	return joltages;
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
		let buttons = parseButtons(line);
		let oddButtons = buttons.filter(but => !but.isEven());
		oddButtons.sort((a, b) => b.getIndexCount() - a.getIndexCount());
		let evenButtons = buttons.filter(but => but.isEven());
		evenButtons.sort((a, b) => b.getIndexCount() - a.getIndexCount());
		let orderedButtons = [...oddButtons, ...evenButtons];
		let joltageRequirements = parseJoltage(line);
		//console.log(joltages);
		//console.log(buttons);
		let buttonPresses = findMinJoltagePressesAlt3(joltageRequirements, orderedButtons, 0, -1, '');
		totalButtonPresses += buttonPresses;
		console.log('solved in ' + buttonPresses);
	});

	return totalButtonPresses;
}

//console.log("configuring status lights");
//console.log(sumButtonPresses(inputContents));
console.log("configuring joltage");
console.log(sumJoltagePresses(inputContents));
