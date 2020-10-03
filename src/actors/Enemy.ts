import {Character} from "./Character";
import {AbstractMesh, MeshBuilder, Scene, Vector3} from "@babylonjs/core";
import {PlayerCharacter} from "./PlayerCharacter";

export class Enemy extends Character {
    public removed:boolean = false;

    private mesh:AbstractMesh;

    public constructor(scene:Scene, startPosition:Vector3) {
        super(scene, null, startPosition);
        console.log(`Enemy spawned @ ${startPosition}`)

        this.mesh = MeshBuilder.CreateBox("", {size: 1}, this.scene);


    }


    update(delta: number) {
        super.update(delta);

        const pcList = this.actorManager!.actors.filter(it => it instanceof PlayerCharacter);
        if (pcList.length){
            const pc = pcList[0] as PlayerCharacter;

            const delta = pc.pos.subtract(this.mesh.position);

            if (delta.length() > 12){
                this.moveForward = true;
            } else {
                this.moveForward = false;
            }

            this.camera.rotation.y = Math.atan2(delta.x, delta.z);
        }

        this.mesh.position.copyFrom(this.pos);
        this.mesh.rotation.copyFrom(this.camera.rotation);
    }

    keep(): boolean {
        return super.keep() && !this.removed;
    }
}
