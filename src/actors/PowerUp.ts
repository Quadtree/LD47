import {AbstractMesh, Color3, MeshBuilder, PBRMetallicRoughnessMaterial, Scene, Vector3} from "@babylonjs/core";
import {Actor} from "../am/Actor";
import {PlayerCharacter} from "./PlayerCharacter";

export enum PowerUpType {
    Charge,
    Attack,
}

const COLORS = [
    new Color3(1,1,1),
    new Color3(1,0.5,0),
]

export class PowerUp extends Actor {
    private mesh:AbstractMesh;

    private collected:boolean = false;

    public constructor(private pos:Vector3, private scene:Scene, private type:PowerUpType){
        super();

        this.mesh = MeshBuilder.CreateIcoSphere("sp1", {radius: 0.5}, scene);

        const material = new PBRMetallicRoughnessMaterial("matmat", scene);
        material.baseColor = COLORS[this.type];
        material.roughness = 1;
        material.metallic = 1;

        this.mesh.material = material;

        this.mesh.position.copyFrom(this.pos);

        console.log(`Creating mesh and stuff at ${this.pos}`);

        //this.scene.addMesh(this.mesh);
    }

    update(delta: number) {
        super.update(delta);

        const pcList = this.actorManager!.actors.filter(it => it instanceof PlayerCharacter);
        if (pcList.length){
            const pc = pcList[0] as PlayerCharacter;

            if (pc.pos.subtract(this.mesh.position).length() < 2){
                console.log(`Collecting ${this.type}`)
                this.collected = true
                pc.powerUps.push(this.type);
            }
        }
    }


    keep(): boolean {
        return !this.collected;
    }


    exitingWorld() {
        super.exitingWorld();

        this.mesh.dispose();
    }
}