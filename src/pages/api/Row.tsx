import React, { useCallback } from "react";
import { Id, Layout } from "./Layout";
import { BBox, Transform, useScenegraph } from "./solidBBoxStore";

export type RowProps = {
  x?: number;
  y?: number;
  spacing: number;
  children: React.ReactNode;
  id: string;
};

export const Row: React.FC<RowProps> = (props) => {
  const { x, y, spacing, children, id } = props;
  const [scenegraph, setNode] = useScenegraph();

  const layout = useCallback(
    (childIds: Id[]) => {
      let totalTime = 0;
      let posX = 0;

      for (const childId of childIds) {
        const childBBox = scenegraph[childId]?.bbox;
        const beginTime = Date.now();
        if (childBBox !== undefined) {
          setNode(childId, {}, id, {
            translate: { x: posX, y: 0 },
          });
          posX += (childBBox?.width ?? 0) + spacing;
        }
        const endTime = Date.now();
      }

      const width = posX - spacing;
      // height is the max height of all children
      const height = Math.max(
        ...childIds.map((childId) => scenegraph[childId]?.bbox.height ?? 0)
      );
      // console.timeEnd("layout");

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
    },
    [id, scenegraph, setNode, spacing, x, y]
  );

  const paint = useCallback(
    ({
      bbox,
      children,
      transform,
    }: {
      bbox: BBox;
      transform: Transform;
      children: React.ReactNode;
    }) => (
      <g
        transform={`translate(${transform.translate.x ?? 0}, ${
          transform.translate.y ?? 0
        })`}
      >
        {children}
      </g>
    ),
    []
  );

  return (
    <Layout id={props.id} layout={layout} paint={paint}>
      {children}
    </Layout>
  );
};
