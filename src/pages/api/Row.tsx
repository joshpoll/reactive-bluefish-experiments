import React, { useEffect, useContext, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { BBoxContext, BBoxStore } from "./bboxStore";
import { Layout } from "./Layout";
import { action } from "mobx";

export type RowProps = {
  x?: number;
  y?: number;
  spacing: number;
  horizontal?: boolean;
  children: React.ReactNode;
  id: string;
};

export const Row: React.FC<RowProps> = observer((props) => {
  const { x = 0, y = 0, spacing, horizontal, children, id } = props;
  const bboxStore = useContext(BBoxContext);

  if (!bboxStore) {
    throw new Error("BBoxContext is not provided");
  }

  const childIds = useMemo(
    () =>
      React.Children.map(
        children,
        (child) => (child as React.ReactElement<any>).props.id
      ) ?? [],
    [children]
  );

  const layout = useCallback(
    action(() => {
      console.time("layout");
      // const childIds =
      //   React.Children.map(
      //     children,
      //     (child) => (child as React.ReactElement<any>).props.id
      //   ) ?? [];

      let totalTime = 0;
      // if (horizontal) {
      let posX = x;

      childIds.forEach((childId) => {
        // console.time("child");
        const childBbox = bboxStore.get(childId)?.bbox;
        const beginTime = Date.now();
        if (childBbox !== undefined) {
          totalTime +=
            bboxStore.get(childId)?.setBbox({ left: posX, top: y }, id) ?? 0;
          posX += (childBbox?.width ?? 0) + spacing;
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
      });
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

      const width = posX - x;
      // height is the max height of all children
      const height = Math.max(
        ...childIds.map((childId) => bboxStore.get(childId)?.bbox.height ?? 0)
      );
      console.timeEnd("layout");

      return {
        left: x,
        top: y,
        width,
        height,
      };
    }),
    [bboxStore, childIds, id, spacing, x, y]
  );

  // useEffect(() => {
  //   layout();
  // }, [layout]);

  // return <>{children}</>;

  const paint = useCallback(
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
    []
  );

  return (
    <Layout id={props.id} layout={layout} paint={paint}>
      {children}
    </Layout>
  );
});
