import React, {
  useEffect,
  useContext,
  PropsWithChildren,
  useMemo,
} from "react";
// import { BBox, BBoxContext, BBoxStore, ScenegraphNode } from "./bboxStore";
// import { toJS, trace } from "mobx";
// import { observer } from "mobx-react-lite";
import { BBox, BBoxContext, Transform } from "./solidBBoxStore";
import { withSolid } from "./ReactSolidState";

export type Id = string;

export type LayoutProps = PropsWithChildren<{
  id: Id;
  bbox?: Partial<BBox>;
  layout: (childIds: Id[]) => {
    bbox: Partial<BBox>;
    transform: Transform;
  };
  paint: (props: {
    bbox: BBox;
    transform: Transform;
    children: React.ReactNode;
  }) => JSX.Element;
}>;

export const Layout: React.FC<LayoutProps> = withSolid((props) => {
  const { id, layout, paint, children } = props;

  const [scenegraph, { setBBox, createNode }] = useContext(BBoxContext)!;

  const childIds = useMemo(
    () =>
      React.Children.map(
        children,
        (child) => (child as React.ReactElement<any>).props.id
      ) ?? [],
    [children]
  );

  useEffect(() => {
    const { bbox, transform } = layout(childIds);

    if (scenegraph[id] === undefined) {
      createNode(id);
    }

    setBBox(id, bbox, id, transform);

    // TODO: probably have to cleanup ownership here...
  }, [layout, id, scenegraph, setBBox, createNode, childIds]);

  const Paint = paint;

  const currentBbox = () =>
    scenegraph[id]?.bbox ?? {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };

  const currentTransform = () =>
    scenegraph[id]?.transform ?? { translate: { x: 0, y: 0 } };

  return function LayoutWrapper() {
    return (
      <Paint bbox={currentBbox()} transform={currentTransform()}>
        {children}
      </Paint>
    );
  };
});
