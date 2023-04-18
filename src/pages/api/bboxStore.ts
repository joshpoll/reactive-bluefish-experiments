import { observable, action, computed, makeObservable, autorun } from "mobx";
import { createContext } from "react";

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

export class BBoxStore {
  bboxes: Map<string, { bbox: BBox; owners: BBoxOwners }> = new Map();

  constructor() {
    makeObservable(this, {
      bboxes: observable,
      setBbox: action,
    });
    // console log the bboxes any time they change
    // autorun(() => console.log(this.bboxes.values()));
  }

  setBbox(id: string, bbox: Partial<BBox>, owner: string) {
    const currentBbox = this.bboxes.get(id)?.bbox;
    const currentOwners = this.bboxes.get(id)?.owners ?? {};

    if (
      bbox.left &&
      currentOwners.left !== undefined &&
      currentOwners.left !== owner
    ) {
      throw new Error(
        `${owner} tried to set ${id}'s left to ${bbox.left} but it was already set by ${currentOwners.left}. Only one component can set a bbox property.`
      );
    } else if (
      bbox.top &&
      currentOwners.top !== undefined &&
      currentOwners.top !== owner
    ) {
      throw new Error(
        `${owner} tried to set ${id}'s top to ${bbox.top} but it was already set by ${currentOwners.top}. Only one component can set a bbox property.`
      );
    } else if (
      bbox.width &&
      currentOwners.width !== undefined &&
      currentOwners.width !== owner
    ) {
      throw new Error(
        `${owner} tried to set ${id}'s width to ${bbox.width} but it was already set by ${currentOwners.width}. Only one component can set a bbox property.`
      );
    } else if (
      bbox.height &&
      currentOwners.height !== undefined &&
      currentOwners.height !== owner
    ) {
      throw new Error(
        `${owner} tried to set ${id}'s height to ${bbox.height} but it was already set by ${currentOwners.height}. Only one component can set a bbox property.`
      );
    }

    const owners = {
      ...currentOwners,
      ...(bbox.left ? { left: owner } : {}),
      ...(bbox.top ? { top: owner } : {}),
      ...(bbox.width ? { width: owner } : {}),
      ...(bbox.height ? { height: owner } : {}),
    };

    // merge currentBbox and bbox, but don't overwrite currentBbox values with undefined
    const newBBox = mergeObjects(currentBbox ?? {}, bbox);

    this.bboxes.set(id, {
      bbox: newBBox,
      owners,
    });
  }

  getBbox(id: string): BBox | undefined {
    return this.bboxes.get(id)?.bbox;
  }
}

export const BBoxContext = createContext<BBoxStore | null>(null);
