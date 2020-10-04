import {Actor} from "../am/Actor";
import {AbstractMesh, Scene, Sound, Vector3} from "@babylonjs/core";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Util} from "../Util";

export class StartDoor extends Actor {
    private mesh:AbstractMesh|null = null;

    private static baseMesh:AbstractMesh|null;

    private static doorOpenSound:Sound;

    lastPlayedMs:number = 0;

    public openAmount = 0;

    public static async load(scene:Scene) {
        this.baseMesh = (await SceneLoader.ImportMeshAsync(null, './assets/pod_bay_door.glb', '', scene)).meshes[0];
        this.baseMesh.getChildMeshes().forEach(it => it.isVisible = false);

        this.doorOpenSound = await Util.loadSound("assets/door_open.ogg", scene);
    }

    public constructor(){
        super();

        this.mesh = StartDoor.baseMesh!.clone("", null, false)!;
        this.mesh.getChildMeshes().forEach(it => it.isVisible = true);
    }


    update(delta: number) {
        super.update(delta);

        if (this.openAmount > 0.01 && this.openAmount < 0.9){
            if (new Date().getTime() - this.lastPlayedMs > 4000) {
                StartDoor.doorOpenSound.play();
                this.lastPlayedMs = new Date().getTime();
            }
        }

        this.openAmount = Math.min(this.openAmount + delta / 2, 1);



        this.mesh!.rotation = new Vector3(0, this.openAmount * Math.PI / 2 + Math.PI, 0);
    }
}
