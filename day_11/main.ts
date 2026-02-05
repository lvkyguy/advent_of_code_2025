import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

class Node {
	public name: string;
	public links: Node[];
	
	constructor(name: string) {
		this.name = name;
		this.links = [];
	}
}

function findOutPaths(currentNode: Node): number {
	//console.log("traversing " + currentNode.name);
	if (currentNode.name == "out"){
		return 1;
	}
	
	let pathCount = 0;
	for (let ii = 0; ii < currentNode.links.length; ii++){
		//console.log('calling node ' + ii + ' of ' + currentNode.links.length + '   ' + currentNode.links[ii].name);
		pathCount += findOutPaths(currentNode.links[ii]);
	}
	
	return pathCount;
}

function findOutDacFftPaths(currentNode: Node, hitDac: boolean, hitFft: boolean): number {
	if (currentNode.name == "out"){
		//if (hitDac && hitFft){
			return 1;
		//} else {
		//	return 0;
		//}
	}
	//else if (currentNode.name == "dac"){
	//	hitDac = true;
	//}
	//else if (currentNode.name == "fft"){
	//	hitFft = true;
	//}
	
	let pathCount = 0;
	for (let ii = 0; ii < currentNode.links.length; ii++){
		//console.log('calling node ' + ii + ' of ' + currentNode.links.length + '   ' + currentNode.links[ii].name);
		pathCount += findOutDacFftPaths(currentNode.links[ii], hitDac, hitFft);
	}
	
	return pathCount;
}


function findPaths(currentNode: Node, targetNode: string, excludedNode: string): number {
	if (currentNode.name == excludedNode){
		return 0;
	}
	if (currentNode.name == targetNode){
		return 1;
	}
	
	let pathCount = 0;
	for (let ii = 0; ii < currentNode.links.length; ii++){
		//console.log('calling node ' + ii + ' of ' + currentNode.links.length + '   ' + currentNode.links[ii].name);
		pathCount += findPaths(currentNode.links[ii], targetNode, excludedNode);
	}
	
	return pathCount;
}

function findPathsExclusionList(currentNode: Node, targetNode: string, excludedNodes: string[]): number {
	if (currentNode.name == targetNode){
		return 1;
	}
	for (let jj = 0; jj < excludedNodes.length; jj++){
		if (currentNode.name == excludedNodes[jj]){
			return 0;
		}
	}
	
	let pathCount = 0;
	for (let ii = 0; ii < currentNode.links.length; ii++){
		//console.log('calling node ' + ii + ' of ' + currentNode.links.length + '   ' + currentNode.links[ii].name);
		pathCount += findPathsExclusionList(currentNode.links[ii], targetNode, excludedNodes);
	}
	
	return pathCount;
}

function findOriginPaths(currentNode: Node, targetNode: string, excludedNode: string): number {
	if (currentNode.name == excludedNode){
		return 0;
	}
	if (currentNode.name == targetNode){
		return 1;
	}
	
	let pathCount = 0;
	for (let ii = 0; ii < currentNode.links.length; ii++){
		//console.log('calling node ' + ii + ' of ' + currentNode.links.length + '   ' + currentNode.links[ii].name);
		pathCount += findPaths(currentNode.links[ii], targetNode, excludedNode);
	}
	
	return pathCount;
}


function parseLines(contents: string): string[] {
	let rows = contents.split(/[\r\n]+/).filter(row => row !== '');
	return rows;
}

function parseNodes(lines: string[]): Node[] {
	let allNodes = [];
	for (let jj = 0; jj < lines.length; jj++){
		let parts = lines[jj].split(' ');
		let name = parts[0].slice(0, -1);
		let foundNodeIndex = allNodes.findIndex(x => x.name == name);
		let currentNode = null;
		if (foundNodeIndex == -1){
			currentNode = new Node(name);
			allNodes.push(currentNode);
		} else {
			currentNode = allNodes[foundNodeIndex];
		}
		
		for (let ii = 1; ii < parts.length; ii++){
			let linkedNodeIndex = allNodes.findIndex(x => x.name == parts[ii])
			let linkedNode = null;
			if (linkedNodeIndex == -1){
				linkedNode = new Node(parts[ii]);
				allNodes.push(linkedNode);
				currentNode.links.push(linkedNode);
			} else {
				currentNode.links.push(allNodes[linkedNodeIndex]);
			}
		}
	}
	
	return allNodes;
}

