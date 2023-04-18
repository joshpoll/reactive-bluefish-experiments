import React, { useEffect, useContext, PropsWithChildren } from "react";
import { BBox, BBoxContext, BBoxStore } from "./bboxStore";
import { toJS } from "mobx";

export type LayoutProps = PropsWithChildren<{
  id: string;
  bbox?: Partial<BBox>;
  layout: () => Partial<BBox>;
  paint?: (bbox: BBox) => JSX.Element;
}>;

export const Layout: React.FC<LayoutProps> = (props) => {
  const { id, layout, paint } = props;

  const bboxStore = useContext(BBoxContext);

  useEffect(() => {
    const newBbox = layout();
    bboxStore?.setBbox(id, newBbox, id);

    // TODO: probably have to cleanup ownership here...
  }, [layout, bboxStore, id]);

  const Paint = paint ?? (() => <>{props.children}</>);

  const currentBbox = bboxStore?.getBbox(id) ?? {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };

  return <Paint {...currentBbox} />;
};
