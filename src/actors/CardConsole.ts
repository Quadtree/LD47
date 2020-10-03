import {Actor} from "../am/Actor";
import {AbstractMesh, Color3, MeshBuilder, PBRMetallicRoughnessMaterial, Scene, Vector3} from "@babylonjs/core";

export enum CardConsoleColor {
    Red,
    Green,
    Blue
}

const COLORS = [
    new Color3(1,0,0),
    new Color3(0,1,0),
    new Color3(0,0,1),
]

export class CardConsole extends Actor {
    private mesh:AbstractMesh;

    public constructor(private pos:Vector3, private scene:Scene, private cardConsoleColor:CardConsoleColor){
        super();

        this.mesh = MeshBuilder.CreateIcoSphere("sp1", {radius: 0.5}, scene);

        const material = new PBRMetallicRoughnessMaterial("matmat", scene);
        material.baseColor = COLORS[this.cardConsoleColor];
        material.roughness = 1;
        material.metallic = 1;

        this.mesh.material = material;

        this.mesh.position.copyFrom(this.pos.scale(-1));

        console.log(`Creating mesh and stuff at ${this.pos}`);

        //this.scene.addMesh(this.mesh);
    }
}
