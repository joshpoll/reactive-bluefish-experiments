import { createContext, useContext } from "react";
import { createStore } from "solid-js/store";

/* 
TODO: should I create a Ref node like Row or like Layout? Should I expose a createRef function? What
about createNode? It's only used in Layout, so I'm not sure...

*/

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

export type ScenegraphNode = {
  bbox: BBox;
  transform: Transform;
  bboxOwners: BBoxOwners;
  transformOwners: TransformOwners;
  // children?: string[];
  // parents?: string[];
  // layout?
  // paint?
};

export const createScenegraph = (): BBoxStore => {
  const [scenegraph, setScenegraph] = createStore<{
    [key: string]: ScenegraphNode;
  }>({});

  // TODO: use a Proxy for each object to make objects appear as simply left, right, top, bottom, etc. even though
  // they are composed of internal dimensions and transform.

  const createNode = (id: string) => {
    setScenegraph(id, {
      bbox: {},
      bboxOwners: {},
      transform: {
        translate: {},
      },
      transformOwners: {
        translate: {},
      },
    });
  };

  const createRef = (id: string, refId: string) => {
    setScenegraph(id, scenegraph[refId]);
  };

  const getBBox = (id: string) => {
    return {
      get left() {
        const node = scenegraph[id];

        if (
          node.bbox.left === undefined ||
          node.transform.translate.x === undefined
        ) {
          return undefined;
        }

        return node.bbox.left + node.transform.translate.x;
      },
      get top() {
        const node = scenegraph[id];

        if (
          node.bbox.top === undefined ||
          node.transform.translate.y === undefined
        ) {
          return undefined;
        }

        return node.bbox.top + node.transform.translate.y;
      },
      get width() {
        return scenegraph[id].bbox.width;
      },
      get height() {
        return scenegraph[id].bbox.height;
      },
    };
  };

  const setSmartBBox = (id: string, bbox: BBox, owner: string) => {
    setScenegraph(id, (node: ScenegraphNode) => {
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
          `${owner} tried to set ${id}'s left to ${bbox.left} but it was already set by ${node.transformOwners.translate.x}. Only one component can set a bbox property. We skipped this update.`
        );
        return node;
      } else if (
        bbox.top !== undefined &&
        node.transformOwners.translate.y !== undefined &&
        node.transformOwners.translate.y !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s top to ${bbox.top} but it was already set by ${node.transformOwners.translate.y}. Only one component can set a bbox property. We skipped this update.`
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
        if (
          node.bbox.left === undefined &&
          node.transform.translate.x === undefined
        ) {
          proposedBBox.left = bbox.left;
          proposedTransform.translate.x = 0;
        } else if (
          node.bbox.left !== undefined &&
          node.transform.translate.x === undefined
        ) {
          proposedTransform.translate.x = node.bbox.left - bbox.left;
        }
      }

      if (bbox.top !== undefined) {
        if (
          node.bbox.top === undefined &&
          node.transform.translate.y === undefined
        ) {
          proposedBBox.top = bbox.top;
          proposedTransform.translate.y = 0;
        } else if (
          node.bbox.top !== undefined &&
          node.transform.translate.y === undefined
        ) {
          proposedTransform.translate.y = node.bbox.top - bbox.top;
        }
      }

      const newBBoxOwners = {
        ...node.bboxOwners,
        ...(bbox.left ? { left: owner } : {}),
        ...(bbox.top ? { top: owner } : {}),
        // ...(bbox.width ? { width: owner } : {}),
        // ...(bbox.height ? { height: owner } : {}),
      };

      const newTransformOwners: TransformOwners = {
        translate: {
          x:
            node.transformOwners.translate.x ?? (bbox.left ? owner : undefined),
          y: node.transformOwners.translate.y ?? (bbox.top ? owner : undefined),
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
      };
    });
  };

  const setBBox = (
    id: string,
    bbox: Partial<BBox>,
    owner: string,
    transform?: Transform
  ) => {
    setScenegraph(id, (node: ScenegraphNode) => {
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
        ...(bbox.left ? { left: owner } : {}),
        ...(bbox.top ? { top: owner } : {}),
        ...(bbox.width ? { width: owner } : {}),
        ...(bbox.height ? { height: owner } : {}),
      };

      const newTransformOwners: TransformOwners = {
        translate: {
          x:
            node.transformOwners.translate.x ??
            (transform?.translate.x ? owner : undefined),
          y:
            node.transformOwners.translate.y ??
            (transform?.translate.y ? owner : undefined),
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
      };
    });
  };

  return [
    scenegraph,
    { getBBox, setSmartBBox, setBBox, createNode, createRef },
  ];
};

export type BBoxStore = [
  get: { [key: string]: ScenegraphNode },
  set: {
    // TODO: move this out of set...
    getBBox: (id: string) => BBox;
    setSmartBBox: (id: string, bbox: BBox, owner: string) => void;
    setBBox: (
      id: string,
      bbox: Partial<BBox>,
      owner: string,
      transform?: Transform
    ) => void;
    createNode: (id: string) => void;
    createRef: (id: string, refId: string) => void;
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
  smartSet: (id: string, bbox: BBox, owner: string) => void
] => {
  const [scenegraph, { setBBox, getBBox, setSmartBBox }] =
    useContext(BBoxContext)!;
  return [scenegraph, setBBox, getBBox, setSmartBBox];
};
