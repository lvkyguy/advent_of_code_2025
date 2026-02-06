using System;
using System.Collections.Generic;
using System.Linq;

namespace LaunchPad
{
    public class Path
    {
        public string origin;
        public string dest;
        public long containedPathCount;
    }

    public class AOC_2025_11
    {
        public static List<string> protectedNodes = new List<string>() { "svr", "dac", "fft", "out" };

        public static long CountServerPaths(string contents)
        {
            var lines = parseLines(contents);
            SortedList<string, Path> allPaths = parseNodes(lines);
            TrimDisconnectedPaths(allPaths);
            IterateAndAggregatePaths(allPaths);


            //int lastNodeLength = -1;
            //while (allNodes.Count != lastNodeLength)
            //{
            //    lastNodeLength = allNodes.Count;
            //    Console.WriteLine("checking for removable path");
            //    allNodes = simplifyNodes(allNodes);
            //    allNodes = cleanUpNodes(allNodes);
            //}
            ////allNodes = removeNodesAndDownstream(allNodes, "dac");
            ////allNodes = removeNodesAndDownstream(allNodes, "fft");
            ////allNodes = removeNodesAndDownstream(allNodes, "out");
            //while (allNodes.Count != lastNodeLength)
            //{
            //    lastNodeLength = allNodes.Count;
            //    Console.WriteLine("checking for removable path");
            //    allNodes = simplifyNodes(allNodes);
            //    allNodes = cleanUpNodes(allNodes);
            //}
            //printNodes(allNodes);
            //
            //var excludedNodes = new List<string>();
            ////excludedNodes.push("dac");
            ////excludedNodes.push("fft");
            ////excludedNodes.push("out");
            //var svrNode = allNodes.First(x => x.name == "dac");
            ////return findOutDacFftPaths(svrNode, "out", excludedNodes);
            //return findOutPaths(svrNode);
            long dacFftPaths =
                FindPathCount(allPaths, "svr", "dac", 1)
                * FindPathCount(allPaths, "dac", "fft", 1)
                * FindPathCount(allPaths, "fft", "out", 1);
            long fftDacPaths =
                FindPathCount(allPaths, "svr", "fft", 1)
                * FindPathCount(allPaths, "fft", "dac", 1)
                * FindPathCount(allPaths, "dac", "out", 1);

            return dacFftPaths + fftDacPaths;
        }

        //function findPathsExclusionList(currentNode: Node, targetNode: string, excludedNodes: string[]): number {
        public static long FindPathCount(SortedList<string, Path> allPaths, string currentNode, string destination, long currentMultiple)
        {
            if (currentNode == destination)
            {
                return currentMultiple;
            }
            long traversedPaths = 0;
            var nextPaths = allPaths.Values.Where(x => x.origin == currentNode);
            foreach (var nextPath in nextPaths)
            {
                //console.log('calling node ' + ii + ' of ' + currentNode.links.length + '   ' + currentNode.links[ii].name);
                traversedPaths += FindPathCount(allPaths, nextPath.dest, destination, currentMultiple * nextPath.containedPathCount);
            }
            return traversedPaths;
        }


        public static void TrimDisconnectedPaths(SortedList<string, Path> allPaths)
        {
            Dictionary<string, int> pathsStartingFromPoint = new Dictionary<string, int>();
            Dictionary<string, int> pathsEndingAtPoint = new Dictionary<string, int>();

            foreach (var path in allPaths.Values)
            {
                if (!pathsStartingFromPoint.ContainsKey(path.origin))
                {
                    pathsStartingFromPoint.Add(path.origin, 0);
                }
                if (!pathsEndingAtPoint.ContainsKey(path.origin))
                {
                    pathsEndingAtPoint.Add(path.origin, 0);
                }
                if (!pathsStartingFromPoint.ContainsKey(path.dest))
                {
                    pathsStartingFromPoint.Add(path.dest, 0);
                }
                if (!pathsEndingAtPoint.ContainsKey(path.dest))
                {
                    pathsEndingAtPoint.Add(path.dest, 0);
                }
                pathsStartingFromPoint[path.origin]++;
                pathsEndingAtPoint[path.dest]++;
            }

            foreach (var kvp in pathsStartingFromPoint)
            {
                if (kvp.Value == 0 && !protectedNodes.Contains(kvp.Key))
                {
                    // nothing starts from this origin, so remove everything that ends there
                    for (int ii = allPaths.Count - 1; ii >= 0; ii--)
                    {
                        if (allPaths.Values[ii].dest == kvp.Key)
                        {
                            allPaths.RemoveAt(ii);
                        }
                    }
                }
            }
            foreach (var kvp in pathsEndingAtPoint)
            {
                if (kvp.Value == 0 && !protectedNodes.Contains(kvp.Key))
                {
                    // nothing ends here, so remove anything that starts from here
                    for (int ii = allPaths.Count - 1; ii >= 0; ii--)
                    {
                        if (allPaths.Values[ii].origin == kvp.Key)
                        {
                            allPaths.RemoveAt(ii);
                        }
                    }
                }
            }
        }

