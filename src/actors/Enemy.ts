import {Character} from "./Character";
import {AbstractMesh, MeshBuilder, Scene, Vector3} from "@babylonjs/core";
import {PlayerCharacter} from "./PlayerCharacter";
import {Util} from "../Util";
import {PlayerProjectile} from "./PlayerProjectile";
import {EnemyProjectile} from "./EnemyProjectile";
import {Damagable} from "./Damagable";

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

            if (Util.rayTest(this.scene, this.pos, pc.pos)){
                const deltaPos = pc.pos.subtract(this.mesh.position);

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
                        pc.pos.subtract(this.pos).normalize().scale(10),
                        0.1
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
        return amount;
    }
}
