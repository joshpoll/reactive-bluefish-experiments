import { PropsWithChildren, useContext, useEffect } from "react";
import { BBox, BBoxContext, Transform } from "./solidBBoxStore";
import { Id } from "./Layout";
import { withSolid } from "./ReactSolidState";

export type RefProps = {
  id: Id;
  refId: Id;
};

export const Ref: React.FC<RefProps> = withSolid((props) => {
  const { id, refId } = props;

  const [scenegraph, { createRef }] = useContext(BBoxContext)!;

  useEffect(() => {
    // const { bbox, transform } = scenegraph[refId];
    // bboxStore?.setBbox(id, newBbox, id);

    // if (!bboxStore?.has(id)) {
    //   bboxStore?.set(id, new ScenegraphNode(id));
    // }
    if (scenegraph[id] === undefined) {
      // setBBox(id, newBbox, id);
      createRef(id, refId);
    }

    // setBBox(id, bbox, id, transform);

    // TODO: probably have to cleanup ownership here...
  }, [createRef, id, refId, scenegraph]);

  // eslint-disable-next-line react/display-name
  return () => <></>;
});
