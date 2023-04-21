import React, { useEffect, useContext, PropsWithChildren } from "react";
// import { BBox, BBoxContext, BBoxStore, ScenegraphNode } from "./bboxStore";
import { toJS, trace } from "mobx";
import { observer } from "mobx-react-lite";
import { BBox, BBoxContext } from "./solidBBoxStore";

export type LayoutProps = PropsWithChildren<{
  id: string;
  bbox?: Partial<BBox>;
  layout: () => Partial<BBox>;
  paint: (props: { bbox: BBox; children: React.ReactNode }) => JSX.Element;
}>;

export const Layout: React.FC<LayoutProps> = observer((props) => {
  // trace(true);
  const { id, layout, paint, children } = props;

  const [scenegraph, { setBBox }] = useContext(BBoxContext)!;

  // useEffect(() => {
  //   const newBbox = layout();
  //   // bboxStore?.setBbox(id, newBbox, id);

  //   if (!bboxStore?.has(id)) {
  //     bboxStore?.set(id, new ScenegraphNode(id));
  //   }

  //   bboxStore?.get(id)?.setBbox(newBbox, id);

  //   // TODO: probably have to cleanup ownership here...
  // }, [layout, bboxStore, id]);
  useEffect(() => {
    const newBbox = layout();
    // bboxStore?.setBbox(id, newBbox, id);

    // if (!bboxStore?.has(id)) {
    //   bboxStore?.set(id, new ScenegraphNode(id));
    // }
    if (scenegraph[id] === undefined) {
      setBBox(id, newBbox, id);
    }

    setBBox(id, newBbox, id);

    // TODO: probably have to cleanup ownership here...
  }, [layout, id, scenegraph, setBBox]);

  const Paint = paint;

  // const currentBbox = bboxStore?.get(id)?.bbox ?? {
  //   left: 0,
  //   top: 0,
  //   width: 0,
  //   height: 0,
  // };
  const currentBbox = scenegraph[id]?.bbox ?? {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };

  return <Paint bbox={currentBbox}>{children}</Paint>;
});
