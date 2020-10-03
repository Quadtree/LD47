import {Actor} from "../am/Actor";
import {AbstractMesh, PhysicsImpostor, Scene, Vector3} from "@babylonjs/core";

export abstract class Projectile extends Actor {
    private mesh:AbstractMesh|null = null;

    private life:number = 10;

    public constructor(public pos:Vector3, public vel:Vector3){
        super();
    }

    protected abstract makeMesh(scene: Scene):AbstractMesh
    protected abstract disposeMesh(mesh: AbstractMesh):void

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = this.makeMesh(scene);
        this.mesh.position.copyFrom(this.pos);

        this.mesh.physicsImpostor = new PhysicsImpostor(this.mesh, PhysicsImpostor.SphereImpostor, {mass: 1, velocityIterations: 10, positionIterations: 10, margin: 0.2}, scene);
        this.mesh.physicsImpostor.setLinearVelocity(this.vel);
    }

    exitingView() {
        super.exitingView();

        this.mesh!.dispose();
    }


    update(delta: number) {
        super.update(delta);

        //this.mesh!.position.addInPlace(this.vel.scale(delta));

        this.life -= delta;
    }

    keep(): boolean {
        return this.life > 0;
    }
}
