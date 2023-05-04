import React, {
  useEffect,
  useContext,
  useCallback,
  useMemo,
  PropsWithChildren,
} from "react";
// import { observer } from "mobx-react-lite";
// import { BBoxContext, BBoxStore } from "./bboxStore";
import { Id, Layout } from "./Layout";
import { BBox, BBoxContext, Transform, useScenegraph } from "./solidBBoxStore";
import _ from "lodash";
// import { observer } from "mobx-react-lite";
// import { action } from "mobx";

export type Alignment2D =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "centerLeft"
  | "center"
  | "centerRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";

// generate a union of single-key objects using Alignment2D as the keys
export type Alignment2DObjs = {
  [K in Alignment2D]: { [k in K]: boolean };
}[Alignment2D];

export type VerticalAlignment = "top" | "center" | "bottom";
export type HorizontalAlignment = "left" | "center" | "right";

export type Alignment1DHorizontal = "left" | "centerHorizontally" | "right";
export type Alignment1DVertical = "top" | "centerVertically" | "bottom";

export type Alignment1D = Alignment1DHorizontal | Alignment1DVertical;

export type Alignment1DObjs = {
  [K in Alignment1D]: { [k in K]: boolean };
}[Alignment1D];

export type AlignAuxProps = {
  alignments: [
    VerticalAlignment | undefined,
    HorizontalAlignment | undefined
  ][];
} & {
  x?: number;
  y?: number;
};

export const splitAlignment = (
  alignment: Alignment2D | Alignment1D
): [VerticalAlignment | undefined, HorizontalAlignment | undefined] => {
  let verticalAlignment: VerticalAlignment | undefined;
  let horizontalAlignment: HorizontalAlignment | undefined;
  switch (alignment) {
    case "top":
    case "topLeft":
    case "topCenter":
    case "topRight":
      verticalAlignment = "top";
      break;
    case "centerVertically":
    case "centerLeft":
    case "center":
    case "centerRight":
      verticalAlignment = "center";
      break;
    case "bottom":
    case "bottomLeft":
    case "bottomCenter":
    case "bottomRight":
      verticalAlignment = "bottom";
      break;
  }

  switch (alignment) {
    case "left":
    case "topLeft":
    case "centerLeft":
    case "bottomLeft":
      horizontalAlignment = "left";
      break;
    case "centerHorizontally":
    case "topCenter":
    case "center":
    case "bottomCenter":
      horizontalAlignment = "center";
      break;
    case "right":
    case "topRight":
    case "centerRight":
    case "bottomRight":
      horizontalAlignment = "right";
      break;
  }

  return [verticalAlignment, horizontalAlignment];
};

// type AlignProps =
//   | { [K in Alignment2D]?: React.CElement<any, any> | React.CElement<any, any>[] }
//   | { [K in Alignment1DHorizontal]?: React.CElement<any, any> | React.CElement<any, any>[] }
//   | { [K in Alignment1DVertical]?: React.CElement<any, any> | React.CElement<any, any>[] };
type AlignProps = PropsWithChildren<{
  id: Id;
  x?: number;
  y?: number;
  alignment?: Alignment2D | Alignment1D;
}>;

