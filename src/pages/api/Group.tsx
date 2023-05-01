import React, { useEffect, useContext, useCallback, useMemo } from "react";
// import { observer } from "mobx-react-lite";
// import { BBoxContext, BBoxStore } from "./bboxStore";
import { Id, Layout } from "./Layout";
import { BBox, BBoxContext, Transform, useScenegraph } from "./solidBBoxStore";
// import { observer } from "mobx-react-lite";
// import { action } from "mobx";

export type GroupProps = {
  x?: number;
  y?: number;
  children: React.ReactNode;
  id: string;
};

export const Group: React.FC<GroupProps> = (props) => {
  const { x, y, children } = props;
  const [scenegraph] = useScenegraph();

  // if (!bboxStore) {
  //   throw new Error("BBoxContext is not provided");
  // }

  // const childIds = useMemo(
  //   () =>
  //     React.Children.map(
  //       children,
  //       (child) => (child as React.ReactElement<any>).props.id
  //     ) ?? [],
  //   [children]
  // );

  const layout = useCallback(
    (childIds: Id[]) => {
      const left = Math.min(
        ...childIds.map((childId) => scenegraph[childId]?.bbox.left ?? 0)
      );
      const right = Math.max(
        ...childIds.map(
          (childId) =>
            (scenegraph[childId]?.bbox.left ?? 0) +
            (scenegraph[childId]?.bbox.width ?? 0)
        )
      );

      const top = Math.min(
        ...childIds.map((childId) => scenegraph[childId]?.bbox.top ?? 0)
      );
      const bottom = Math.max(
        ...childIds.map(
          (childId) =>
            (scenegraph[childId]?.bbox.top ?? 0) +
            (scenegraph[childId]?.bbox.height ?? 0)
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
    [scenegraph, x, y]
  );

  // useEffect(() => {
  //   layout();
  // }, [layout]);

  // return <>{children}</>;

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
        {/* <rect
          x={bbox.left}
          y={bbox.top}
          width={bbox.width}
          height={bbox.height}
          fill="none"
          stroke="magenta"
        /> */}
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
