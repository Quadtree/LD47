import {Character} from "./Character";
import {AbstractMesh, MeshBuilder, Scene, Vector3} from "@babylonjs/core";
import {PlayerCharacter} from "./PlayerCharacter";
import {Util} from "../Util";
import {EnemyProjectile} from "./EnemyProjectile";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";

export class Enemy extends Character {
    public removed:boolean = false;

    public hp:number = 0.5;

    private mesh:AbstractMesh;

    private attackCharge:number = 0;

    private static baseMesh:AbstractMesh|null;

    public static async load(scene:Scene){
        this.baseMesh = (await SceneLoader.ImportMeshAsync(null, './assets/small_enemy.glb', '', scene)).meshes[0];
        this.baseMesh.getChildMeshes().forEach(it => it.isVisible = false);
    }

    public constructor(scene:Scene, startPosition:Vector3) {
        super(scene, null, startPosition);
        console.log(`Enemy spawned @ ${startPosition}`)

        //this.mesh = MeshBuilder.CreateBox("", {size: 1}, this.scene);

        this.mesh = Enemy.baseMesh!.clone("", null, false)!
        this.mesh.getChildMeshes().forEach(it => it.isVisible = true);
        this.mesh.scaling = new Vector3(0.6, 0.6, 0.6);
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
                this.camera.rotation.y = Math.atan2(deltaPos.x, deltaPos.z);

                if (deltaPos.length() > 8){
                    this.moveForward = true;
                } else {
                    this.moveForward = false;
                }

                canSeePC = true;
                this.attackCharge += delta;

                if (this.attackCharge >= 1){
                    const shotSrc = this.pos.add(new Vector3(0, -0.55, 0));

                    this.actorManager!.add(new EnemyProjectile(
                        shotSrc,
                        pc.pos.subtract(shotSrc).normalize().scale(this.actorManager!.currentDifficultySettings.enemyProjectileSpeed),
                        this.actorManager!.currentDifficultySettings.enemyDamage
                    ));
                    this.attackCharge = 0;
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
        return amount;
    }


    exitingView() {
        super.exitingView();

        this.mesh.dispose(false, true);
    }
}
