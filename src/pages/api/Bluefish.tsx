import { PropsWithChildren, useMemo } from "react";
import { BBoxContext, BBoxStore } from "./bboxStore";

export type BluefishProps = PropsWithChildren<{
  width: number;
  height: number;
}>;

export const Bluefish = (props: BluefishProps) => {
  const bboxStore = useMemo(() => new BBoxStore(), []);

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
