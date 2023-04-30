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
import { observer } from "mobx-react-lite";
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
  // trace(true);
  const { id, layout, paint, children } = props;

  const [scenegraph, { setBBox, createNode }] = useContext(BBoxContext)!;

  // useEffect(() => {
  //   const newBbox = layout();
  //   // bboxStore?.setBbox(id, newBbox, id);

  //   if (!bboxStore?.has(id)) {
  //     bboxStore?.set(id, new ScenegraphNode(id));
  //   }

  //   bboxStore?.get(id)?.setBbox(newBbox, id);

  //   // TODO: probably have to cleanup ownership here...
  // }, [layout, bboxStore, id]);

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
    // bboxStore?.setBbox(id, newBbox, id);

    // if (!bboxStore?.has(id)) {
    //   bboxStore?.set(id, new ScenegraphNode(id));
    // }
    if (scenegraph[id] === undefined) {
      // setBBox(id, newBbox, id);
      createNode(id);
    }

    setBBox(id, bbox, id, transform);

    // TODO: probably have to cleanup ownership here...
  }, [layout, id, scenegraph, setBBox, createNode, childIds]);

  const Paint = paint;

  // const currentBbox = bboxStore?.get(id)?.bbox ?? {
  //   left: 0,
  //   top: 0,
  //   width: 0,
  //   height: 0,
  // };

  // console.log("current bbox", scenegraph[id]?.bbox);
  const currentBbox = () =>
    scenegraph[id]?.bbox ?? {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };

  const currentTransform = () =>
    scenegraph[id]?.transform ?? { translate: { x: 0, y: 0 } };

  // eslint-disable-next-line react/display-name
  return () => (
    <Paint bbox={currentBbox()} transform={currentTransform()}>
      {children}
    </Paint>
  );
});