export const Align: React.FC<AlignProps> = (props) => {
  const { children, id } = props;
  const [scenegraph, setNode, getBBox, setSmartBBox] = useScenegraph();

  const layout = useCallback(
    (childIds: Id[]) => {
      const alignments: [
        VerticalAlignment | undefined,
        HorizontalAlignment | undefined
      ][] = childIds
        .map((m) => /* m.guidePrimary ?? */ props.alignment)
        .map((alignment) =>
          alignment !== undefined
            ? splitAlignment(alignment)
            : [undefined, undefined]
        );

      const verticalPlaceables = _.zip(childIds, alignments).filter(
        ([placeable, alignment]) => {
          if (alignment === undefined) {
            return false;
          }
          const [verticalAlignment, horizontalAlignment] = alignment;
          return verticalAlignment !== undefined;
        }
      );

      const horizontalPlaceables = _.zip(childIds, alignments).filter(
        ([placeable, alignment]) => {
          if (alignment === undefined) {
            return false;
          }
          const [verticalAlignment, horizontalAlignment] = alignment;
          return horizontalAlignment !== undefined;
        }
      );

      // TODO: should be able to filter by ownership instead
      const verticalValueArr = verticalPlaceables
        .map(([placeable, alignment]) => {
          const [verticalAlignment, horizontalAlignment] = alignment!;
          if (verticalAlignment === "top") {
            return [placeable, getBBox(placeable!).top];
          } else if (verticalAlignment === "center") {
            const top = getBBox(placeable!).top;
            const height = getBBox(placeable!).height;
            if (top === undefined || height === undefined) {
              return [placeable, undefined];
            }
            return [placeable, top + height / 2];
          } else if (verticalAlignment === "bottom") {
            // return getBBox(placeable!).bottom;
            return [
              placeable,
              getBBox(placeable!).top! + getBBox(placeable!).height!,
            ];
          } else {
            return [placeable, undefined];
          }
        })
        .filter(
          ([placeable, value]) =>
            scenegraph[placeable!].transformOwners.translate.y !== id &&
            value !== undefined
        );

      const verticalValue =
        verticalValueArr.length === 0 ? 0 : (verticalValueArr[0][1] as number);
      // TODO: we maybe have the invariant that value is always defined when the placeable is owned...

      const horizontalValueArr = horizontalPlaceables
        .map(([placeable, alignment]) => {
          const [verticalAlignment, horizontalAlignment] = alignment!;
          if (horizontalAlignment === "left") {
            return [placeable, getBBox(placeable!).left];
          } else if (horizontalAlignment === "center") {
            const left = getBBox(placeable!).left;
            const width = getBBox(placeable!).width;
            if (left === undefined || width === undefined) {
              return [placeable, undefined];
            }
            return [placeable, left + width / 2];
          } else if (horizontalAlignment === "right") {
            // return getBBox(placeable!).right;
            return [
              placeable,
              getBBox(placeable!).left! + getBBox(placeable!).width!,
            ];
          } else {
            return [placeable, undefined];
          }
        })
        .filter(
          ([placeable, value]) =>
            scenegraph[placeable!].transformOwners.translate.x !== id &&
            value !== undefined
        );

      const horizontalValue =
        horizontalValueArr.length === 0
          ? 0
          : (horizontalValueArr[0][1] as number);

      for (const [placeable, alignment] of verticalPlaceables) {
        if (
          scenegraph[placeable!].transformOwners.translate.y !== undefined &&
          scenegraph[placeable!].transformOwners.translate.y !== id
        )
          continue;
        const [verticalAlignment, horizontalAlignment] = alignment!;
        if (verticalAlignment === "top") {
          setSmartBBox(placeable!, { top: verticalValue }, id);
        } else if (verticalAlignment === "center") {
          const height = getBBox(placeable!).height;
          if (height === undefined) {
            continue;
          }
          setSmartBBox(placeable!, { top: verticalValue - height / 2 }, id);
        } else if (verticalAlignment === "bottom") {
          // placeable!.bottom = verticalValue;
          setSmartBBox(
            placeable!,
            { top: verticalValue - getBBox(placeable!).height! },
            id
          );
        }
      }

      for (const [placeable, alignment] of horizontalPlaceables) {
        if (
          scenegraph[placeable!].transformOwners.translate.x !== undefined &&
          scenegraph[placeable!].transformOwners.translate.x !== id
        )
          continue;
        const [verticalAlignment, horizontalAlignment] = alignment!;
        if (horizontalAlignment === "left") {
          setSmartBBox(placeable!, { left: horizontalValue }, id);
        } else if (horizontalAlignment === "center") {
          const width = getBBox(placeable!).width;
          if (width === undefined) {
            continue;
          }
          setSmartBBox(placeable!, { left: horizontalValue - width / 2 }, id);
        } else if (horizontalAlignment === "right") {
          // placeable!.right = horizontalValue;
          setSmartBBox(
            placeable!,
            { left: horizontalValue - getBBox(placeable!).width! },
            id
          );
        }
      }

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
        transform: {
          translate: {
            x: props.x !== undefined ? props.x - left : undefined,
            y: props.y !== undefined ? props.y - top : undefined,
          },
        },
        bbox: { left, top, right, bottom, width, height },
      };
    },
    [getBBox, id, props.alignment, props.x, props.y, scenegraph, setSmartBBox]
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
