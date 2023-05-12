import React, { useCallback } from "react";
import { Id, Layout } from "./Layout";
import { BBox, Transform, useScenegraph } from "./solidBBoxStore";

export type GroupProps = {
  x?: number;
  y?: number;
  children: React.ReactNode;
  id: string;
};

export const Group: React.FC<GroupProps> = (props) => {
  const { x, y, children } = props;
  const [scenegraph, _, getBBox] = useScenegraph();

  const layout = useCallback(
    (childIds: Id[]) => {
      const left = Math.min(
        ...childIds.map((childId) => getBBox(childId).left ?? 0)
      );
      const right = Math.max(
        ...childIds.map(
          (childId) =>
            (getBBox(childId).left ?? 0) + (getBBox(childId).width ?? 0)
        )
      );

      const top = Math.min(
        ...childIds.map((childId) => getBBox(childId).top ?? 0)
      );
      const bottom = Math.max(
        ...childIds.map(
          (childId) =>
            (getBBox(childId).top ?? 0) + (getBBox(childId).height ?? 0)
        )
      );

      const width = right - left;
      const height = bottom - top;

      return {
        bbox: {
          left,
          top,
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
    [getBBox, x, y]
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
