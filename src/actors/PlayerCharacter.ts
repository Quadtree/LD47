import {Character} from "./Character";
import {Scene} from "@babylonjs/core/scene";
import {PlayerProjectile} from "./PlayerProjectile";
import {Util} from "../Util";
import {AbstractMesh, Color3, Matrix, PBRMaterial, Quaternion, StandardMaterial, Vector3} from "@babylonjs/core";
import {EnemySpawnPoint} from "./EnemySpawnPoint";
import {PowerUpType} from "./PowerUp";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {AdvancedDynamicTexture, Image, Rectangle} from "@babylonjs/gui";
import {TextBlock} from "@babylonjs/gui/2D/controls/textBlock";
import {StartDoor} from "./StartDoor";

export class PlayerCharacter extends Character {
    private wantsToShoot:boolean = false;
    private shootCharge:number = 0;
    private hp:number = 1;
    private respawnTimer:number|null = null;

    private static RESPAWN_PHASE_1_FALLING_UNC = 2;
    private static RESPAWN_PHASE_2_WAKING_UP = 4;
    private static RESPAWN_PHASE_3_DOOR_OPENING = 6;
    private static RESPAWN_PHASE_4_DONE = 8;

    private battery:number = 1;

    private paralyzedTime = 2;

    public powerUps:PowerUpType[] = [];

    private gunMesh:AbstractMesh|null = null;

    private ui:AdvancedDynamicTexture|null = null;

    private healthBar:AbstractMesh|null = null;
    private energyBar:AbstractMesh|null = null;

    private powerUpIndicators:AbstractMesh[] = [];
    private keyIndicators:AbstractMesh[] = [];

    private static START_POS = new Vector3(0,2,0);

    private static baseMesh:AbstractMesh|null;

    private static fader:Rectangle|null = null;

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

        for (const childMesh of this.gunMesh.getChildMeshes()) {
            if (childMesh.name == ".HealthBar") {
                this.healthBar = childMesh;
            } else if (childMesh.name == ".EnergyBar"){
                this.energyBar = childMesh;
            } else if (childMesh.name == ".Key0"){
                this.keyIndicators[0] = childMesh;
            } else if (childMesh.name == ".Key1"){
                this.keyIndicators[1] = childMesh;
            } else if (childMesh.name == ".Key2"){
                this.keyIndicators[2] = childMesh;
            } else if (childMesh.name == ".Powerup0"){
                this.powerUpIndicators[0] = childMesh;
            } else if (childMesh.name == ".Powerup1"){
                this.powerUpIndicators[1] = childMesh;
            }
        }

        //this.ui = new AdvancedDynamicTexture('', 256, 256, scene);
        //this.ui = AdvancedDynamicTexture.CreateFullscreenUI("", true, scene);

        /*const debugUiText = new TextBlock('', 'left')
        this.ui.addControl(debugUiText)
        debugUiText.color = '#ffffff';
        debugUiText.topInPixels = -120;// -40;
        debugUiText.leftInPixels = 60;*/

        /*const healthBarBackground = new Rectangle();
        healthBarBackground.background = '#000000';
        healthBarBackground.topInPixels = -120;
        healthBarBackground.leftInPixels = 70;
        healthBarBackground.widthInPixels = 40;
        healthBarBackground.heightInPixels = 6;
        this.ui.addControl(healthBarBackground);

        const debugUiText2 = new TextBlock('', 'top')
        this.ui.addControl(debugUiText2)
        debugUiText2.color = '#ffffff';
        debugUiText2.topInPixels = -30;// -40;
        debugUiText2.leftInPixels = -30;

        for (const childMesh of this.gunMesh.getChildMeshes()){
            if (childMesh.name == ".Cube.001"){
                const mat = (childMesh.material as PBRMaterial).clone("");
                mat.emissiveTexture = this.ui;
                mat.emissiveColor = new Color3(1,1,1);
                mat.emissiveIntensity = 1;
                mat.albedoTexture = this.ui;
                mat.useAlphaFromAlbedoTexture = true;
                mat.transparencyMode = 2;
                childMesh.material = mat;
            }
        }*/