        public static void IterateAndAggregatePaths(SortedList<string, Path> allPaths)
        {
            // sort nodes by product of incoming and outgoing paths
            Dictionary<string, int> pathsStartingFromPoint = new Dictionary<string, int>();
            Dictionary<string, int> pathsEndingAtPoint = new Dictionary<string, int>();

            foreach (var path in allPaths.Values)
            {
                if (!pathsStartingFromPoint.ContainsKey(path.origin))
                {
                    pathsStartingFromPoint.Add(path.origin, 0);
                }
                if (!pathsEndingAtPoint.ContainsKey(path.origin))
                {
                    pathsEndingAtPoint.Add(path.origin, 0);
                }
                if (!pathsStartingFromPoint.ContainsKey(path.dest))
                {
                    pathsStartingFromPoint.Add(path.dest, 0);
                }
                if (!pathsEndingAtPoint.ContainsKey(path.dest))
                {
                    pathsEndingAtPoint.Add(path.dest, 0);
                }
                pathsStartingFromPoint[path.origin]++;
                pathsEndingAtPoint[path.dest]++;
            }


            Dictionary<string, int> totalPathsThroughPoint = new Dictionary<string, int>();
            foreach (var nodeToCount in pathsStartingFromPoint.Keys)
            {
                if (!protectedNodes.Contains(nodeToCount))
                {
                    totalPathsThroughPoint.Add(nodeToCount, pathsStartingFromPoint[nodeToCount] * pathsEndingAtPoint[nodeToCount]);
                }
            }

            List<string> nodesByPathCount = pathsStartingFromPoint.Keys.Where(k => !protectedNodes.Contains(k)).ToList();
            nodesByPathCount.Sort((a, b) =>
            {
                int productA = totalPathsThroughPoint[a];
                int productB = totalPathsThroughPoint[b];
                return productA.CompareTo(productB);
            });

            foreach (var nodeToRemove in nodesByPathCount)
            {
                List<Path> incomingPaths = new List<Path>();
                // pop the incoming paths
                for (int ii = allPaths.Count - 1; ii >= 0; ii--)
                {
                    if (allPaths.Values[ii].dest == nodeToRemove)
                    {
                        incomingPaths.Add(allPaths.Values[ii]);
                        allPaths.RemoveAt(ii);
                    }
                }
                List<Path> outgoingPaths = new List<Path>();
                // pop the outgoing paths
                for (int ii = allPaths.Count - 1; ii >= 0; ii--)
                {
                    if (allPaths.Values[ii].origin == nodeToRemove)
                    {
                        outgoingPaths.Add(allPaths.Values[ii]);
                        allPaths.RemoveAt(ii);
                    }
                }
                // add the cross product of paths, add to any existing paths for that route
                foreach (var incoming in incomingPaths)
                {
                    foreach (var outgoing in outgoingPaths)
                    {
                        Path newPath = new Path()
                        {
                            origin = incoming.origin,
                            dest = outgoing.dest,
                            containedPathCount = incoming.containedPathCount * outgoing.containedPathCount
                        };
                        var existingPath = allPaths.Values.FirstOrDefault(x => x.origin == newPath.origin && x.dest == newPath.dest);
                        if (existingPath != null)
                        {
                            existingPath.containedPathCount += newPath.containedPathCount;
                        }
                        else
                        {
                            allPaths.Add(newPath.origin + "->" + newPath.dest, newPath);
                        }
                    }
                }
            }
        }

        public static List<string> parseLines(string contents)
        {
            return contents.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).ToList();
        }

        public static SortedList<string, Path> parseNodes(List<string> lines){
	        SortedList<string, Path> allPaths = new SortedList<string, Path>();
            for (int jj = 0; jj < lines.Count; jj++)
            {
                var parts = lines[jj].Split(' ');
                var name = parts[0].Substring(0, parts[0].Length - 1);

                foreach (var target in parts)
                {
                    allPaths.Add(name + "->" + target, new Path()
                    {
                        origin = name,
                        dest = target,
                        containedPathCount = 1
                    });
                }
            }
            return allPaths;
        }
    }
}

