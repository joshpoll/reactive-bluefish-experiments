import React, { useEffect, useContext, useCallback, useMemo } from "react";
// import { observer } from "mobx-react-lite";
// import { BBoxContext, BBoxStore } from "./bboxStore";
import { Id, Layout } from "./Layout";
import { BBox, BBoxContext, Transform, useScenegraph } from "./solidBBoxStore";
// import { observer } from "mobx-react-lite";
// import { action } from "mobx";

export type RowProps = {
  x?: number;
  y?: number;
  spacing: number;
  horizontal?: boolean;
  children: React.ReactNode;
  id: string;
};

export const Row: React.FC<RowProps> = (props) => {
  const { x, y, spacing, horizontal, children, id } = props;
  // const [scenegraph, { setBBox }] = useContext(BBoxContext)!;
  const [scenegraph, setNode] = useScenegraph();

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
      // console.time("layout");
      // const childIds =
      //   React.Children.map(
      //     children,
      //     (child) => (child as React.ReactElement<any>).props.id
      //   ) ?? [];

      let totalTime = 0;
      // if (horizontal) {
      // let posX = x;
      let posX = 0;

      for (const childId of childIds) {
        // console.time("child");
        // const childBbox = bboxStore.get(childId)?.bbox;
        const childBBox = scenegraph[childId]?.bbox;
        const beginTime = Date.now();
        if (childBBox !== undefined) {
          // totalTime +=
          // setBBox(childId, { left: posX, top: y }, id);
          setNode(childId, {}, id, {
            translate: { x: posX, y: 0 },
          });
          posX += (childBBox?.width ?? 0) + spacing;
        }
        const endTime = Date.now();
        // console.timeEnd("child");
        // totalTime += endTime - beginTime;
        // console.log("after", {
        //   childId,
        //   bbox: {
        //     ...bboxStore.getBbox(childId),
        //   },
        // });
      }
      // console.timeLog("layout", "visited children", totalTime);
      // } else {
      //   let posY = y;
      //   childIds.forEach((id) => {
      //     const childBbox = bboxStore.getBbox(id);
      //     if (childBbox) {
      //       bboxStore.setBbox(id, { ...childBbox, left: x, top: posY });
      //       posY += (childBbox?.height ?? 0) + spacing;
      //     }
      //   });
      // }

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
