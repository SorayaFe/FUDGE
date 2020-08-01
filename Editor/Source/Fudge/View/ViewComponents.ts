namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  enum Menu {
    COMPONENTMENU = "Add Components"
  }

  /**
   * View all components attached to a node
   * @author Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class ViewComponents extends View {
    private node: ƒ.Node | ƒ.Mutable;
    private container: GoldenLayout.Container;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.container = _container;
      this.fillContent();

      this.dom.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT_TREE.RENAME, this.hndEvent);
    }

    public cleanup(): void {
      //TODO: Deconstruct;
    }

    fillContent(): void {
      if (this.node) {
        if (this.node instanceof ƒ.Node) {
          // let cntHeader: HTMLElement = document.createElement("span");
          // cntHeader.textContent = this.node.name;
          // this.dom.appendChild(cntHeader);

          this.container.setTitle(this.node.name);

          let nodeComponents: ƒ.Component[] = this.node.getAllComponents();
          for (let nodeComponent of nodeComponents) {
            let fieldset: ƒui.FoldableFieldSet = ƒui.Generator.createFieldSetFromMutable(nodeComponent);
            let uiComponent: ControllerComponent = new ControllerComponent(nodeComponent, fieldset);
            this.dom.append(uiComponent.domElement);
          }
        }
      }
      else {
        let cntEmpty: HTMLDivElement = document.createElement("div");
        this.dom.append(cntEmpty);
      }
    }

    // private changeNodeName = (_event: Event) => {
    //   if (this.node instanceof ƒ.Node) {
    //     let target: HTMLInputElement = <HTMLInputElement>_event.target;
    //     this.node.name = target.value;
    //   }
    // }

    private hndEvent = (_event: CustomEvent): void => {
      if (_event.type != ƒui.EVENT_TREE.RENAME)
        this.node = _event.detail;

      while (this.dom.firstChild != null) {
        this.dom.removeChild(this.dom.lastChild);
      }
      this.fillContent();
    }

    // private addComponent = (_event: CustomEvent): void => {
    //   switch (_event.detail) {
    //   }
    // }
  }
}