function removeNodeFully(allNodes: Node[], removeNodeName: string): Node[] {
	let removableNodeIndex = -1;
	for (let jj = allNodes.length - 1; jj >= 0; jj--){
		if (allNodes[jj].name == removeNodeName){
			removableNodeIndex = jj;
		}
	}
	if (removableNodeIndex != -1){
		let removableNodeName = allNodes[removableNodeIndex].name;
		allNodes.splice(removableNodeIndex, 1);
		
		for (let ii = 0; ii < allNodes.length; ii++){
			//const newArray = originalArray.filter(item => item !== valueToRemove)
			const index = allNodes[ii].links.findIndex(x => x.name == removableNodeName);
			if (index > -1) {
				allNodes[ii].links.splice(index, 1);
			}
		}
	}
	return allNodes;
}

// look for an element other than out that doesn't have any targets, remove it and remove any links that reference it
function cleanUpNodes(allNodes: Node[]): Node[] {
	let removedNode = false;
	let removableNodeIndex = -1;
	for (let jj = allNodes.length - 1; jj >= 0; jj--){
		if (allNodes[jj].links.length == 0 && allNodes[jj].name != "out" && allNodes[jj].name != "dac" && allNodes[jj].name != "fft"){
			removableNodeIndex = jj;
		}
	}
	if (removableNodeIndex != -1){
		let removableNodeName = allNodes[removableNodeIndex].name;
		allNodes.splice(removableNodeIndex, 1);
		
		for (let ii = 0; ii < allNodes.length; ii++){
			//const newArray = originalArray.filter(item => item !== valueToRemove)
			const index = allNodes[ii].links.findIndex(x => x.name == removableNodeName);
			if (index > -1) {
			  allNodes[ii].links.splice(index, 1);
			}
		}
	}
	return allNodes;
}


function simplifyNodes(allNodes: Node[]): Node[] {
	let replacedNode = false;
	let replaceableNodeIndex = -1;
	for (let jj = allNodes.length - 1; jj >= 0; jj--){
		if (allNodes[jj].links.length == 1 && allNodes[jj].name != "out" && allNodes[jj].name != "dac" && allNodes[jj].name != "fft"){
			replaceableNodeIndex = jj;
		}
	}
	if (replaceableNodeIndex != -1){
		let replaceableNodeName = allNodes[replaceableNodeIndex].name;
		let replaceableNodeTarget = allNodes[replaceableNodeIndex].links[0];
		allNodes.splice(replaceableNodeIndex, 1);
		
		for (let ii = 0; ii < allNodes.length; ii++){
			//const newArray = originalArray.filter(item => item !== valueToRemove)
			const index = allNodes[ii].links.findIndex(x => x.name == replaceableNodeName);
			if (index > -1) {
				const alreadyExistingTargetIndex = allNodes[ii].links.findIndex(x => x.name == replaceableNodeTarget.name);
				if (alreadyExistingTargetIndex > -1){
					allNodes[ii].links.splice(index, 1);
				} else {
					//const replaceNode = allNodes.find(x => x.name == replaceableNodeTarget.name);
					//console.log(replaceableNodeTarget.name, replaceNode);
					allNodes[ii].links[index] = replaceableNodeTarget;
				}
			}
		}
	}
	return allNodes;
}

function removeNodesAndDownstream(allNodes: Node[], removeNode: string): Node[] {
	const index = allNodes.findIndex(x => x.name == removeNode);
	if (index != -1){
		let removingNode = allNodes[index];
		allNodes = removeNodeFully(allNodes, removeNode);
		let nodesToRemove = [];
		for (let jj = 0; jj < removingNode.links.length; jj++){
			nodesToRemove.push(removingNode.links[jj].name);
		}
		
		while (nodesToRemove.length > 0){
			let removeIndex = allNodes.findIndex(x => x.name == nodesToRemove[0]);
			nodesToRemove.splice(0, 1);
			if (removeIndex != -1){
				removingNode = allNodes[removeIndex];
				allNodes = removeNodeFully(allNodes, removingNode);
				for (let ii = 0; ii < removingNode.links.length; ii++){
					let alreadyExistingIndex = nodesToRemove.findIndex(x => x == removingNode.links[ii].name);
					if (alreadyExistingIndex == -1){
						nodesToRemove.push(removingNode.links[ii].name);
					}
				}
			}
		}
	}
	return allNodes;
}


