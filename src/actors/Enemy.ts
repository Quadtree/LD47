import {Character} from "./Character";
import {Scene, Vector3} from "@babylonjs/core";

export class Enemy extends Character {
    public removed:boolean = false;

    public constructor(scene:Scene, private pos:Vector3) {
        super(scene, null, pos);
    }

    keep(): boolean {
        return super.keep() && !this.removed;
    }
}
