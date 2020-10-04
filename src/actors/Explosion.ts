import {Actor} from "../am/Actor";
import {Color3, Light, ParticleSystem, PointLight, Scene, Texture, Vector3} from "@babylonjs/core";

export class Explosion extends Actor {
    constructor(private pos:Vector3, private power:number, private color:Color3) {
        super();
    }

    private system:ParticleSystem|null = null;

    private light:PointLight|null = null;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.system = new ParticleSystem("", 200, scene);

        this.system.particleTexture = new Texture("assets/glow.png", scene);
        this.system.emitter = this.pos.clone();
        this.system.minLifeTime = 0.2
        this.system.maxLifeTime = 0.3
        this.system.minSize = 0.02 * this.power
        this.system.minSize = 0.03 * this.power
        this.system.color1 = this.color.toColor4(1)
        this.system.color2 = this.color.toColor4(1)
        this.system.colorDead = this.color.toColor4(0)
        this.system.manualEmitCount = 200
        this.system.emitRate = 0

        this.system.direction1 = new Vector3(.2,.2,.2).scale(this.power)
        this.system.direction2 = this.system.direction1.scale(-1)

        this.system.addDragGradient(0, 0.8)
        this.system.addDragGradient(1, 0.8)

        this.system.blendMode = ParticleSystem.BLENDMODE_STANDARD;

        this.system.start()

        this.light = new PointLight("", this.pos, scene);
        this.light.intensity = 2;
        this.light.diffuse = this.color;
        this.light.specular = this.color;
        this.light.position = this.pos.clone();
    }

    exitingView() {
        super.exitingView();

        this.system!.dispose()
        this.light!.dispose(false, true);
    }

    update(delta: number) {
        super.update(delta);

        this.light!.intensity -= delta * 4;
    }


    keep(): boolean {
        return this.light!.intensity > 0;
    }
}
