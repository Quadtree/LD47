import {Character} from "./Character";
import {Scene} from "@babylonjs/core/scene";
import {PlayerProjectile} from "./PlayerProjectile";
import {Util} from "../Util";
import {AbstractMesh, Color3, Matrix, PBRMaterial, Quaternion, StandardMaterial, Vector3} from "@babylonjs/core";
import {EnemySpawnPoint} from "./EnemySpawnPoint";
import {PowerUpType} from "./PowerUp";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {AdvancedDynamicTexture, Rectangle} from "@babylonjs/gui";
import {TextBlock} from "@babylonjs/gui/2D/controls/textBlock";

export class PlayerCharacter extends Character {
    private wantsToShoot:boolean = false;
    private shootCharge:number = 0;
    private hp:number = 1;
    private respawnTimer:number|null = null;
    private battery:number = 1;

    public powerUps:PowerUpType[] = [];

    private gunMesh:AbstractMesh|null = null;

    private ui:AdvancedDynamicTexture|null = null;

    private static START_POS = new Vector3(0,2,-1.2);

    private static baseMesh:AbstractMesh|null;

    public static async load(scene:Scene){
        this.baseMesh = (await SceneLoader.ImportMeshAsync(null, './assets/player_gun.glb', '', scene)).meshes[0];
        this.baseMesh.getChildMeshes().forEach(it => it.isVisible = false);
    }

    public constructor(scene:Scene, canvas:HTMLCanvasElement|null){
        super(scene, canvas, PlayerCharacter.START_POS);

        if (PlayerCharacter.baseMesh == null){
            throw 'PlayerCharacter.load() was never called?';
        }

        this.gunMesh = PlayerCharacter.baseMesh!.clone("", null, false)!;
        this.gunMesh.getChildMeshes().forEach(it => it.isVisible = true);
        this.gunMesh.scaling = new Vector3(0.4, 0.4, 0.4);

        this.ui = new AdvancedDynamicTexture('', 256, 256, scene);
        //this.ui = AdvancedDynamicTexture.CreateFullscreenUI("", true, scene);

        const debugUiText = new TextBlock('', 'left')
        this.ui.addControl(debugUiText)
        debugUiText.color = '#ffffff';
        debugUiText.topInPixels = -120;// -40;
        debugUiText.leftInPixels = 60;

        const debugUiText2 = new TextBlock('', 'top')
        this.ui.addControl(debugUiText2)
        debugUiText2.color = '#ffffff';
        debugUiText2.topInPixels = -30;// -40;
        debugUiText2.leftInPixels = -30;

        if (this.gunMesh.getChildMeshes().length != 1) throw 'not one';

        const mat = (this.gunMesh.getChildMeshes()[0].material as PBRMaterial).clone("");
        mat.emissiveTexture = this.ui;
        mat.emissiveColor = new Color3(1,1,1);
        mat.emissiveIntensity = 1;
        this.gunMesh.getChildMeshes()[0].material = mat;

        //const numat = new StandardMaterial('', scene);
        //numat.emissiveTexture = this.ui;
        //this.gunMesh.getChildMeshes()[0].material = numat;
    }

    update(delta: number) {
        if (this.respawnTimer !== null){
            this.moveForward = false;
            this.moveBackward = false;
            this.moveLeft = false;
            this.moveRight = false;
            this.wantsToShoot = false;

            this.respawnTimer -= delta;
            if (this.respawnTimer <= 0){
                this.pos = PlayerCharacter.START_POS
                this.hp = 1;
                this.battery = 1 + (this.powerUps.includes(PowerUpType.Charge) ? 1 : 0);

                this.respawnTimer = null;
            }
        }

        super.update(delta);

        const gunOffset = new Vector3(1,-1,2).rotateByQuaternionToRef(Quaternion.FromEulerVector(this.camera.rotation), new Vector3());
        this.gunMesh!.position = this.camera.position.add(gunOffset);
        this.gunMesh!.rotation = this.camera.rotation;

        this.shootCharge += delta;

        if (this.wantsToShoot && this.shootCharge >= 0.3 && this.battery >= this.actorManager!.currentDifficultySettings.energyCostPerShot){
            //console.log(`SHOOT ${this.camera.globalPosition}`);
            this.shootCharge = 0;

            const shotDir = this.camera.getTarget().subtract(this.camera.globalPosition).normalize();

            this.actorManager!.add(new PlayerProjectile(
                this.gunMesh!.position.add(shotDir.scale(4)),
                shotDir.scale(40),
                this.actorManager!.currentDifficultySettings.playerDamage,
                this.powerUps.includes(PowerUpType.Attack)
            ));

            this.battery -= this.actorManager!.currentDifficultySettings.energyCostPerShot;
        }

        if (this.respawnTimer !== null){

        }
    }

    protected pointerDown() {
        super.pointerDown();
        this.wantsToShoot = true;
        console.log(`this.wantsToShoot=${this.wantsToShoot}`)
    }


    protected pointerUp() {
        super.pointerUp();
        this.wantsToShoot = false;
        console.log(`this.wantsToShoot=${this.wantsToShoot}`)
    }

    takeDamage(amount: number): number {
        this.hp -= amount;
        console.log(`PC took ${amount} damage, HP is now ${this.hp}`);

        if (this.hp <= 0 && this.respawnTimer === null){
            EnemySpawnPoint.despawnAll(this.actorManager!);
            this.respawnTimer = 1;
        }

        return amount;
    }


    protected getExtraText(): string {
        return `cards=${this.cards}\nhp=${this.hp.toFixed(2)}\nbattery=${this.battery.toFixed(2)}`
    }
}
