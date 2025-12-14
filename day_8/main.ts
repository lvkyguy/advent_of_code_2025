import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.join(__dirname, 'input.txt');
const inputContents = fs.readFileSync(inputPath, 'utf-8');

class Point {
	public x: number;
	public y: number;
	public z: number;

	constructor(coordinateString: string) {
		let values = coordinateString.split(',');
		this.x = parseInt(values[0]);
		this.y = parseInt(values[1]);
		this.z = parseInt(values[2]);
	}

	public calculateDistance(point2: Point): number {
		let distance = Math.sqrt((point2.x - this.x) ** 2 + (point2.y - this.y) ** 2 + (point2.z - this.z) ** 2);
		return distance;
	}
	
	public isEqual(point2: Point): boolean
	{
		return (this.x == point2.x && this.y == point2.y && this.z == point2.z);
	}
}

class Connection {
	public point1: Point;
	public point2: Point;
	public distance: number;

	constructor(point1Param: Point, point2Param: Point)
	{
		this.point1 = point1Param;
		this.point2 = point2Param;
		this.distance = this.point1.calculateDistance(this.point2);
	}
	
	public doesConnectionContainPoints(point1Param: Point, point2Param: Point)
	{
		return ((this.point1.isEqual(point1Param) && this.point2.isEqual(point2Param))
			|| (this.point2.isEqual(point1Param) && this.point1.isEqual(point2Param)));
	}
}

class Circuit {
	public points: Point[];

	constructor(pointParam: Point)
	{
		this.points = [];
		this.points.push(pointParam);
	}
	
	public addPoint(pointParam: Point)
	{
		this.points.push(pointParam);
	}
	
	public isPointInCircuit(pointParam: Point)
	{
		let pointFound = false;
		this.points.forEach((point: Point) => {
			if (point.isEqual(pointParam))
			{
				pointFound = true;
			}
		});
		return pointFound;
	}
}

function parseCoordinates(contents: string): Point[] {
	let rows = contents.split(/[\r\n]+/).filter(row => row !== '');
	let points = [];
	rows.forEach((row: string) => {
		points.push(new Point(row));
	});
	return points;
}

function groupCircuitsAndReturnProduct(points: Point[], connections: Connection[], countToMultiply: number): number {
	// start with a circuit for every point, each circuit is an array of points
	// loop over connections, for each one, merge the 2 circuits if the points are currently in separate circuits
	let circuits = [];
	points.forEach((point: Point) => {
		circuits.push(new Circuit(point));
	});
	
	connections.forEach((conn: Connection) => {
		let circuit1 = null;
		circuits.forEach((cir: Circuit) => {
			if (cir.isPointInCircuit(conn.point1))
			{
				circuit1 = cir;
			}
		});
		if (circuit1.isPointInCircuit(conn.point2))
		{
			// no merging needed
		}
		else
		{
			let circuit2 = null;
			let circuit2Index = -1;
			for (let circuitIndex = 0; circuitIndex < circuits.length; circuitIndex++)
			{
				let cir = circuits[circuitIndex];
				if (cir.isPointInCircuit(conn.point2))
				{
					circuit2 = cir;
					circuit2Index = circuitIndex;
				}
			}
			
			// now merge circuit2 into circuit 1 and remove circuit 2 from list
			circuit2.points.forEach((point: Point) => {
				circuit1.addPoint(point);
			});
			circuits.splice(circuit2Index, 1);
		}
	});
	
	circuits.sort((a, b) => b.points.length - a.points.length);
	let product = 1;
	for (let multiplyIndex = 0; multiplyIndex < countToMultiply; multiplyIndex++){
		product *= circuits[multiplyIndex].points.length;
	}
	
	return product;
}

function joinCircuits(contents: string): number {
	let points = parseCoordinates(contents);
	let connections = [];
	
	for (let ii = 0; ii < points.length; ii++)
	{
		for (let jj = ii + 1; jj < points.length; jj++)
		{
			connections.push(new Connection(points[ii], points[jj]));
		}
	}
	connections.sort((a,b) => a.distance - b.distance);

	let connectionsToMake = 1000;
	let chosenConnections = [];
	for (let connectionIndex = 0; connectionIndex < connectionsToMake; connectionIndex++)
	{
		chosenConnections.push(connections[connectionIndex]);
	}
	
	return groupCircuitsAndReturnProduct(points, chosenConnections, 3);
}

console.log(joinCircuits(inputContents));
