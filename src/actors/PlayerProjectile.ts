import {Projectile} from "./Projectile";
import {AbstractMesh, Color3, MeshBuilder, Scene, StandardMaterial} from "@babylonjs/core";
import {Actor} from "../am/Actor";

export class PlayerProjectile extends Projectile {
    protected makeMesh(scene: Scene): AbstractMesh {
        const mesh = MeshBuilder.CreateIcoSphere("", {radius: 0.25}, scene)

        const material = new StandardMaterial("", scene);
        material.emissiveColor = new Color3(0, 1, 0);

        mesh.material = material;

        return mesh;
    }

    protected disposeMesh(mesh: AbstractMesh) {
        mesh.dispose(false, true);
    }


    protected canHit(actor: Actor): boolean {
        return false;
    }
}
