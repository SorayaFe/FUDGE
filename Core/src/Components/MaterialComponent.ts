namespace Fudge {
    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class MaterialComponent extends Component {
        private material: Material;
        
        // TODO: Shader defines material-parameter. Can then the material be independent of the shader? Different structure needed
        public initialize(_material: Material): void {
            this.material = _material;
        }

        public get Material(): Material {
            return this.material;
        }
    }
}