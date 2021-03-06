import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {AmmoJSPlugin} from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import {DirectionalLight} from "@babylonjs/core/Lights/directionalLight";
import {Engine} from "@babylonjs/core/Engines/engine";
import {HemisphericLight} from "@babylonjs/core/Lights/hemisphericLight";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {PBRMetallicRoughnessMaterial} from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";
import {PhysicsViewer} from "@babylonjs/core/Debug/physicsViewer";
import {Scene} from "@babylonjs/core/scene";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {ShadowGenerator} from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import "@babylonjs/core/Physics/physicsEngineComponent";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import {ActorManager} from './am/ActorManager';
import {Character} from './actors/Character';
import {Color3, PBRMaterial, Sound, StandardMaterial} from "@babylonjs/core";
import {PlayerCharacter} from "./actors/PlayerCharacter";
import {CardConsole, CardConsoleColor} from "./actors/CardConsole";
import {ExitDoor} from "./actors/ExitDoor";
import {EnemySpawnPoint} from "./actors/EnemySpawnPoint";
import {GLTFFileLoader} from "@babylonjs/loaders";
import {PowerUp, PowerUpType} from "./actors/PowerUp";
import {Enemy} from "./actors/Enemy";
import {StartDoor} from "./actors/StartDoor";
import {AdvancedDynamicTexture} from "@babylonjs/gui";
import {Projectile} from "./actors/Projectile";
import {Util} from "./Util";

export let canvasGlobal:HTMLCanvasElement;
export let globalEngine:Engine;
export let globalGameMain:GameMain;

export class GameMain {
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    //private _camera: FreeCamera;
    public shadowGenerator:ShadowGenerator;
    private actorManager = new ActorManager()
    private character:Character|null = null

    public musicLoading:Promise<Sound>;

    constructor(canvasElement : string) {

        globalGameMain = this;

        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        canvasGlobal = this._canvas;
        this._engine = new Engine(this._canvas, true);
        globalEngine = this._engine;

        // Create a basic BJS Scene object.
        this._scene = new Scene(this._engine);
        this._scene.collisionsEnabled = true
        this._scene.gravity = new Vector3(0, -0.1, 0)

        //this._scene.createDefaultEnvironment();

        this._scene.enablePhysics(new Vector3(0, -9.8, 0), new AmmoJSPlugin())

        const skyLight = new HemisphericLight('light1', new Vector3(0,1,0), this._scene);
        skyLight.intensity = 0.2

        const skyLight2 = new HemisphericLight('light1', new Vector3(0,-1,0), this._scene);
        skyLight2.intensity = 0.05

        const directionalLight = new DirectionalLight("light2", new Vector3(-1,-1,-1), this._scene)
        directionalLight.intensity = 1
        directionalLight.shadowEnabled = true
        directionalLight.autoCalcShadowZBounds = true

        this.shadowGenerator = new ShadowGenerator(1024, directionalLight);
        this.shadowGenerator.useContactHardeningShadow = true
        this.shadowGenerator.usePercentageCloserFiltering = true

        this.actorManager.scene = this._scene

        this.musicLoading = Util.loadSound("assets/slowpiano2.ogg", this._scene, true);
    }

    private sphere:any;

    async init(){
        await Promise.all([
            Enemy.load(this._scene),
            PlayerCharacter.load(this._scene),
            StartDoor.load(this._scene),
            ExitDoor.load(this._scene),
            PowerUp.load(this._scene),
            Projectile.load(this._scene),
        ]);

        this.actorManager.ui = AdvancedDynamicTexture.CreateFullscreenUI("", true, this._scene);

        PlayerCharacter.createFader(this.actorManager)

        let chr = new PlayerCharacter(this._scene, this._canvas);
        this.actorManager.add(chr);

        await this.createMeshTerrain();
    }

    async createMeshTerrain() {
        const ground2 = (await SceneLoader.ImportMeshAsync(null, './assets/map1.glb', '', this._scene)).meshes[0];
        //ground2.position.y -= 50;
        //ground2.position.z += 20;
        console.log(`loaded ground2=${ground2.name} ${ground2.position} ${ground2.rotation}`);

        const physicsViewer = new PhysicsViewer(this._scene);

        let found = 0;

        for (const child of ground2.getChildMeshes()){
            const markerLocation = child.position.multiplyByFloats(-1, 1, 1);

            let marker = false;
            if (child.name == "RedCardConsole"){
                console.log("Found RedCardConsole")
                this.actorManager.add(new CardConsole(markerLocation, this._scene, CardConsoleColor.Red));
                marker = true;
            } else if (child.name == "GreenCardConsole"){
                console.log("Found GreenCardConsole")
                this.actorManager.add(new CardConsole(markerLocation, this._scene, CardConsoleColor.Green));
                marker = true;
            } else if (child.name == "BlueCardConsole"){
                console.log("Found BlueCardConsole")
                this.actorManager.add(new CardConsole(markerLocation, this._scene, CardConsoleColor.Blue));
                marker = true;
            } else if (child.name == "ExitDoor"){
                this.actorManager.add(new ExitDoor(markerLocation));
                marker = true;
            } else if (child.name.includes("EnemySpawn")){
                console.log("Found EnemySpawn")
                this.actorManager.add(new EnemySpawnPoint(markerLocation));
                marker = true;
            } else if (child.name.includes("AttackPowerUp")){
                this.actorManager.add(new PowerUp(markerLocation, this._scene, PowerUpType.Attack));
                marker = true;
            } else if (child.name.includes("ChargePowerUp")){
                this.actorManager.add(new PowerUp(markerLocation, this._scene, PowerUpType.Charge));
                marker = true;
            }

            if (marker){
                child.dispose();
            } else {
                console.log(`non marker ${child.name} ${child.position} ${child.rotation}`);
                if (child.name.includes("Walls")) {
                    child.receiveShadows = true;
                } else {
                    this.shadowGenerator.addShadowCaster(child);
                }
            }
        }

        ground2.physicsImpostor = new PhysicsImpostor(ground2, PhysicsImpostor.MeshImpostor, {mass: 0}, this._scene);
        physicsViewer.showImpostor(ground2.physicsImpostor);

        const backgroundSphere = MeshBuilder.CreateIcoSphere("", {radius: 400}, this._scene);
        const backgroundSphereMat = new StandardMaterial("", this._scene);
        backgroundSphereMat.emissiveTexture = new Texture("assets/starfield.png", this._scene);
        (backgroundSphereMat.emissiveTexture as Texture).vScale = 5;
        (backgroundSphereMat.emissiveTexture as Texture).uScale = 5;
        backgroundSphereMat.diffuseColor = new Color3(0,0,0);
        backgroundSphereMat.specularColor = new Color3(0,0,0);
        backgroundSphereMat.backFaceCulling = false;
        backgroundSphere.material = backgroundSphereMat;

        this.actorManager.add(new StartDoor());

        this.needsSpawn = true;
    }

    private needsSpawn:boolean = false;

    async doRender() {
        await this.init();

        let lastRun = new Date().getTime() / 1000;

        // Run the render loop.
        this._engine.runRenderLoop(() => {
            //this.sphere.position.y = 4 + Math.random();
            this._scene.render();

            const currentTime = new Date().getTime() / 1000;
            const delta = currentTime - lastRun;
            lastRun = currentTime;


            this.actorManager.update(delta)

            if (this.needsSpawn){
                EnemySpawnPoint.respawnAll(this.actorManager);
                this.needsSpawn = false;
            }

            //console.log(`mesh count ${this._scene.meshes.length}`);
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });


    }
}
