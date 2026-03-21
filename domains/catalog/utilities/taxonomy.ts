import type {
  TaxonomyId,
  TaxonomyNode,
  TaxonomyPath
} from "@spareparts/contracts";

/**
 * Represents a taxonomy tree with nested children.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** domain only; no persistence semantics
 * - **Invariants:** tree is acyclic; each node has at most one parent
 */
export interface TaxonomyTree extends TaxonomyNode {
  children: TaxonomyTree[];
}

/**
 * Builds a taxonomy tree from flat nodes.
 *
 * @param nodes - Flat array of taxonomy nodes
 * @returns Root nodes with nested children
 *
 * @example
 * ```ts
 * const tree = buildTaxonomyTree([
 * { id: "1", parentId: null, label: "Electronics" },
 * { id: "2", parentId: "1", label: "Phones" }
 * ]);
 * // [{ id: "1", children: [{ id: "2", children: [] }] }]
 * ```
 */
export function buildTaxonomyTree(nodes: TaxonomyNode[]): TaxonomyTree[] {
  const nodeMap = new Map<TaxonomyId, TaxonomyTree>();
  const roots: TaxonomyTree[] = [];

  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, children: [] });
  }

  for (const node of nodes) {
    const treeNode = nodeMap.get(node.id)!;

    if (node.parentId === null) {
      roots.push(treeNode);
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(treeNode);
      }

      // If parent not found, node is orphaned; to be ignored or handled as needed
    }
  }
  return roots;
}

/**
 * Finds the ancestor path for a taxonomy node.
 *
 * @param nodeId - Target node ID
 * @param nodes - Flat array of all taxonomy nodes
 * @returns Ordered path from root to the target node
 *
 * @throws Error when node is not found or cycle is detected
 */
export function getAncestorPath(
  nodeId: TaxonomyId,
  nodes: TaxonomyNode[]
): TaxonomyPath {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const path: TaxonomyNode[] = [];
  const visited = new Set<TaxonomyId>();
  let currentId: TaxonomyId | null = nodeId;

  while (currentId !== null) {
    if (visited.has(currentId)) {
      throw new Error("Cycle detected in taxonomy hierarchy");
    }

    const node = nodeMap.get(currentId);
    if (!node) {
      throw new Error(`Taxonomy node not found: ${currentId}`);
    }

    path.unshift(node);
    visited.add(currentId);
    currentId = node.parentId;
  }

  return path;
}

/**
 * Gets all descendant IDs for a taxonomy node.
 *
 * @param nodeId - Root node ID
 * @param nodes - Flat array of all taxonomy nodes
 * @returns Set of descendant node IDs (including the root)
 */
export function getDescendantIds(
  nodeId: TaxonomyId,
  nodes: TaxonomyNode[]
): Set<TaxonomyId> {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const descendants = new Set<TaxonomyId>();
  const toVisit = [nodeId];

  while (toVisit.length > 0) {
    const currentId = toVisit.pop()!;
    descendants.add(currentId);

    // Find direct children
    for (const node of nodes) {
      if (node.parentId === currentId && !descendants.has(node.id)) {
        toVisit.push(node.id);
      }
    }
  }
  return descendants;
}

/**
 * Validates taxonomy structure for cycles and orphaned nodes.
 *
 * @param nodes - Flat array of taxonomy nodes
 * @returns true if structure is valid
 *
 * @throws Error when cycles or orphaned nodes are detected
 */
export function validateTaxonomyStructure(nodes: TaxonomyNode[]): boolean {
  const nodeIds = new Set(nodes.map(n => n.id));

  // Check for orphaned children
  const roots = nodes.filter(n => n.parentId === null);
  for (const root of roots) {
    getAncestorPath(root.id, nodes); // throws if cycle detected
  }
  return true;
}
