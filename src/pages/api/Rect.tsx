import React, {
  useContext,
  createContext,
  useEffect,
  useCallback,
} from "react";
import { observer } from "mobx-react-lite";
import { Layout } from "./Layout";
import { BBox, BBoxContext, BBoxStore } from "./bboxStore";
import { trace } from "mobx";

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

  const layout = useCallback(() => {
    return {
      left: x,
      top: y,
      width,
      height,
    };
  }, [height, width, x, y]);

  const paint = useCallback(
    ({ bbox }: { bbox: BBox }) => {
      return (
        <rect
          x={bbox.left}
          y={bbox.top}
          width={bbox.width}
          height={bbox.height}
          fill={fill}
        />
      );
    },
    [fill]
  );

  return <Layout id={id} layout={layout} paint={paint} />;
});
