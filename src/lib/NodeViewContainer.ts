import ComponentView from "./ComponentView";
import { createNanoEvents, Unsubscribe } from "nanoevents";

interface Events {
  update: (views: NodeViewsMap) => void;
}

export type NodeViewsMap = Map<HTMLElement, ComponentView>;

export default class NodeViewContainer {
  views: NodeViewsMap = new Map<HTMLElement, ComponentView>();
  events = createNanoEvents<Events>();

  on = (callback: (views: NodeViewsMap) => void): Unsubscribe => {
    return this.events.on("update", callback);
  };

  once = (callback: (views: NodeViewsMap) => void): Unsubscribe => {
    const unbind = this.events.on("update", (views: NodeViewsMap) => {
      unbind();
      callback(views);
    });

    return unbind;
  };

  update() {
    this.events.emit("update", this.views);
  }

  remove(container: HTMLElement): void {
    this.views.delete(container);
    this.update();
  }

  register({
    view,
    container
  }: {
    view: ComponentView;
    container: HTMLElement;
  }): void {
    this.views.set(container, view);
  }
}