function parseReverseNodes(lines: string[]): Node[] {
	let reverseNodes = [];
	for (let jj = 0; jj < lines.length; jj++){
		let parts = lines[jj].split(' ');
		let targetName = parts[0].slice(0, -1);
		let foundNodeIndex = reverseNodes.findIndex(x => x.name == targetName);
		let targetNode = null;
		if (foundNodeIndex == -1){
			targetNode = new Node(targetName);
			reverseNodes.push(targetNode);
		} else {
			targetNode = reverseNodes[foundNodeIndex];
		}
		
		for (let ii = 1; ii < parts.length; ii++){
			let linkedNodeIndex = reverseNodes.findIndex(x => x.name == parts[ii])
			let linkedNode = null;
			if (linkedNodeIndex == -1){
				linkedNode = new Node(parts[ii]);
				linkedNode.links.push(targetNode);
				reverseNodes.push(linkedNode);
			} else {
				reverseNodes[linkedNodeIndex].links.push(targetNode);
			}
		}
	}
	return reverseNodes;
}

function printNodes(nodes: Node[]) {
	//console.log("printing node list");
	for (let ii = 0; ii < nodes.length; ii++){
		let linkStr = '';
		for (let jj = 0; jj < nodes[ii].links.length; jj++){
			linkStr += nodes[ii].links[jj].name + ', ';
		}
		console.log(nodes[ii].name + ': ' + linkStr);
	}
}

function countPaths(contents: string): number {
	let lines = parseLines(contents);
	let allNodes = parseNodes(lines);
	//printNodes(allNodes);
	
	let youNode = allNodes.find(x => x.name == "you");
	return findOutPaths(youNode);
}

function countServerPaths(contents: string): number {
	let lines = parseLines(contents);
	let allNodes = parseNodes(lines);
	let lastNodeLength = -1;
	while (allNodes.length != lastNodeLength){
		lastNodeLength = allNodes.length;
		console.log("checking for removable path");
		allNodes = simplifyNodes(allNodes);
		allNodes = cleanUpNodes(allNodes);
	}
	//allNodes = removeNodesAndDownstream(allNodes, "dac");
	//allNodes = removeNodesAndDownstream(allNodes, "fft");
	//allNodes = removeNodesAndDownstream(allNodes, "out");
	while (allNodes.length != lastNodeLength){
		lastNodeLength = allNodes.length;
		console.log("checking for removable path");
		allNodes = simplifyNodes(allNodes);
		allNodes = cleanUpNodes(allNodes);
	}
	printNodes(allNodes);
	
	let excludedNodes = [];
	//excludedNodes.push("dac");
	//excludedNodes.push("fft");
	//excludedNodes.push("out");
	let svrNode = allNodes.find(x => x.name == "fft");
	return findPathsExclusionList(svrNode, "out", excludedNodes);
}

function countServerPathsWithQualifier(contents: string): number {
	let lines = parseLines(contents);
	let allNodes = parseNodes(lines);
	let lastNodeLength = -1;
	while (allNodes.length != lastNodeLength){
		lastNodeLength = allNodes.length;
		console.log("checking for removable path");
		allNodes = simplifyNodes(allNodes);
		allNodes = cleanUpNodes(allNodes);
	}
	//allNodes = removeNodesAndDownstream(allNodes, "dac");
	//allNodes = removeNodesAndDownstream(allNodes, "fft");
	//allNodes = removeNodesAndDownstream(allNodes, "out");
	while (allNodes.length != lastNodeLength){
		lastNodeLength = allNodes.length;
		console.log("checking for removable path");
		allNodes = simplifyNodes(allNodes);
		allNodes = cleanUpNodes(allNodes);
	}
	printNodes(allNodes);
	
	let excludedNodes = [];
	//excludedNodes.push("dac");
	//excludedNodes.push("fft");
	//excludedNodes.push("out");
	let svrNode = allNodes.find(x => x.name == "dac");
	//return findOutDacFftPaths(svrNode, "out", excludedNodes);
	return findOutPaths(svrNode);
}

function countReverseServerPaths(contents: string): number {
	let lines = parseLines(contents);
	let reverseNodes = parseReverseNodes(lines);
	//printNodes(allNodes);

	let svrNode = reverseNodes.find(x => x.name == "dac");
	return findOriginPaths(svrNode, "fft", "disregard");
}

//2717 svr -> fft
//5542208 from fft to dac
//1 from dac to out

// fft -> out  13062034

// nothing from dac to fft, so it must go svr -> fft -> dac -> out, routes1 * routes2 * routes3
//console.log(countPaths(inputContents));
console.log(countServerPathsWithQualifier(inputContents));

//console.log(countReverseServerPaths(inputContents));

