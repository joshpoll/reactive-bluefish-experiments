import { createContext, useContext } from "react";
import { createStore, produce } from "solid-js/store";

export type BBox = {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
};

export type BBoxOwners = {
  left?: string;
  top?: string;
  width?: string;
  height?: string;
};

export type TransformOwners = {
  translate: {
    x?: string;
    y?: string;
  };
};

function mergeObjects(
  obj1: Record<string, any>,
  obj2: Record<string, any>
): Record<string, any> {
  const result: any = { ...obj1 };

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (typeof obj2[key] !== "undefined") {
        result[key] = obj2[key];
      }
    }
  }

  return result;
}

export type Transform = {
  translate: {
    x?: number;
    y?: number;
  };
};

export type ScenegraphNode =
  | {
      type: "node";
      bbox: BBox;
      transform: Transform;
      bboxOwners: BBoxOwners;
      transformOwners: TransformOwners;
      children: Set<string>;
      parent: string | null;
      // parents?: string[];
      // layout?
      // paint?
    }
  | {
      type: "ref";
      refId: string;
      transform: Transform;
      parent: string | null;
    };

export const createScenegraph = (): BBoxStore => {
  const [scenegraph, setScenegraph] = createStore<{
    [key: string]: ScenegraphNode;
  }>({});

  // TODO: use a Proxy for each object to make objects appear as simply left, right, top, bottom, etc. even though
  // they are composed of internal dimensions and transform.

  const createNode = (id: string, parentId: string | null) => {
    setScenegraph(id, {
      type: "node",
      bbox: {},
      bboxOwners: {},
      transform: {
        translate: {},
      },
      transformOwners: {
        translate: {},
      },
      children: new Set(),
      parent: parentId,
    });

    if (parentId !== null) {
      setScenegraph(parentId, (node: ScenegraphNode) => {
        if (node.type === "ref") {
          console.error("Cannot add children to a ref node.");
          return node;
        }
        return {
          ...node,
          children: new Set([...Array.from(node.children), id]),
        };
      });
    }
  };

  const createRef = (id: string, refId: string, parentId: string | null) => {
    setScenegraph(id, {
      type: "ref",
      refId,
      transform: {
        translate: {},
      },
      parent: parentId,
    });

    if (parentId !== null) {
      setScenegraph(parentId, (node: ScenegraphNode) => {
        if (node.type === "ref") {
          console.error("Cannot add children to a ref node.");
          return node;
        }
        return {
          ...node,
          children: new Set([...Array.from(node.children), id]),
        };
      });
    }
  };

  const getCurrentBBox = (
    scenegraph: { [key: string]: ScenegraphNode },
    id: string
  ) => {
    return {
      get left() {
        const node = getNode(scenegraph, id);
        if (
          node.bbox.left === undefined ||
          node.transform.translate.x === undefined
        ) {
          return undefined;
        }

        return node.bbox.left + node.transform.translate.x;
      },
      get top() {
        const node = getNode(scenegraph, id);

        if (
          node.bbox.top === undefined ||
          node.transform.translate.y === undefined
        ) {
          return undefined;
        }

        return node.bbox.top + node.transform.translate.y;
      },
      get width() {
        const node = getNode(scenegraph, id);
        return node.bbox.width;
      },
      get height() {
        const node = getNode(scenegraph, id);
        return node.bbox.height;
      },
    };
  };

  const getNode = (
    scenegraph: { [key: string]: ScenegraphNode },
    id: string
  ): ScenegraphNode & { type: "node" } => {
    let node = scenegraph[id];
    if (node.type === "ref") {
      let transform: { translate: { x?: number; y?: number } } = {
        translate: { x: 0, y: 0 },
      };
      let currNode: ScenegraphNode = node;
      while (currNode.type === "ref") {
        const transformDiff = getTransformDiff(id, currNode.refId);
        const xUndefined =
          transform.translate.x === undefined ||
          transformDiff.translate.x === undefined;
        const yUndefined =
          transform.translate.y === undefined ||
          transformDiff.translate.y === undefined;
        transform = {
          translate: {
            x: !xUndefined
              ? transform.translate.x! + transformDiff.translate.x!
              : undefined,
            y: !yUndefined
              ? transform.translate.y! + transformDiff.translate.y!
              : undefined,
          },
        };
        currNode = scenegraph[currNode.refId];
      }

      return {
        ...currNode,
        transform,
      };
    }
    return node;
  };

  const getBBox = (id: string) => {
    return {
      get left() {
        const node = getNode(scenegraph, id);
        if (
          node.bbox.left === undefined ||
          node.transform.translate.x === undefined
        ) {
          return undefined;
        }

        return node.bbox.left + node.transform.translate.x;
      },
      get top() {
        const node = getNode(scenegraph, id);

        if (
          node.bbox.top === undefined ||
          node.transform.translate.y === undefined
        ) {
          return undefined;
        }

        return node.bbox.top + node.transform.translate.y;
      },
      get width() {
        const node = getNode(scenegraph, id);

        return node.bbox.width;
      },
      get height() {
        const node = getNode(scenegraph, id);

        return node.bbox.height;
      },
    };
  };

  const getAncestorChain = (id: string): string[] => {
    const chain = [];
    let node = scenegraph[id];
    while (node.parent !== null) {
      chain.push(node.parent);
      node = scenegraph[node.parent];
    }
    return chain;
  };

  const getLCAChain = (id1: string, id2: string): string[] => {
    const chain1 = getAncestorChain(id1);
    const chain2 = getAncestorChain(id2);

    const lcaChain = [];
    for (let i = 0; i < Math.min(chain1.length, chain2.length); i++) {
      if (chain1[i] === chain2[i]) {
        lcaChain.push(chain1[i]);
      } else {
        break;
      }
    }

    return lcaChain;
  };

  // like getLCAChain, but returns the suffixes of the chains instead
  const getLCAChainSuffixes = (
    id1: string,
    id2: string
  ): [string[], string[]] => {
    const chain1 = getAncestorChain(id1);
    const chain2 = getAncestorChain(id2);

    const lcaChain = [];
    for (let i = 0; i < Math.min(chain1.length, chain2.length); i++) {
      if (chain1[i] === chain2[i]) {
        lcaChain.push(chain1[i]);
      } else {
        break;
      }
    }

    return [chain1.slice(lcaChain.length), chain2.slice(lcaChain.length)];
  };

  const getTransformDiff = (
    id1: string,
    id2: string
  ): { translate: { x?: number; y?: number } } => {
    const [id1Suffix, id2Suffix] = getLCAChainSuffixes(id1, id2);
    console.log(
      `transformDiff ${id1} ${id2}`,
      id1Suffix.map((id) => ({
        id,
        transform: JSON.parse(JSON.stringify(scenegraph[id].transform)),
      })),
      id2Suffix.map((id) => ({
        id,
        transform: JSON.parse(JSON.stringify(scenegraph[id].transform)),
      }))
    );
    // accumulate transforms from id1 to id2
    let transform: {
      translate: { x?: number; y?: number };
    } = {
      translate: {
        x: 0,
        y: 0,
      },
    };

    // first go up the id2 chain
    for (const node of id2Suffix) {
      const xUndefined =
        scenegraph[node].transform.translate.x === undefined ||
        transform.translate.x === undefined;
      const yUndefined =
        scenegraph[node].transform.translate.y === undefined ||
        transform.translate.y === undefined;
      transform = {
        translate: {
          x: !xUndefined
            ? scenegraph[node].transform.translate.x! + transform.translate.x!
            : undefined,
          y: !yUndefined
            ? scenegraph[node].transform.translate.y! + transform.translate.y!
            : undefined,
        },
      };
    }

    // then go down the id1 chain
    for (const node of id1Suffix) {
      const xUndefined =
        scenegraph[node].transform.translate.x === undefined ||
        transform.translate.x === undefined;
      const yUndefined =
        scenegraph[node].transform.translate.y === undefined ||
        transform.translate.y === undefined;
      transform = {
        translate: {
          x: !xUndefined
            ? transform.translate.x! - scenegraph[node].transform.translate.x!
            : undefined,
          y: !yUndefined
            ? transform.translate.y! - scenegraph[node].transform.translate.y!
            : undefined,
        },
      };
    }

    return transform;
  };

  const setSmartBBox = (id: string, bbox: BBox, owner: string) => {
    if (id === "innerRect11") {
      console.log("setSmartBBox", id, bbox, owner);
    }
    setScenegraph(id, (node: ScenegraphNode) => {
      if (node.type === "ref") {
        // // const thisTransform = scenegraph[node.parent!].transform;
        // const [idSuffix, refIdSuffix] = getLCAChainSuffixes(id, node.refId);
        // console.log("idSuffix", idSuffix);
        // console.log("ownerSuffix", refIdSuffix);
        // // accumulate transforms from owner to id
        // let transform = {
        //   translate: {
        //     x: 0,
        //     y: 0,
        //   },
        // };
        // // first go up the refId chain
        // for (const node of refIdSuffix) {
        //   transform = {
        //     translate: {
        //       x:
        //         (scenegraph[node].transform.translate.x ?? 0) +
        //         (transform.translate.x ?? 0),
        //       y:
        //         (scenegraph[node].transform.translate.y ?? 0) +
        //         (transform.translate.y ?? 0),
        //     },
        //   };
        // }

        // // then go down the id chain
        // for (const id of idSuffix) {
        //   transform = {
        //     translate: {
        //       x:
        //         (transform.translate.x ?? 0) -
        //         (scenegraph[id].transform.translate.x ?? 0),
        //       y:
        //         (transform.translate.y ?? 0) -
        //         (scenegraph[id].transform.translate.y ?? 0),
        //     },
        //   };
        // }
        const transform = getTransformDiff(id, node.refId);

        if (
          transform.translate.x === undefined &&
          scenegraph[node.refId].type === "node"
        ) {
          // set all the x translates in the chains to 0 if they are not yet defined
          const [idSuffix, refIdSuffix] = getLCAChainSuffixes(id, node.refId);
          for (const id of idSuffix) {
            if (scenegraph[id].transform.translate.x === undefined) {
              setScenegraph(
                id,
                produce((node: ScenegraphNode) => {
                  node.transform.translate.x = 0;
                })
              );
            }
          }
          for (const id of refIdSuffix) {
            if (scenegraph[id].transform.translate.x === undefined) {
              setScenegraph(
                id,
                produce((node: ScenegraphNode) => {
                  node.transform.translate.x = 0;
                })
              );
            }
          }
        }

        if (
          transform.translate.y === undefined &&
          scenegraph[node.refId].type === "node"
        ) {
          // set all the y translates in the chains to 0 if they are not yet defined
          const [idSuffix, refIdSuffix] = getLCAChainSuffixes(id, node.refId);
          for (const id of idSuffix) {
            if (scenegraph[id].transform.translate.y === undefined) {
              setScenegraph(
                id,
                produce((node: ScenegraphNode) => {
                  node.transform.translate.y = 0;
                })
              );
            }
            for (const id of refIdSuffix) {
              if (scenegraph[id].transform.translate.y === undefined) {
                setScenegraph(
                  id,
                  produce((node: ScenegraphNode) => {
                    node.transform.translate.y = 0;
                  })
                );
              }
            }
          }
        }

        const newBBox = {
          left:
            bbox.left !== undefined
              ? bbox.left - (transform.translate.x ?? 0)
              : undefined,
          top:
            bbox.top !== undefined
              ? bbox.top - (transform.translate.y ?? 0)
              : undefined,
          width: bbox.width,
          height: bbox.height,
        };

        console.log("setSmartBBox-ref", id, transform, newBBox, owner);
        setSmartBBox(node.refId, newBBox, owner);
        return node;
      }

      // if left and translate.x are both undefined, then set left to the input value and set
      // translate.x to 0.
      // if left is defined, and translate.x is undefined, then set translate.x to the difference
      // between the input value and left.
      // if both are defined, then check ownership. If there's an ownership conflict, then
      // console.error and return
      // if left and translate.x are both owned by us, then set left to the input value and set
      // translate.x to 0.
      // if left is owned by someone else, and translate.x is owned by us, then set translate.x

      if (
        bbox.left !== undefined &&
        node.transformOwners.translate.x !== undefined &&
        node.transformOwners.translate.x !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s left to ${
            bbox.left
          } but it was already set to ${
            (node.bbox.left ?? 0) + (node.transform.translate.x ?? 0)
          } by ${
            node.transformOwners.translate.x
          }. Only one component can set a bbox property. We skipped this update.`
        );
        return node;
      } else if (
        bbox.top !== undefined &&
        node.transformOwners.translate.y !== undefined &&
        node.transformOwners.translate.y !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s top to ${
            bbox.top
          } but it was already set to ${
            (node.bbox.top ?? 0) + (node.transform.translate.y ?? 0)
          } by ${
            node.transformOwners.translate.y
          }. Only one component can set a bbox property. We skipped this update.`
        );
        return node;
      }
      // TODO: there are a bunch of other cases to consider, but I don't think they'll come up just
      // yet so we'll skip them...

      const proposedBBox: BBox = {};
      const proposedTransform: Transform = {
        translate: {},
      };

      if (bbox.left !== undefined) {
        if (node.bboxOwners.left === id) {
          proposedBBox.left = bbox.left;
          proposedTransform.translate.x = 0;
        } else if (node.transformOwners.translate.x === id) {
          proposedTransform.translate.x = bbox.left - node.bbox.left!;
        }
      }

      if (bbox.top !== undefined) {
        if (node.bboxOwners.top === id) {
          proposedBBox.top = bbox.top;
          proposedTransform.translate.y = 0;
        } else if (node.transformOwners.translate.y === id) {
          proposedTransform.translate.y = bbox.top - node.bbox.top!;
        }
      }

      const newBBoxOwners = {
        ...node.bboxOwners,
        ...(bbox.left !== undefined && node.bboxOwners.left === undefined
          ? { left: owner }
          : {}),
        ...(bbox.top !== undefined && node.bboxOwners.top === undefined
          ? { top: owner }
          : {}),
        // ...(bbox.width ? { width: owner } : {}),
        // ...(bbox.height ? { height: owner } : {}),
      };

      const newTransformOwners: TransformOwners = {
        translate: {
          x:
            node.transformOwners.translate.x ??
            (bbox.left !== undefined ? owner : undefined),
          y:
            node.transformOwners.translate.y ??
            (bbox.top !== undefined ? owner : undefined),
        },
      };

      const newBBox = mergeObjects(node.bbox, proposedBBox);

      const newTranslate = mergeObjects(
        node.transform.translate,
        proposedTransform.translate
      );

      const newTransform = {
        translate: newTranslate,
      };

      return {
        bbox: newBBox,
        bboxOwners: newBBoxOwners,
        transform: newTransform,
        transformOwners: newTransformOwners,
        children: node.children,
      };
    });
  };

  const setBBox = (
    id: string,
    bbox: Partial<BBox>,
    owner: string,
    transform?: Transform
  ) => {
    if (id === "innerRect11") {
      console.log("setBBox", id, bbox, owner);
    }
    setScenegraph(id, (node: ScenegraphNode) => {
      if (node.type === "ref") {
        console.log("ref", node);
        // console.error("Mutating refs is not currently supported. Skipping.");
        // return node;
        setBBox(node.refId, bbox, owner, transform);
        return node;
      }
      if (
        bbox.left !== undefined &&
        node.bboxOwners.left !== undefined &&
        node.bboxOwners.left !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s left to ${bbox.left} but it was already set by ${node.bboxOwners.left}. Only one component can set a bbox property. We skipped this update.`
        );
        return node;
      } else if (
        bbox.top !== undefined &&
        node.bboxOwners.top !== undefined &&
        node.bboxOwners.top !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s top to ${bbox.top} but it was already set by ${node.bboxOwners.top}. Only one component can set a bbox property. We skipped this update.`
        );
        return node;
      } else if (
        bbox.width !== undefined &&
        node.bboxOwners.width !== undefined &&
        node.bboxOwners.width !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s width to ${bbox.width} but it was already set by ${node.bboxOwners.width}. Only one component can set a bbox property. We skipped this update.`
        );
        return node;
      } else if (
        bbox.height !== undefined &&
        node.bboxOwners.height !== undefined &&
        node.bboxOwners.height !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s height to ${bbox.height} but it was already set by ${node.bboxOwners.height}. Only one component can set a bbox property. We skipped this update.`
        );
        return node;
      } else if (
        transform?.translate.x !== undefined &&
        node.transformOwners.translate.x !== undefined &&
        node.transformOwners.translate.x !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s translate.x to ${transform.translate.x} but it was already set by ${node.transformOwners.translate.x}. Only one component can set a transform property. We skipped this update.`
        );
        return node;
      } else if (
        transform?.translate.y !== undefined &&
        node.transformOwners.translate.y !== undefined &&
        node.transformOwners.translate.y !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s translate.y to ${transform.translate.y} but it was already set by ${node.transformOwners.translate.y}. Only one component can set a transform property. We skipped this update.`
        );
        return node;
      }

      const newBBoxOwners = {
        ...node.bboxOwners,
        ...(bbox.left !== undefined ? { left: owner } : {}),
        ...(bbox.top !== undefined ? { top: owner } : {}),
        ...(bbox.width !== undefined ? { width: owner } : {}),
        ...(bbox.height !== undefined ? { height: owner } : {}),
      };

      const newTransformOwners: TransformOwners = {
        translate: {
          x:
            node.transformOwners.translate.x ??
            (transform?.translate.x !== undefined ? owner : undefined),
          y:
            node.transformOwners.translate.y ??
            (transform?.translate.y !== undefined ? owner : undefined),
        },
      };

      // merge currentBbox and bbox, but don't overwrite currentBbox values with undefined
      const newBBox = mergeObjects(node.bbox, bbox);

      const newTranslate = mergeObjects(
        node.transform.translate,
        transform?.translate ?? {}
      );

      const newTransform = {
        translate: newTranslate,
      };

      return {
        bbox: newBBox,
        bboxOwners: newBBoxOwners,
        transform: newTransform,
        transformOwners: newTransformOwners,
        children: node.children,
      };
    });
  };

  return [
    scenegraph,
    {
      getBBox,
      setSmartBBox,
      setBBox,
      createNode,
      createRef,
      getCurrentBBox,
      getNode,
    },
  ];
};

