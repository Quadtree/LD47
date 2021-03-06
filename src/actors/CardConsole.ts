import {Actor} from "../am/Actor";
import {
    AbstractMesh,
    Color3,
    MeshBuilder, PBRMaterial,
    PBRMetallicRoughnessMaterial,
    Scene,
    Texture,
    Vector3
} from "@babylonjs/core";
import {PlayerCharacter} from "./PlayerCharacter";
import {PowerUp} from "./PowerUp";

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

    private collected:boolean = false;

    public constructor(private pos:Vector3, private scene:Scene, private cardConsoleColor:CardConsoleColor){
        super();

        this.mesh = MeshBuilder.CreatePlane("sp1", {size: 1}, scene);

        const texture = new Texture(`assets/key${cardConsoleColor}.png`, scene);
        texture.hasAlpha = true;

        const mat = new PBRMaterial("", scene);
        mat.emissiveTexture = texture;
        mat.emissiveColor = new Color3(1,1,1);
        mat.emissiveIntensity = 1;
        mat.albedoTexture = texture;
        mat.useAlphaFromAlbedoTexture = true;
        mat.transparencyMode = 2;
        mat.backFaceCulling = false;

        this.mesh.material = mat;

        this.mesh.position.copyFrom(this.pos);

        console.log(`Creating mesh and stuff at ${this.pos}`);

        //this.scene.addMesh(this.mesh);
    }

    update(delta: number) {
        super.update(delta);

        this.mesh.rotation.y += delta * 2;

        const pcList = this.actorManager!.actors.filter(it => it instanceof PlayerCharacter);
        if (pcList.length){
            const pc = pcList[0] as PlayerCharacter;

            if (pc.pos.subtract(this.mesh.position).length() < 2){
                console.log(`Collecting ${this.cardConsoleColor}`)
                this.collected = true
                pc.cards.push(this.cardConsoleColor);

                PowerUp.hitSound.play()
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
