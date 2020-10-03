import {Actor} from "../am/Actor";
import {AbstractMesh, Scene, Vector3} from "@babylonjs/core";

export abstract class Projectile extends Actor {
    private mesh:AbstractMesh;

    private life:number = 10;

    protected constructor(public pos:Vector3, public vel:Vector3){
        super();
    }

    protected abstract makeMesh(scene: Scene):AbstractMesh
    protected abstract disposeMesh(mesh: AbstractMesh)

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = this.makeMesh(scene);
    }

    exitingView() {
        super.exitingView();

        this.mesh.dispose();
    }


    update(delta: number) {
        super.update(delta);

        this.mesh.position += this.vel.scale(delta);

        this.life -= delta;
    }

    keep(): boolean {
        return this.life > 0;
    }
}
