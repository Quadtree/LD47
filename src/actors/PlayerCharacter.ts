import {Character} from "./Character";
import {Scene} from "@babylonjs/core/scene";

export class PlayerCharacter extends Character {
    private wantsToShoot:boolean = false;
    private shootCharge:number = 0;

    public constructor(scene:Scene, canvas:HTMLCanvasElement|null){
        super(scene, canvas);
    }

    update(delta: number) {
        super.update(delta);

        this.shootCharge += delta;

        if (this.wantsToShoot && this.shootCharge >= 0.3){
            console.log("SHOOT");
            this.shootCharge = 0;
        }
    }

    protected pointerDown() {
        super.pointerDown();
        this.wantsToShoot = true;
        console.log(`this.wantsToShoot=${this.wantsToShoot}`)
    }


    protected pointerUp() {
        super.pointerUp();
        this.wantsToShoot = false;
        console.log(`this.wantsToShoot=${this.wantsToShoot}`)
    }
}
