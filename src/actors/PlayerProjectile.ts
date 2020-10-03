import {Projectile} from "./Projectile";
import {AbstractMesh, Color3, MeshBuilder, Scene, StandardMaterial, Vector3} from "@babylonjs/core";
import {Actor} from "../am/Actor";
import {Enemy} from "./Enemy";

export class PlayerProjectile extends Projectile {
    constructor(pos: Vector3, vel: Vector3, damage: number, private isSuper:boolean) {
        super(pos, vel, damage * (isSuper ? 1.5 : 1.0));
    }

    protected makeMesh(scene: Scene): AbstractMesh {
        const mesh = MeshBuilder.CreateIcoSphere("", {radius: 0.25}, scene)

        const material = new StandardMaterial("", scene);
        if (!this.isSuper)
            material.emissiveColor = new Color3(0, 1, 0);
        else
            material.emissiveColor = new Color3(0, 1, 1);

        mesh.material = material;

        return mesh;
    }

    protected disposeMesh(mesh: AbstractMesh) {
        mesh.dispose(false, true);
    }


    protected canHit(actor: Actor): boolean {
        return actor instanceof Enemy;
    }
}
