import {
  action,
  computed,
  makeObservable,
  autorun,
  trace,
  observable,
  ObservableMap,
} from "mobx";
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

export class ScenegraphNode {
  bbox: BBox = {};
  bboxOwners: BBoxOwners = {};

  constructor(public id: string) {
    makeObservable(this, {
      id: observable,
      bbox: observable,
      bboxOwners: observable,
      setBbox: action,
      getBbox: computed,
    });
  }

  setBbox(bbox: Partial<BBox>, owner: string): void {
    if (
      bbox.left &&
      this.bboxOwners.left !== undefined &&
      this.bboxOwners.left !== owner
    ) {
      throw new Error(
        `${owner} tried to set ${this.id}'s left to ${bbox.left} but it was already set by ${this.bboxOwners.left}. Only one component can set a bbox property.`
      );
    } else if (
      bbox.top &&
      this.bboxOwners.top !== undefined &&
      this.bboxOwners.top !== owner
    ) {
      throw new Error(
        `${owner} tried to set ${this.id}'s top to ${bbox.top} but it was already set by ${this.bboxOwners.top}. Only one component can set a bbox property.`
      );
    } else if (
      bbox.width &&
      this.bboxOwners.width !== undefined &&
      this.bboxOwners.width !== owner
    ) {
      throw new Error(
        `${owner} tried to set ${this.id}'s width to ${bbox.width} but it was already set by ${this.bboxOwners.width}. Only one component can set a bbox property.`
      );
    } else if (
      bbox.height &&
      this.bboxOwners.height !== undefined &&
      this.bboxOwners.height !== owner
    ) {
      throw new Error(
        `${owner} tried to set ${this.id}'s height to ${bbox.height} but it was already set by ${this.bboxOwners.height}. Only one component can set a bbox property.`
      );
    }

    this.bboxOwners = {
      ...this.bboxOwners,
      ...(bbox.left ? { left: owner } : {}),
      ...(bbox.top ? { top: owner } : {}),
      ...(bbox.width ? { width: owner } : {}),
      ...(bbox.height ? { height: owner } : {}),
    };

    // merge currentBbox and bbox, but don't overwrite currentBbox values with undefined
    this.bbox = mergeObjects(this.bbox, bbox);
  }

  get getBbox(): BBox {
    return this.bbox;
  }
}

// export class BBoxStore {
//   bboxes: Map<string, ScenegraphNode> = new Map();

//   constructor() {
//     makeObservable(this, {
//       bboxes: false,
//       setBbox: action,
//     });
//     // console log the bboxes any time they change
//     // autorun(() => console.log(this.bboxes.values()));
//   }

//   setBbox(id: string, bbox: Partial<BBox>, owner: string): number {
//     const beginTime = Date.now();

//     if (!this.bboxes.has(id)) {
//       this.bboxes.set(id, new ScenegraphNode(id));
//     }
//     this.bboxes.get(id)?.setBbox(bbox, owner);

//     return Date.now() - beginTime;
//   }

//   getBbox(id: string): BBox | undefined {
//     return this.bboxes.get(id)?.bbox;
//   }
// }

export type BBoxStore = ObservableMap<string, ScenegraphNode>;
// const BBoxStore = observable.map<string, ScenegraphNode>;

export const BBoxContext = createContext<BBoxStore | null>(null);
