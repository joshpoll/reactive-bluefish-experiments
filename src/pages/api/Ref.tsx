import React, {
  useContext,
  createContext,
  useEffect,
  useCallback,
} from "react";
import { observer } from "mobx-react-lite";
import { Layout } from "./Layout";
import { BBox, BBoxContext, BBoxStore } from "./bboxStore";
import { trace } from "mobx";
import { Transform } from "./solidBBoxStore";

export type RefProps = {
  id: string;
  refId: string;
};

export const Ref: React.FC<RefProps> = (props) => {
  return <></>;
};
