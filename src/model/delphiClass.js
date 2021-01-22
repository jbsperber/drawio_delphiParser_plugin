import { DelphiMethodCollection } from "./delphiMethod.js"

export default class DelphiClass {
    constructor(name) {
        this.name = name;
        this.fields = [];
        this.properties = [];
        this.parentClass = null;
        this.methods = new DelphiMethodCollection();
    }
}