import {Actor} from "../am/Actor";
import {AbstractMesh, Scene, Vector3} from "@babylonjs/core";
import {PlayerCharacter} from "./PlayerCharacter";
import {CardConsoleColor} from "./CardConsole";
import {Image} from "@babylonjs/gui";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";

export class ExitDoor extends Actor {
    private mesh:AbstractMesh|null = null;

    private static baseMesh:AbstractMesh|null;

    public static async load(scene:Scene){
        this.baseMesh = (await SceneLoader.ImportMeshAsync(null, './assets/exit_door.glb', '', scene)).meshes[0];
        this.baseMesh.getChildMeshes().forEach(it => it.isVisible = false);
    }

    public constructor(private pos:Vector3){
        super();

        this.mesh = ExitDoor.baseMesh!.clone("", null, false)!;
        this.mesh.getChildMeshes().forEach(it => it.isVisible = true);

        this.mesh.position = this.pos;
        //this.mesh.scaling = new Vector3(1.2, 1.2, 1.2);
        this.mesh.rotation = new Vector3(0, 0, 0);
    }

    private static shownWinScreen = false;

    update(delta: number) {
        super.update(delta);

        const pcList = this.actorManager!.actors.filter(it => it instanceof PlayerCharacter);
        if (pcList.length){
            const pc = pcList[0] as PlayerCharacter;

            if (pc.pos.subtract(this.pos).length() < 2){
                if (pc.cards.includes(CardConsoleColor.Red) && pc.cards.includes(CardConsoleColor.Green) && pc.cards.includes(CardConsoleColor.Blue) && !ExitDoor.shownWinScreen){
                    console.log("YOU WIN!! CONGRATS");

                    const victoryScreen = new Image("", "assets/victory_screen.png");
                    victoryScreen.stretch = Image.STRETCH_NONE;
                    victoryScreen.widthInPixels = 800;
                    victoryScreen.heightInPixels = 800;

                    PlayerCharacter.gameStarted = false;
                    PlayerCharacter.fader!.alpha = 1;

                    this.actorManager!.ui!.addControl(victoryScreen);

                    document.exitPointerLock();

                    ExitDoor.shownWinScreen = true;
                }
            }
        }
    }
}
