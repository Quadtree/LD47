import {Character} from "./Character";
import {Scene} from "@babylonjs/core/scene";
import {PlayerProjectile} from "./PlayerProjectile";
import {Util} from "../Util";
import {Vector3} from "@babylonjs/core";
import {EnemySpawnPoint} from "./EnemySpawnPoint";

export class PlayerCharacter extends Character {
    private wantsToShoot:boolean = false;
    private shootCharge:number = 0;
    private hp:number = 1;
    private respawnTimer:number|null = null;
    private battery:number = 1;

    private static START_POS = new Vector3(0,2,-1.2);

    public constructor(scene:Scene, canvas:HTMLCanvasElement|null){
        super(scene, canvas, PlayerCharacter.START_POS);
    }

    update(delta: number) {
        if (this.respawnTimer !== null){
            this.moveForward = false;
            this.moveBackward = false;
            this.moveLeft = false;
            this.moveRight = false;
            this.wantsToShoot = false;

            this.respawnTimer -= delta;
            if (this.respawnTimer <= 0){
                this.pos = PlayerCharacter.START_POS
                this.hp = 1;

                this.respawnTimer = null;
            }
        }

        super.update(delta);

        this.shootCharge += delta;

        if (this.wantsToShoot && this.shootCharge >= 0.3 && this.battery >= this.actorManager!.currentDifficultySettings.energyCostPerShot){
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

            this.battery -= this.actorManager!.currentDifficultySettings.energyCostPerShot;
        }

        if (this.respawnTimer !== null){

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

        if (this.hp <= 0 && this.respawnTimer === null){
            EnemySpawnPoint.despawnAll(this.actorManager!);
            this.respawnTimer = 1;
        }

        return amount;
    }


    protected getExtraText(): string {
        return `cards=${this.cards}\nhp=${this.hp.toFixed(2)}\nbattery=${this.battery.toFixed(2)}`
    }
}
