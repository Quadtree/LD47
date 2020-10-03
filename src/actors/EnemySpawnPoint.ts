import {Actor} from "../am/Actor";
import {Scene, Vector3} from "@babylonjs/core";
import {ActorManager} from "../am/ActorManager";
import {Enemy} from "./Enemy";

export class EnemySpawnPoint extends Actor {
    private scene:Scene|null = null;

    public constructor(private pos:Vector3){
        super();
        console.log(`Enemy spawn point created at ${pos}`)
    }


    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.scene = scene;
    }

    static despawnAll(am:ActorManager){
        for (const a of am.actors){
            if (a instanceof Enemy){
                a.removed = true;
            }
        }
    }

    static respawnAll(am:ActorManager){
        for (const a of am.actors){
            if (a instanceof EnemySpawnPoint){
                am.add(new Enemy(a.scene!, a.pos.add(new Vector3(0, 1.5, 0))))
            }
        }
    }
}
