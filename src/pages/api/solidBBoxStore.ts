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

export type ScenegraphNode = {
  bbox: BBox;
  bboxOwners: BBoxOwners;
};

export const createScenegraph = (): [
  get: { [key: string]: ScenegraphNode },
  set: {
    setBBox: (id: string, bbox: Partial<BBox>, owner: string) => void;
  }
] => {
  const [scenegraph, setScenegraph] = createStore<{
    [key: string]: ScenegraphNode;
  }>({});

  const setBBox = (id: string, bbox: Partial<BBox>, owner: string) => {
    setScenegraph(id, (node) => {
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
      }

      const newBBoxOwners = {
        ...node.bboxOwners,
        ...(bbox.left ? { left: owner } : {}),
        ...(bbox.top ? { top: owner } : {}),
        ...(bbox.width ? { width: owner } : {}),
        ...(bbox.height ? { height: owner } : {}),
      };

      // merge currentBbox and bbox, but don't overwrite currentBbox values with undefined
      const newBBox = mergeObjects(node.bbox, bbox);

      return {
        bbox: newBBox,
        bboxOwners: newBBoxOwners,
      };
    });
  };

  return [scenegraph, { setBBox }];
};

export type BBoxStore = [
  get: { [key: string]: ScenegraphNode },
  set: {
    setBBox: (id: string, bbox: Partial<BBox>, owner: string) => void;
  }
];

export const BBoxContext = createContext<BBoxStore | null>(null);
