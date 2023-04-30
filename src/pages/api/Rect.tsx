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
import { Transform } from "./solidBBoxStore";

export type RectProps = {
  id: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  fill: string;
};

export const Rect: React.FC<RectProps> = (props) => {
  const { id, x, y, width, height, fill } = props;

  const layout = useCallback(() => {
    return {
      bbox: {
        left: 0,
        top: 0,
        width,
        height,
      },
      transform: {
        translate: {
          x: x,
          y: y,
        },
      },
    };
  }, [height, width, x, y]);

  const paint = useCallback(
    ({ bbox, transform }: { bbox: BBox; transform: Transform }) => {
      return (
        <g
          transform={`translate(${transform.translate.x ?? 0}, ${
            transform.translate.y ?? 0
          })`}
        >
          <rect
            x={bbox.left}
            y={bbox.top}
            width={bbox.width}
            height={bbox.height}
            fill={fill}
          />
        </g>
      );
    },
    [fill]
  );

  return <Layout id={id} layout={layout} paint={paint} />;
};