export type BBoxStore = [
  get: { [key: string]: ScenegraphNode },
  set: {
    // TODO: move this out of set...
    getBBox: (id: string) => BBox;
    getCurrentBBox: (
      scenegraph: { [key: string]: ScenegraphNode },
      id: string
    ) => BBox;
    getNode: (
      scenegraph: { [key: string]: ScenegraphNode },
      id: string
    ) => ScenegraphNode & { type: "node" };
    setSmartBBox: (id: string, bbox: BBox, owner: string) => void;
    setBBox: (
      id: string,
      bbox: Partial<BBox>,
      owner: string,
      transform?: Transform
    ) => void;
    createNode: (id: string, parentId: string | null) => void;
    createRef: (id: string, refId: string, parentId: string | null) => void;
  }
];

export const BBoxContext = createContext<BBoxStore | null>(null);

export const useScenegraph = (): [
  get: { [key: string]: ScenegraphNode },
  set: (
    id: string,
    bbox: Partial<BBox>,
    owner: string,
    transform?: Transform
  ) => void,
  smartGet: (id: string) => BBox,
  smartSet: (id: string, bbox: BBox, owner: string) => void,
  getNode: (
    scenegraph: { [key: string]: ScenegraphNode },
    id: string
  ) => ScenegraphNode & { type: "node" }
] => {
  const [scenegraph, { setBBox, getBBox, setSmartBBox, getNode }] =
    useContext(BBoxContext)!;
  return [scenegraph, setBBox, getBBox, setSmartBBox, getNode];
};

export const ParentIDContext = createContext<string | null>(null);
