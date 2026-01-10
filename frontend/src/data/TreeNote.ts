export interface TreeNode {
  key: string;
  value: string | null;
  children?: TreeNode[];
}

export function updateTree(
  nodes: TreeNode[],
  predicate: (node: TreeNode) => boolean,
  updater: (node: TreeNode) => TreeNode
): TreeNode[] {
  return nodes.map(node => {
    if (predicate(node)) {
      return updater(node);
    }

    if (node.children) {
      return {
        ...node,
        children: updateTree(node.children, predicate, updater)
      };
    }
    return node;
  });
}


export function upsertTag(
  tagsNode: TreeNode,
  key: string,
  value: string
): TreeNode {
  const children = tagsNode.children ?? [];

  const existing = children.find(c => c.key === key);

  if (existing) {
    return {
      ...tagsNode,
      children: children.map(c =>
        c.key === key ? { ...c, value } : c
      )
    };
  }

  return {
    ...tagsNode,
    children: [...children, { key, value }]
  };
}
