import {
    AbstractMesh,
    Color3,
    MeshBuilder, PBRMaterial,
    PBRMetallicRoughnessMaterial,
    Scene, StandardMaterial,
    Texture,
    Vector3
} from "@babylonjs/core";
import {Actor} from "../am/Actor";
import {PlayerCharacter} from "./PlayerCharacter";

export enum PowerUpType {
    Charge,
    Attack,
}

const COLORS = [
    new Color3(1,1,1),
    new Color3(1,0.5,0),
];

const powerUpGraphics = [
    'assets/battery_powerup.png',
    'assets/attack_powerup.png',
]

export class PowerUp extends Actor {
    private mesh:AbstractMesh;

    private collected:boolean = false;

    public constructor(private pos:Vector3, private scene:Scene, private type:PowerUpType){
        super();

        this.mesh = MeshBuilder.CreatePlane("sp1", {size: 2}, scene);

        //const material = new StandardMaterial("matmat", scene);
        //material.emissiveTexture = new Texture(powerUpGraphics[type], scene);
        //material.diffuseTexture = new Texture(powerUpGraphics[type], scene);

        //material.emissiveColor = new Color3(1,1,1);
        //material.alphaCutOff = 0.5;

        const texture = new Texture(powerUpGraphics[type], scene);
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
