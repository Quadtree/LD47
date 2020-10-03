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
import {Color3} from "@babylonjs/core";
import {PlayerCharacter} from "./actors/PlayerCharacter";
import {CardConsole, CardConsoleColor} from "./actors/CardConsole";
import {ExitDoor} from "./actors/ExitDoor";
import {EnemySpawnPoint} from "./actors/EnemySpawnPoint";
import {GLTFFileLoader} from "@babylonjs/loaders";
import {PowerUp, PowerUpType} from "./actors/PowerUp";

export class GameMain {
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    //private _camera: FreeCamera;
    private shadowGenerator:ShadowGenerator;
    private actorManager = new ActorManager()
    private character:Character|null = null

    constructor(canvasElement : string) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new Engine(this._canvas, true);

        // Create a basic BJS Scene object.
        this._scene = new Scene(this._engine);
        this._scene.collisionsEnabled = true
        this._scene.gravity = new Vector3(0, -0.1, 0)

        this._scene.enablePhysics(new Vector3(0, -9.8, 0), new AmmoJSPlugin())

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        const skyLight = new HemisphericLight('light1', new Vector3(0,1,0), this._scene);
        skyLight.intensity = 0.4

        const skyLight2 = new HemisphericLight('light1', new Vector3(0,-1,0), this._scene);
        skyLight2.intensity = 0.1

        const directionalLight = new DirectionalLight("light2", new Vector3(-0.4,-1,-0.5), this._scene)
        directionalLight.intensity = 0.5
        directionalLight.shadowEnabled = true
        directionalLight.autoCalcShadowZBounds = true

        this.shadowGenerator = new ShadowGenerator(1024, directionalLight);
        this.shadowGenerator.useContactHardeningShadow = true
        this.shadowGenerator.usePercentageCloserFiltering = true

        this.actorManager.scene = this._scene

        let chr = new PlayerCharacter(this._scene, this._canvas);
        this.actorManager.add(chr);
    }

    private sphere:any;

    async init(){
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
            }
        }

        ground2.physicsImpostor = new PhysicsImpostor(ground2, PhysicsImpostor.MeshImpostor, {mass: 0}, this._scene);
        physicsViewer.showImpostor(ground2.physicsImpostor);
        this.needsSpawn = true;
    }

    private needsSpawn:boolean = false;

    async doRender() {
        // Run the render loop.
        this._engine.runRenderLoop(() => {
            //this.sphere.position.y = 4 + Math.random();
            this._scene.render();

            this.actorManager.update(0.016)

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

        await this.init()
    }
}
