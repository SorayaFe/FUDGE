namespace FudgeCore {
  /**
   * Makes the node face the camera when rendering, respecting restrictions for rotation around specific axis
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
   */
  export class ComponentFaceCamera extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentFaceCamera);
    constructor() {
      super();
      this.singleton = true;
    }
  }
}