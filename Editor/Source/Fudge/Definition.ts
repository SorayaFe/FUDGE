namespace Fudge {
  export enum CONTEXTMENU {
    // SKETCH = ViewSketch,
    ADD_NODE,
    ADD_COMPONENT,
    ADD_COMPONENT_SCRIPT,
    DELETE_NODE,
    EDIT,
    CREATE,
    CONTROL_MODE,
    INTERACTION_MODE
  }

  export enum MENU {
    QUIT = "quit",
    PROJECT_SAVE = "projectSave",
    PROJECT_LOAD = "projectLoad",
    DEVTOOLS_OPEN = "devtoolsOpen",
    PANEL_GRAPH_OPEN = "panelGraphOpen",
    PANEL_ANIMATION_OPEN = "panelAnimationOpen",
    PANEL_PROJECT_OPEN = "panelProjectOpen",
    FULLSCREEN = "fullscreen",
    PANEL_MODELLER_OPEN = "panelModellerOpen"

        /* obsolete ?
    NODE_DELETE = "nodeDelete",
    NODE_UPDATE = "nodeUpdate", 
    */
  }

  export enum EVENT_EDITOR {
    SET_GRAPH = "setGraph",
    FOCUS_NODE = "focusNode",
    SET_PROJECT = "setProject",
    UPDATE = "update",
    DESTROY = "destroy"

    /* obsolete ?
    REMOVE = "removeNode",
    HIDE = "hideNode",
    ACTIVATE_VIEWPORT = "activateViewport",
    */
  }

  export enum PANEL {
    GRAPH = "PanelGraph",
    PROJECT = "PanelProject",
    MODELLER = "PanelModeller"
  }

  export enum VIEW {
    HIERARCHY = "ViewHierarchy",
    ANIMATION = "ViewAnimation",
    RENDER = "ViewRender",
    COMPONENTS = "ViewComponents",
    CAMERA = "ViewCamera",
    INTERNAL = "ViewInternal",
    EXTERNAL = "ViewExternal",
    PROPERTIES = "ViewProperties",
    PREVIEW = "ViewPreview",
    MODELLER = "ViewModeller",
    OBJECT_PROPERTIES = "ViewObjectProperties"
    // PROJECT = ViewProject,
    // SKETCH = ViewSketch,
    // MESH = ViewMesh,
  }
}