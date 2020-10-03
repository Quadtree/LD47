import {Character} from "./Character";
import {AbstractMesh, MeshBuilder, Scene, Vector3} from "@babylonjs/core";

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

        this.mesh.position.copyFrom(this.pos);
    }

    keep(): boolean {
        return super.keep() && !this.removed;
    }
}
