import { PropsWithChildren, useEffect, useId, useMemo, useRef } from "react";
// import { BBoxContext, BBoxStore } from "./bboxStore";
import {
  BBoxContext,
  ScenegraphNode,
  createScenegraph,
} from "./solidBBoxStore";
import { observable } from "mobx";

export type BluefishProps = PropsWithChildren<{
  width: number;
  height: number;
  id?: string;
}>;

declare global {
  interface Window {
    bluefish?: { [key: string]: { [key: string]: ScenegraphNode } };
  }
}

export const Bluefish = (props: BluefishProps) => {
  // const bboxStore = useMemo(() => observable.map(), []);
  const bboxStore = useMemo(() => createScenegraph(), []);

  const autoGenId = useId();
  const id = props.id ?? autoGenId;
  const wroteToWindow = useRef(false);

  const scenegraph = bboxStore[0];

  useEffect(() => {
    if (window.bluefish === undefined) {
      window.bluefish = {};
    }

    if (window.bluefish[id] !== undefined) {
      console.error(`Duplicate id ${id}. Not writing to window.bluefish`);
    } else {
      window.bluefish[id] = scenegraph;
      wroteToWindow.current = true;
    }

    return () => {
      if (window.bluefish !== undefined && wroteToWindow.current) {
        delete window.bluefish[id];
        wroteToWindow.current = false;
      }
    };
  });

  return (
    <BBoxContext.Provider value={bboxStore}>
      <svg
        width={props.width}
        height={props.height}
        viewBox={`0 0 ${props.width} ${props.height}`}
      >
        {props.children}
      </svg>
    </BBoxContext.Provider>
  );
};
