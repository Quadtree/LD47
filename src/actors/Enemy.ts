import {Character} from "./Character";
import {
    AbstractMesh, Color3,
    MeshBuilder,
    PBRMaterial,
    PBRMetallicRoughnessMaterial,
    Quaternion,
    Scene, Sound, StandardMaterial,
    Vector3
} from "@babylonjs/core";
import {PlayerCharacter} from "./PlayerCharacter";
import {Util} from "../Util";
import {EnemyProjectile} from "./EnemyProjectile";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Explosion} from "./Explosion";

export class Enemy extends Character {
    public removed:boolean = false;

    public hp:number = 0.5;

    private mesh:AbstractMesh;

    private attackCharge:number = 0;

    private static baseMesh:AbstractMesh|null;

    public static shootSound:Sound;

    public static destroyedSound:Sound;

    public static async load(scene:Scene){
        this.baseMesh = (await SceneLoader.ImportMeshAsync(null, './assets/small_enemy.glb', '', scene)).meshes[0];
        this.baseMesh.getChildMeshes().forEach(it => it.isVisible = false);

        this.shootSound = await Util.loadSound("assets/enemy_shoot.wav", scene);
        this.destroyedSound = await Util.loadSound("assets/enemy_destroyed.wav", scene);
    }

    public constructor(scene:Scene, startPosition:Vector3) {
        super(scene, null, startPosition);
        console.log(`Enemy spawned @ ${startPosition}`)

        //this.mesh = MeshBuilder.CreateBox("", {size: 1}, this.scene);

        this.mesh = Enemy.baseMesh!.clone("", null, false)!
        this.mesh.getChildMeshes().forEach(it => it.isVisible = true);
        this.mesh.scaling = new Vector3(0.6, 0.6, 0.6);

        this.mesh.getChildMeshes().forEach(it => {

            //if (it.material instanceof PBRMaterial){
            //    it.material.maxSimultaneousLights = 12;
            //}

            //it.material = null;

            //it.material = new StandardMaterial("", scene);
            //if (it.material instanceof StandardMaterial){
            //    it.material.diffuseColor = new Color3(1, 0.7, 0.7);
            //}

            /*if (it.material instanceof PBRMaterial){
                console.log(it.material);
                it.material.disableLighting = false;

                const tex = it.material.albedoTexture;

                it.material = new PBRMetallicRoughnessMaterial("", scene);
                if (it.material instanceof PBRMetallicRoughnessMaterial){
                    it.material.baseTexture = tex;
                }
            }*/
        });
    }


    update(delta: number) {
        super.update(delta);

        let canSeePC = false;

        const pcList = this.actorManager!.actors.filter(it => it instanceof PlayerCharacter);
        if (pcList.length){
            const pc = pcList[0] as PlayerCharacter;

            const deltaPos = pc.pos.subtract(this.pos);

            const towardsPCNormalized = deltaPos.normalize();
            const towardsEnemyNormalized = deltaPos.scale(-1).normalize();

            if (!Util.rayTest(this.scene, this.pos.add(towardsPCNormalized.scale(2)), pc.pos.add(towardsEnemyNormalized.scale(2)))){
                const targetRotation = Quaternion.FromEulerAngles(0, Math.atan2(deltaPos.x, deltaPos.z), 0);
                const currentRotation = Quaternion.FromEulerVector(this.camera.rotation);
                this.camera.rotation = Quaternion.Slerp(currentRotation, targetRotation, 0.03).toEulerAngles();

                canSeePC = true;
                this.attackCharge += delta;

                const dist = 1 - Math.pow(Quaternion.Dot(currentRotation, targetRotation), 2);

                if (dist < 0.02) {
                    if (Vector3.Distance(pc.pos, this.pos) > 12) {
                        this.moveForward = true;
                    } else {
                        this.moveForward = false;
                    }

                    if (this.attackCharge >= 1) {
                        const shotSrc = this.pos.add(new Vector3(0, -0.55, 0));

                        this.actorManager!.add(new EnemyProjectile(
                            shotSrc,
                            pc.pos.subtract(shotSrc).normalize().scale(this.actorManager!.currentDifficultySettings.enemyProjectileSpeed),
                            this.actorManager!.currentDifficultySettings.enemyDamage
                        ));

                        Enemy.shootSound.play();

                        this.attackCharge = 0;
                    }
                }
            }
        }

        if (!canSeePC) this.attackCharge = 0;

        this.mesh.position.copyFrom(this.pos.add(new Vector3(0, -2, 0)));
        this.mesh.rotation = this.camera.rotation.clone();
    }

    keep(): boolean {
        return super.keep() && !this.removed && this.hp > 0;
    }

    takeDamage(amount: number): number {
        this.hp -= amount;
        console.log(`PC took ${amount} damage, HP is now ${this.hp}`);

        if (this.hp <= 0){
            this.actorManager!.add(new Explosion(this.pos.add(new Vector3(0, -1, 0)), 80, new Color3(1, 0.5, 0)));
            Enemy.destroyedSound.play();
        }

        return amount;
    }


    exitingView() {
        super.exitingView();

        this.mesh.dispose(false, false);
    }
}
