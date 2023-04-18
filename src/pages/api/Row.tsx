import React, { useEffect, useContext, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { BBoxContext, BBoxStore } from "./bboxStore";
import { Layout } from "./Layout";

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

  const layout = useCallback(() => {
    console.log("row layout");
    const childIds =
      React.Children.map(
        children,
        (child) => (child as React.ReactElement<any>).props.id
      ) ?? [];

    // if (horizontal) {
    let posX = x;
    childIds.forEach((childId) => {
      const childBbox = bboxStore.getBbox(childId);
      console.log("before", {
        childId,
        bbox: {
          ...childBbox,
        },
      });
      if (childBbox) {
        bboxStore.setBbox(childId, { left: posX, top: y }, id);
        posX += (childBbox?.width ?? 0) + spacing;
      }
      console.log("after", {
        childId,
        bbox: {
          ...bboxStore.getBbox(childId),
        },
      });
    });
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
    return {
      left: x,
      top: y,
      width: posX - x,
      height: 0,
    };
  }, [bboxStore, children, id, spacing, x, y]);

  // useEffect(() => {
  //   layout();
  // }, [layout]);

  // return <>{children}</>;
  return <Layout id={props.id} layout={layout} paint={() => <>{children}</>} />;
});
