// a slightly modified excerpt of react-solid-state
import {
  memo,
  PropsWithChildren,
  useCallback as rCallback,
  useEffect as rEffect,
  useMemo as rMemo,
  useRef as rRef,
  useState as rState,
} from "react";
import {
  createComputed as sComputed,
  createEffect as sEffect,
  createMemo as sMemo,
  createRoot,
  createSignal as sSignal,
  onCleanup as sCleanup,
  createReaction,
} from "solid-js";

function useForceUpdate() {
  const [, setTick] = rState(0);
  return rCallback(() => setTick((t) => t + 1), []);
}

export function useObserver<T>(fn: () => T) {
  const forceUpdate = useForceUpdate(),
    reaction = rRef<{ dispose: () => void; track: (fn: () => void) => void }>();
  if (!reaction.current) {
    reaction.current = createRoot((dispose) => ({
      dispose,
      track: createReaction(forceUpdate),
    }));
  }
  rEffect(() => reaction.current!.dispose, []);

  let rendering!: T;
  reaction.current.track(() => (rendering = fn()));
  return rendering;
}

export function withSolid<P extends object>(
  ComponentType: (props: PropsWithChildren<P>, r: any) => () => JSX.Element
) {
  // eslint-disable-next-line react/display-name
  return memo<P>((p, r) => {
    const component = ComponentType(p, r);
    // TODO: do we really need to break the rules here?
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return (component && useObserver(component)) || null;
  });
}
