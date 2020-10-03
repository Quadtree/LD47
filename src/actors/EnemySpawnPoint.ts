import {Actor} from "../am/Actor";
import {Vector3} from "@babylonjs/core";

export class EnemySpawnPoint extends Actor {
    public constructor(private pos:Vector3){
        super();


    }
}
