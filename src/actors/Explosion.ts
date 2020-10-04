import {Actor} from "../am/Actor";
import {Color3, ParticleSystem, Scene, Texture, Vector3} from "@babylonjs/core";

export class Explosion extends Actor {
    constructor(private pos:Vector3, private power:number, private color:Color3) {
        super();
    }

    private system:ParticleSystem|null = null;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.system = new ParticleSystem("", 200, scene);

        this.system.particleTexture = new Texture("assets/glow.png", scene);
        this.system.emitter = this.pos.clone();
        this.system.minLifeTime = 0.6
        this.system.maxLifeTime = 0.8
        this.system.minSize = 0.2
        this.system.minSize = 0.3
        this.system.color1 = this.color.toColor4(1)
        this.system.color2 = this.color.toColor4(1)
        this.system.colorDead = this.color.toColor4(0)
        this.system.manualEmitCount = 200
        this.system.emitRate = 0

        this.system.direction1 = new Vector3(5,5,5)
        this.system.direction2 = this.system.direction1.scale(-1)

        this.system.addDragGradient(0, 0.8)
        this.system.addDragGradient(1, 0.8)

        this.system.start()
    }

    exitingView() {
        super.exitingView();

        this.system!.dispose()
    }

    update(delta: number) {
        super.update(delta);
    }
}
