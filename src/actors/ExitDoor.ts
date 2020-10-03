import {Actor} from "../am/Actor";
import {Vector3} from "@babylonjs/core";
import {PlayerCharacter} from "./PlayerCharacter";
import {CardConsoleColor} from "./CardConsole";

export class ExitDoor extends Actor {

    public constructor(private pos:Vector3){
        super();
    }

    update(delta: number) {
        super.update(delta);

        const pcList = this.actorManager!.actors.filter(it => it instanceof PlayerCharacter);
        if (pcList.length){
            const pc = pcList[0] as PlayerCharacter;

            if (pc.pos.subtract(this.pos).length() < 2){
                if (pc.cards.includes(CardConsoleColor.Red) && pc.cards.includes(CardConsoleColor.Green) && pc.cards.includes(CardConsoleColor.Blue)){
                    console.log("YOU WIN!! CONGRATS");
                }
            }
        }
    }
}
