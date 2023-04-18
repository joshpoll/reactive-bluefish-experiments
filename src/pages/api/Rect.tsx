import React, { useContext, createContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Layout } from "./Layout";
import { BBox, BBoxContext, BBoxStore } from "./bboxStore";

export type RectProps = {
  id: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  fill: string;
};

export const Rect: React.FC<RectProps> = observer((props) => {
  const { id, x, y, width, height, fill } = props;
  const bboxStore = useContext(BBoxContext);

  if (!bboxStore) {
    throw new Error("BBoxContext is not provided");
  }

  const layout = () => {
    return {
      left: x,
      top: y,
      width,
      height,
    };
  };

  const paint = (bbox: BBox) => {
    console.log("paint rect", bbox);
    return (
      <rect
        x={bbox.left}
        y={bbox.top}
        width={bbox.width}
        height={bbox.height}
        fill={fill}
      />
    );
  };

  return <Layout id={id} layout={layout} paint={paint} />;
});
