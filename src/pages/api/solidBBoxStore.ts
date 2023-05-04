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

  return [scenegraph, { setBBox, createNode, createRef }];
};

export type BBoxStore = [
  get: { [key: string]: ScenegraphNode },
  set: {
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
  ) => void
] => {
  const [scenegraph, { setBBox }] = useContext(BBoxContext)!;
  return [scenegraph, setBBox];
};
