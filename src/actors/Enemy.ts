import {Character} from "./Character";
import {AbstractMesh, MeshBuilder, Scene, Vector3} from "@babylonjs/core";
import {PlayerCharacter} from "./PlayerCharacter";
import {Util} from "../Util";
import {EnemyProjectile} from "./EnemyProjectile";

export class Enemy extends Character {
    public removed:boolean = false;

    public hp:number = 0.5;

    private mesh:AbstractMesh;

    private attackCharge:number = 0;

    public constructor(scene:Scene, startPosition:Vector3) {
        super(scene, null, startPosition);
        console.log(`Enemy spawned @ ${startPosition}`)

        this.mesh = MeshBuilder.CreateBox("", {size: 1}, this.scene);


    }


    update(delta: number) {
        super.update(delta);

        let canSeePC = false;

        const pcList = this.actorManager!.actors.filter(it => it instanceof PlayerCharacter);
        if (pcList.length){
            const pc = pcList[0] as PlayerCharacter;

            const deltaPos = pc.pos.subtract(this.pos);

            const towardsPCNormalized = deltaPos.normalize();
            const towardsEnemyNormalized = deltaPos.scale(-1).normalize();

            if (!Util.rayTest(this.scene, this.pos.add(towardsPCNormalized.scale(2)), pc.pos.add(towardsEnemyNormalized.scale(2)))){
                if (deltaPos.length() > 12){
                    this.moveForward = true;
                } else {
                    this.moveForward = false;
                }

                this.camera.rotation.y = Math.atan2(deltaPos.x, deltaPos.z);

                canSeePC = true;
                this.attackCharge += delta;

                if (this.attackCharge >= 1){
                    this.actorManager!.add(new EnemyProjectile(
                        this.pos,
                        pc.pos.subtract(this.pos).normalize().scale(this.actorManager!.currentDifficultySettings.enemyProjectileSpeed),
                        this.actorManager!.currentDifficultySettings.enemyDamage
                    ));
                    this.attackCharge = 0;
                }
            }
        }

        if (!canSeePC) this.attackCharge = 0;

        this.mesh.position.copyFrom(this.pos);
        this.mesh.rotation.copyFrom(this.camera.rotation);
    }

    keep(): boolean {
        return super.keep() && !this.removed && this.hp > 0;
    }

    takeDamage(amount: number): number {
        this.hp -= amount;
        console.log(`PC took ${amount} damage, HP is now ${this.hp}`);
        return amount;
    }


    exitingView() {
        super.exitingView();

        this.mesh.dispose(false, true);
    }
}
