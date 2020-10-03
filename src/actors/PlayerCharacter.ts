import {Character} from "./Character";
import {Scene} from "@babylonjs/core/scene";
import {PlayerProjectile} from "./PlayerProjectile";
import {Util} from "../Util";
import {Vector3} from "@babylonjs/core";

export class PlayerCharacter extends Character {
    private wantsToShoot:boolean = false;
    private shootCharge:number = 0;
    private hp:number = 1;

    public constructor(scene:Scene, canvas:HTMLCanvasElement|null){
        super(scene, canvas, new Vector3(0,2,-1.2));
    }

    update(delta: number) {
        super.update(delta);

        this.shootCharge += delta;

        if (this.wantsToShoot && this.shootCharge >= 0.3){
            //console.log(`SHOOT ${this.camera.globalPosition}`);
            this.shootCharge = 0;

            this.actorManager!.add(new PlayerProjectile(
                this.camera.globalPosition.add(this.camera.getTarget().subtract(this.camera.globalPosition).normalize().scale(1.2)),
                this.camera.getTarget().subtract(this.camera.globalPosition).normalize().scale(40),
                0.3
            ));

            Util.rayTest(this.scene,
                this.camera.globalPosition.add(this.camera.getTarget().subtract(this.camera.globalPosition).normalize().scale(1.2)),
                this.camera.globalPosition.add(this.camera.getTarget().subtract(this.camera.globalPosition).normalize().scale(4))
            );
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

    takeDamage(amount: number): number {
        this.hp -= amount;
        console.log(`PC took ${amount} damage, HP is now ${this.hp}`);
        return amount;
    }


}
