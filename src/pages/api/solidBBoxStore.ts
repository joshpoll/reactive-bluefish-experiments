import { createContext } from "react";
import { createStore } from "solid-js/store";

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

  const setBBox = (
    id: string,
    bbox: Partial<BBox>,
    owner: string,
    transform?: Transform
  ) => {
    setScenegraph(id, (node: ScenegraphNode) => {
      if (
        bbox.left &&
        node.bboxOwners.left !== undefined &&
        node.bboxOwners.left !== owner
      ) {
        throw new Error(
          `${owner} tried to set ${id}'s left to ${bbox.left} but it was already set by ${node.bboxOwners.left}. Only one component can set a bbox property.`
        );
      } else if (
        bbox.top &&
        node.bboxOwners.top !== undefined &&
        node.bboxOwners.top !== owner
      ) {
        throw new Error(
          `${owner} tried to set ${id}'s top to ${bbox.top} but it was already set by ${node.bboxOwners.top}. Only one component can set a bbox property.`
        );
      } else if (
        bbox.width &&
        node.bboxOwners.width !== undefined &&
        node.bboxOwners.width !== owner
      ) {
        throw new Error(
          `${owner} tried to set ${id}'s width to ${bbox.width} but it was already set by ${node.bboxOwners.width}. Only one component can set a bbox property.`
        );
      } else if (
        bbox.height &&
        node.bboxOwners.height !== undefined &&
        node.bboxOwners.height !== owner
      ) {
        throw new Error(
          `${owner} tried to set ${id}'s height to ${bbox.height} but it was already set by ${node.bboxOwners.height}. Only one component can set a bbox property.`
        );
      } else if (
        transform?.translate.x &&
        node.transformOwners.translate.x !== undefined &&
        node.transformOwners.translate.x !== owner
      ) {
        throw new Error(
          `${owner} tried to set ${id}'s translate.x to ${transform.translate.x} but it was already set by ${node.transformOwners.translate.x}. Only one component can set a transform property.`
        );
      } else if (
        transform?.translate.y &&
        node.transformOwners.translate.y !== undefined &&
        node.transformOwners.translate.y !== owner
      ) {
        throw new Error(
          `${owner} tried to set ${id}'s translate.y to ${transform.translate.y} but it was already set by ${node.transformOwners.translate.y}. Only one component can set a transform property.`
        );
      }

      const newBBoxOwners = {
        ...node.bboxOwners,
        ...(bbox.left ? { left: owner } : {}),
        ...(bbox.top ? { top: owner } : {}),
        ...(bbox.width ? { width: owner } : {}),
        ...(bbox.height ? { height: owner } : {}),
      };

      const newTransformOwners = {
        ...node.transformOwners,
        ...(transform?.translate.x ? { x: owner } : {}),
        ...(transform?.translate.y ? { y: owner } : {}),
      };

      // merge currentBbox and bbox, but don't overwrite currentBbox values with undefined
      const newBBox = mergeObjects(node.bbox, bbox);

      const newTransform = mergeObjects(
        node.transform,
        transform ?? { translate: {} }
      ) as Transform;

      // console.log("setBBox", id, bbox, owner, newBBox, newBBoxOwners);

      return {
        bbox: newBBox,
        bboxOwners: newBBoxOwners,
        transform: newTransform,
        transformOwners: newTransformOwners,
      };
    });
  };

  return [scenegraph, { setBBox, createNode }];
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
  }
];

export const BBoxContext = createContext<BBoxStore | null>(null);