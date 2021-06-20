import { chunk, uniq, uniqWith } from 'lodash';
import wait from 'waait';

type Node = string;
type Edge = [string, string];
type AdjacencyList = Map<string, string[]>;

const buildAdjacencyList = (edges: Edge[], nodes: Node[]): AdjacencyList => {
  const adjacencyList = new Map();
  nodes.forEach((node) => adjacencyList.set(node, []));
  edges.forEach(([from, to]) => adjacencyList.get(from).push(to));
  edges.forEach(([from, to]) => adjacencyList.get(to).push(from));
  return adjacencyList;
};

const compareEdge = (edge1: Edge, edge2: Edge) =>
  edge1.every((edge) => edge2.some((e) => edge === e));

const dfs = (
  fromId: string,
  toId: string,
  adjacencyList: AdjacencyList
): Promise<string[]> =>
  new Promise((resolve) => callbackDfs(fromId, toId, adjacencyList, resolve));

const callbackDfs = (
  start: string,
  goal: string,
  adjacencyList: AdjacencyList,
  callBack: (stuff: any) => void,
  visited = new Set(),
  path: string[] = [start]
) => {
  visited.add(start);
  const destinations = adjacencyList.get(start)!;
  if (destinations.includes(goal)) {
    callBack([...path, goal]);
  }
  for (const destination of destinations) {
    if (!visited.has(destination)) {
      callbackDfs(destination, goal, adjacencyList, callBack, visited, [
        ...path,
        destination,
      ]);
    }
  }
};

export async function findNewPath<T>(
  fromId: string,
  toId: string,
  pools: T[],
  identifier: (pool: T) => Edge
) {
  await wait(1000).then(() => {
    throw new Error('Failed finding path within timeout');
  });
  const edges = uniqWith(pools.map(identifier), compareEdge);
  const nodes: Node[] = uniq(edges.flat(1));

  const adjacencyList = buildAdjacencyList(edges, nodes);
  const startExists = adjacencyList.get(fromId);
  const goalExists = adjacencyList.get(toId);

  if (!(startExists && goalExists))
    throw new Error(
      `Start ${fromId} or goal ${toId} does not exist in adjacency list`
    );

  const dfsResult = await dfs(fromId, toId, adjacencyList)!;
  if (!dfsResult || dfsResult.length === 0)
    throw new Error('Failed to find path');

  const hops = chunk(dfsResult, 2).map((tokenIds, index, arr) => {
    let searchAbleIds: string[];

    if (tokenIds.length < 2) {
      searchAbleIds = [arr[index - 1][1], tokenIds[0]];
    } else searchAbleIds = tokenIds;

    const accomodatingRelays = pools.filter((pool) => {
      const ids = identifier(pool);
      return ids.every((id) => searchAbleIds.some((i) => id === i));
    });

    return accomodatingRelays;
  });

  return {
    path: dfsResult,
    hops,
  };
}
