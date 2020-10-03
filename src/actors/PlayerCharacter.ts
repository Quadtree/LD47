import {Character} from "./Character";
import {Scene} from "@babylonjs/core/scene";

export class PlayerCharacter extends Character {
    public constructor(scene:Scene, canvas:HTMLCanvasElement|null){
        super(scene, canvas);
    }

    protected pointerDown() {
        super.pointerDown();
    }
}
