import {Actor} from "../am/Actor";
import {AbstractMesh, PointLight, Scene, StandardMaterial, Vector3} from "@babylonjs/core";
import {Util} from "../Util";
import {Character} from "./Character";

export abstract class Projectile extends Actor {
    private mesh:AbstractMesh|null = null;
    private light:PointLight|null = null;

    private life:number = 10;

    private scene:Scene|null = null;

    public constructor(public pos:Vector3, public vel:Vector3, public readonly damage:number){
        super();
    }

    protected abstract makeMesh(scene: Scene):AbstractMesh
    protected abstract disposeMesh(mesh: AbstractMesh):void
    protected abstract canHit(actor:Actor):boolean

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = this.makeMesh(scene);
        this.mesh.position.copyFrom(this.pos);

        if (this.mesh.material instanceof StandardMaterial){
            this.light = new PointLight("", this.pos, scene);
            this.light.intensity = 2;
            this.light.diffuse = this.mesh.material.emissiveColor;
            this.light.specular = this.mesh.material.emissiveColor;
        }

        this.scene = scene;
    }

    exitingView() {
        super.exitingView();

        this.mesh!.dispose();

        if (this.light){
            this.light.dispose(false, true);
            this.light = null;
        }
    }


    update(delta: number) {
        super.update(delta);

        this.mesh!.position.addInPlace(this.vel.scale(delta))

        if (this.light){
            this.light.position.copyFrom(this.mesh!.position);
        }

        this.life -= delta;

        if (Util.rayTest(this.scene!, this.mesh!.position, this.mesh!.position.add(this.vel.scale(delta * 3)))){
            this.life = -1;
            console.log("HIT SOMETHING");

            for (const actor of this.actorManager!.actors){
                if (actor instanceof Character && actor.pos.subtract(this.mesh!.position).length() < 3) {
                    if ((actor as any).takeDamage && this.canHit(actor)) {
                        (actor as any).takeDamage(this.damage);
                    }
                }
            }
        }
    }

    keep(): boolean {
        return this.life > 0;
    }
}
