import {Actor} from "../am/Actor";
import {Vector3} from "@babylonjs/core";
import {PlayerCharacter} from "./PlayerCharacter";
import {CardConsoleColor} from "./CardConsole";
import {Image} from "@babylonjs/gui";

export class ExitDoor extends Actor {

    public constructor(private pos:Vector3){
        super();
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
