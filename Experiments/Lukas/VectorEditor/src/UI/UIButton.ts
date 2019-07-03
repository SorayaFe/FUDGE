namespace FUDGE {
  export class UIButton extends HTMLButtonElement implements UIElement {
    hover: string;
    help: string;
    extendedHelp: string;
    functionToCall: EventListener;
    icon: string;
    constructor(_functionToCall: Function, _name: string, _icon: string, _hover: string, _help: string, _extendedHelp: string) {
      super();
      this.name = _name;
      this.icon = _icon;
      this.hover = _hover;
      this.help = _help;
      this.extendedHelp = _extendedHelp;
      this.functionToCall = <EventListener>_functionToCall;
      this.addEventListener("click", this.functionToCall);
    }
  }
}