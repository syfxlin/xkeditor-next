import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { MountedPortal, PortalContainer } from "./portal-container";

/**
 * The component that places all the portals into the DOM.
 *
 * Portals can currently be created by a [[`ReactNodeView`]] and coming soon
 * both the [[`ReactMarkView`]] and [[`ReactDecoration`]].
 */
export const RemirrorPortals = (props: RemirrorPortalsProps): JSX.Element => {
  const portals = usePortals(props.portalContainer);

  return (
    <>
      {portals.map(([container, { Component, key }]) =>
        createPortal(<Component />, container, key)
      )}
    </>
  );
};

export interface RemirrorPortalsProps {
  portalContainer: PortalContainer;
}

/**
 * A hook which subscribes to updates from the portal container.
 *
 * This is should used in the `ReactEditor` component and the value should be
 * passed through to the `RemirrorPortals` component.
 */
export function usePortals(
  portalContainer: PortalContainer
): Array<[HTMLElement, MountedPortal]> {
  const [portals, setPortals] = useState(() => [
    // @ts-ignore
    ...portalContainer.portals.entries()
  ]);

  // Dispose of all portals.
  useEffect(() => {
    // Auto disposed when the component un-mounts.
    return portalContainer.on(portalMap => {
      // @ts-ignore
      setPortals([...portalMap.entries()]);
    });
  }, [portalContainer]);

  return useMemo(() => portals, [portals]);
}
