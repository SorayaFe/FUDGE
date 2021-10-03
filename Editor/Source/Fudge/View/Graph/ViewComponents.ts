namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  enum Menu {
    COMPONENTMENU = "Add Components"
  }

  // TODO: examin problem with ƒ.Material when using "typeof ƒ.Mutable" as key to the map
  let resourceToComponent: Map<Function, typeof ƒ.Component> = new Map<Function, typeof ƒ.Component>([
    [ƒ.Audio, ƒ.ComponentAudio],
    [ƒ.Material, ƒ.ComponentMaterial],
    [ƒ.Mesh, ƒ.ComponentMesh]
  ]);

  /**
   * View all components attached to a node
   * @author Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class ViewComponents extends View {
    private node: ƒ.Node;
    private expanded: { [type: string]: boolean } = { ComponentTransform: true };

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);
      this.fillContent();

      this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.FOCUS_NODE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      // this.dom.addEventListener(ƒUi.EVENT.RENAME, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.DELETE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.EXPAND, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.COLLAPSE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener(EVENT_EDITOR.TRANSFORM, this.hndTransform);
      this.dom.addEventListener(ƒUi.EVENT.CLICK, this.hndEvent, true);
      this.dom.addEventListener(ƒUi.EVENT.KEY_DOWN, this.hndEvent, true);
    }

    //#region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;
      item = new remote.MenuItem({
        label: "Add Component",
        submenu: ContextMenu.getSubclassMenu<typeof ƒ.Component>(CONTEXTMENU.ADD_COMPONENT, ƒ.Component.subclasses, _callback)
      });
      menu.append(item);

      // ContextMenu.appendCopyPaste(menu);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);

      switch (Number(_item.id)) {
        case CONTEXTMENU.ADD_COMPONENT:
          let iSubclass: number = _item["iSubclass"];
          let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
          //@ts-ignore
          let cmpNew: ƒ.Component = new component();
          ƒ.Debug.info(cmpNew.type, cmpNew);

          this.node.addComponent(cmpNew);
          this.dom.dispatchEvent(new CustomEvent(ƒUi.EVENT.SELECT, { bubbles: true, detail: { data: this.node } }));
          break;
      }
    }
    //#endregion

    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      if (!this.node)
        return;
      if (this.dom != _event.target)
        return;

      if (!(_viewSource instanceof ViewInternal || _viewSource instanceof ViewScript))
        return;

      for (let source of _viewSource.getDragDropSources()) {
        if (source instanceof ScriptInfo) {
          if (!source.isComponent)
            return;
        } else if (!this.findComponentType(source))
          return;
      }

      _event.dataTransfer.dropEffect = "link";
      _event.preventDefault();
      _event.stopPropagation();
    }

    protected hndDrop(_event: DragEvent, _viewSource: View): void {
      for (let source of _viewSource.getDragDropSources()) {
        let cmpNew: ƒ.Component = this.createComponent(source);
        this.node.addComponent(cmpNew);
        this.expanded[cmpNew.type] = true;
      }
      this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
    }

    private fillContent(): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      if (this.node) {
        if (this.node instanceof ƒ.Node) {
          this.setTitle("Components | " + this.node.name);
          this.dom.title = "Drop internal resources or use right click to create new components";

          let components: ƒ.Component[] = this.node.getAllComponents();
          for (let component of components) {
            let details: ƒUi.Details = ƒUi.Generator.createDetailsFromMutable(component);
            let controller: ControllerComponent = new ControllerComponent(component, details);
            details.expand(this.expanded[component.type]);
            this.dom.append(details);
            if (component instanceof ƒ.ComponentRigidbody) {
              let pivot: HTMLElement = controller.domElement.querySelector("[key=mtxPivot");
              let opacity: string = pivot.style.opacity;
              setPivotOpacity(null);
              controller.domElement.addEventListener(ƒUi.EVENT.MUTATE, setPivotOpacity);
              function setPivotOpacity(_event: Event): void {
                let initialization: ƒ.BODY_INIT = controller.getMutator({ initialization: 0 }).initialization;
                pivot.style.opacity = initialization == ƒ.BODY_INIT.TO_PIVOT ? opacity : "0.3";
              }
            }
          }
        }
      }
      else {
        this.setTitle("Components");
        this.dom.title = "Select node to edit components";
        let cntEmpty: HTMLDivElement = document.createElement("div");
        this.dom.append(cntEmpty);
      }
    }

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        // case ƒui.EVENT.RENAME: break;
        case EVENT_EDITOR.SET_GRAPH:
        case EVENT_EDITOR.FOCUS_NODE:
          this.node = _event.detail;
        case EVENT_EDITOR.UPDATE:
          this.fillContent();
          break;
        case ƒUi.EVENT.DELETE:
          let component: ƒ.Component = _event.detail.mutable;
          this.node.removeComponent(component);
          this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
          break;
        case ƒUi.EVENT.KEY_DOWN:
        case ƒUi.EVENT.CLICK:
          if (_event instanceof KeyboardEvent && _event.code != ƒ.KEYBOARD_CODE.SPACE)
            break;
          let target: ƒUi.Details = <ƒUi.Details>_event.target;
          if (target.tagName == "SUMMARY")
            target = <ƒUi.Details>target.parentElement;
          if (!(_event.target instanceof HTMLDetailsElement || (<HTMLElement>_event.target)))
            break;
          try {
            if (this.dom.replaceChild(target, target)) {
              if (_event instanceof KeyboardEvent || this.getSelected() != target) {
                target.expand(true);
                _event.preventDefault();
              }
              this.select(target);
            }
          } catch (_e: unknown) { /* */ }
          break;
        case ƒUi.EVENT.EXPAND:
        case ƒUi.EVENT.COLLAPSE:
          this.expanded[(<ƒUi.Details>_event.target).getAttribute("type")] = (_event.type == ƒUi.EVENT.EXPAND);
        default:
          break;
      }
    }

    private hndTransform = (_event: CustomEvent): void => {
      let dtl: ƒ.General = _event.detail;
      let mtxCamera: ƒ.Matrix4x4 = (<ƒ.ComponentCamera>dtl.camera).node.mtxWorld;
      let distance: number = mtxCamera.getTranslationTo(this.node.mtxWorld).magnitude;
      if (dtl.transform == TRANSFORM.ROTATE)
        [dtl.x, dtl.y] = [dtl.y, dtl.x];

      let value: ƒ.Vector3 = new ƒ.Vector3();
      value.x = (dtl.restriction == "x" ? !dtl.inverted : dtl.inverted) ? dtl.x : undefined;
      value.y = (dtl.restriction == "y" ? !dtl.inverted : dtl.inverted) ? -dtl.y : undefined;
      value.z = (dtl.restriction == "z" ? !dtl.inverted : dtl.inverted) ?
        ((value.x == undefined) ? -dtl.y : dtl.x) : undefined;
      value = value.map((_c: number) => _c || 0);

      switch (dtl.transform) {
        case TRANSFORM.TRANSLATE:
          let factorTranslation: number = 0.001; // TODO: eliminate magic numbers
          value.scale(factorTranslation * distance);
          let translation: ƒ.Vector3 = this.node.mtxLocal.translation;
          translation.add(value);
          this.node.mtxLocal.translation = translation;
          break;
        case TRANSFORM.ROTATE:
          let factorRotation: number = 1; // TODO: eliminate magic numbers
          value.scale(factorRotation);
          let rotation: ƒ.Vector3 = this.node.mtxLocal.rotation;
          rotation.add(value);
          this.node.mtxLocal.rotation = rotation;
          break;
        case TRANSFORM.SCALE:
          let factorScaling: number = 0.001; // TODO: eliminate magic numbers
          value.scale(factorScaling);
          let scaling: ƒ.Vector3 = this.node.mtxLocal.scaling;
          scaling.add(value);
          this.node.mtxLocal.scaling = scaling;
          break;
      }
    }

    private select(_details: ƒUi.Details): void {
      for (let child of this.dom.children)
        child.classList.remove("selected");
      _details.classList.add("selected");
      _details.focus();
    }

    private getSelected(): ƒUi.Details {
      for (let child of this.dom.children)
        if (child.classList.contains("selected"))
          return <ƒUi.Details>child;
    }

    private createComponent(_resource: Object): ƒ.Component {
      if (_resource instanceof ScriptInfo)
        if (_resource.isComponent)
          return new (<ƒ.General>_resource.script)();

      let typeComponent: typeof ƒ.Component = this.findComponentType(_resource);
      return new (<ƒ.General>typeComponent)(_resource);
    }

    private findComponentType(_resource: Object): typeof ƒ.Component {
      for (let entry of resourceToComponent)
        if (_resource instanceof entry[0])
          return entry[1];
    }
  }
}