        /*if (this.gunMesh.getChildMeshes().length != 1) throw 'not one';

        const origMat = (this.gunMesh.getChildMeshes()[0].material as PBRMaterial);
        const mat = origMat.clone("");
        mat.emissiveTexture = this.ui;
        mat.emissiveColor = new Color3(1,1,1);
        mat.emissiveIntensity = 1;
        this.gunMesh.getChildMeshes()[0].material = mat;*/

        //const numat = new StandardMaterial('', scene);
        //numat.emissiveTexture = this.ui;
        //this.gunMesh.getChildMeshes()[0].material = numat;
    }

    private get maxBattery(){
        return 1 + (this.powerUps.includes(PowerUpType.Charge) ? 1 : 0);
    }

    update(delta: number) {
        if (PlayerCharacter.fader == null){
            PlayerCharacter.fader = new Rectangle("");
            PlayerCharacter.fader.background = "#000000";
            PlayerCharacter.fader.color = "#000000";
            PlayerCharacter.fader.widthInPixels = 5000;
            PlayerCharacter.fader.heightInPixels = 5000;
            PlayerCharacter.fader.alpha = 0.0;

            this.actorManager!.ui!.addControl(PlayerCharacter.fader);
        }

        this.healthBar!.scaling.set(1, 1, Math.max(this.hp, 0));
        this.energyBar!.scaling.set(1, 1, Math.max(this.battery / this.maxBattery, 0));

        for (let i=0;i<this.keyIndicators.length;++i){
            this.keyIndicators[i].isVisible = this.cards.includes(i)
        }

        for (let i=0;i<this.powerUpIndicators.length;++i){
            this.powerUpIndicators[i].isVisible = this.powerUps.includes(i)
        }

        if (this.respawnTimer !== null || this.paralyzedTime > 0) {
            this.moveForward = false;
            this.moveBackward = false;
            this.moveLeft = false;
            this.moveRight = false;
            this.wantsToShoot = false;
        }

        if (this.respawnTimer !== null){
            this.respawnTimer += delta;

            if (this.respawnTimer < PlayerCharacter.RESPAWN_PHASE_1_FALLING_UNC){
                // player is still falling unconscious
                PlayerCharacter.fader.alpha = Math.min(Math.max(PlayerCharacter.fader.alpha + delta / 2, 0), 1);
            }

            if (this.respawnTimer >= PlayerCharacter.RESPAWN_PHASE_1_FALLING_UNC){
                PlayerCharacter.fader.alpha = Math.min(Math.max(PlayerCharacter.fader.alpha - delta / 2, 0), 1);

                this.pos = PlayerCharacter.START_POS
                this.hp = 1;
                this.battery = this.maxBattery;

                this.camera.rotation = new Vector3(0, Math.PI / 2, 0);
            }

            if (this.respawnTimer < PlayerCharacter.RESPAWN_PHASE_2_WAKING_UP){
                for (const aa of this.actorManager!.actors){
                    if (aa instanceof StartDoor){
                        aa.openAmount = 0;
                    }
                }
            }

            if (this.respawnTimer >= PlayerCharacter.RESPAWN_PHASE_3_DOOR_OPENING){
                this.respawnTimer = null;
            }
        }

        if (this.paralyzedTime > 0){
            this.paralyzedTime -= delta;

            this.camera.rotation = new Vector3(0, Math.PI / 2, 0);
        }

        super.update(delta);

        const gunOffset = new Vector3(1,-1,2).rotateByQuaternionToRef(Quaternion.FromEulerVector(this.camera.rotation), new Vector3());
        this.gunMesh!.position = this.camera.position.add(gunOffset);
        this.gunMesh!.rotation = this.camera.rotation.clone().add(new Vector3(0, 0, Math.PI / 2));

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
            this.respawnTimer = 0;
        }

        return amount;
    }


    protected getExtraText(): string {
        return `cards=${this.cards}\nhp=${this.hp.toFixed(2)}\nbattery=${this.battery.toFixed(2)}`
    }
}
