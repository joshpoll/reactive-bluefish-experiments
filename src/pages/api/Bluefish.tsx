import { PropsWithChildren, useMemo } from "react";
// import { BBoxContext, BBoxStore } from "./bboxStore";
import { BBoxContext, createScenegraph } from "./solidBBoxStore";
import { observable } from "mobx";

export type BluefishProps = PropsWithChildren<{
  width: number;
  height: number;
}>;

export const Bluefish = (props: BluefishProps) => {
  // const bboxStore = useMemo(() => observable.map(), []);
  const bboxStore = useMemo(() => createScenegraph(), []);

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
