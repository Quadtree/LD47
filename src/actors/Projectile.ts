import {Actor} from "../am/Actor";
import {AbstractMesh, EventState, PhysicsImpostor, Scene, Vector3} from "@babylonjs/core";
import {Util} from "../Util";

export abstract class Projectile extends Actor {
    private mesh:AbstractMesh|null = null;

    private life:number = 10;

    private scene:Scene|null = null;

    public constructor(public pos:Vector3, public vel:Vector3){
        super();
    }

    protected abstract makeMesh(scene: Scene):AbstractMesh
    protected abstract disposeMesh(mesh: AbstractMesh):void
    protected abstract canHit(actor:Actor):boolean

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = this.makeMesh(scene);
        this.mesh.position.copyFrom(this.pos);

        this.scene = scene;
    }

    exitingView() {
        super.exitingView();

        this.mesh!.dispose();
    }


    update(delta: number) {
        super.update(delta);

        this.mesh!.position.addInPlace(this.vel.scale(delta));

        this.life -= delta;

        if (Util.rayTest(this.scene!, this.mesh!.position, this.mesh!.position.add(this.vel.scale(delta * 3)))){
            this.life = -1;
            console.log("HIT SOMETHING");
        }
    }

    keep(): boolean {
        return this.life > 0;
    }
}
