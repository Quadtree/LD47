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
        console.log(`loaded ground2=${ground2.name}`);

        for (const child of ground2.getChildMeshes()){
            let marker = false;
            if (child.name == "RedCardConsole"){
                console.log("Found RedCardConsole")
                this.actorManager.add(new CardConsole(child.position, this._scene, CardConsoleColor.Red));
                marker = true;
            }
            if (child.name == "GreenCardConsole"){
                console.log("Found GreenCardConsole")
                this.actorManager.add(new CardConsole(child.position, this._scene, CardConsoleColor.Green));
                marker = true;
            }
            if (child.name == "BlueCardConsole"){
                console.log("Found BlueCardConsole")
                this.actorManager.add(new CardConsole(child.position, this._scene, CardConsoleColor.Blue));
                marker = true;
            }
            if (child.name == "ExitDoor"){
                this.actorManager.add(new ExitDoor(child.position));
                marker = true;
            }

            if (marker){
                child.dispose();
            }
        }

        ground2.physicsImpostor = new PhysicsImpostor(ground2, PhysicsImpostor.MeshImpostor, {mass: 0}, this._scene);

        EnemySpawnPoint.respawnAll(this.actorManager);
    }

    createHeightmapTerrain():Promise<string> {
        return new Promise<string>((res, rej) => {
            let ground2 = MeshBuilder.CreateGroundFromHeightMap("noise", "assets/some_noise.png", {
                width: 512,
                height: 512,
                subdivisions: 256,
                maxHeight: 10,

                onReady: () => {
                    console.log('reeeedddaaaaahhh')
                    ground2.physicsImpostor = new PhysicsImpostor(ground2, PhysicsImpostor.MeshImpostor, {mass: 0}, this._scene)

                    ground2.physicsImpostor.executeNativeFunction((world:any, physicsBody:any) => {
                        console.log(world);
                        console.log(physicsBody);
                    });

                    ground2.checkCollisions = true
                    ground2.isPickable = true
                    ground2.receiveShadows = true
                    ground2.freezeWorldMatrix()
                    this.shadowGenerator.addShadowCaster(ground2)
                    console.log('we dun')
                    res();
                }
            }, this._scene);
        });

    }

    createBox(vec3:Vector3, mass:number = 0){
        const playerMesh = MeshBuilder.CreateBox('A BOX', {width:1, height:1, depth:1})
        playerMesh.physicsImpostor = new PhysicsImpostor(playerMesh, PhysicsImpostor.BoxImpostor, {mass: mass}, this._scene);
        playerMesh.position = vec3
    }

    setupPhysicsViewer(){
        var physicsViewer = new PhysicsViewer(this._scene);

        const showImposters = (mesh:AbstractMesh) =>{
            for(let cm of mesh.getChildMeshes()){
                showImposters(cm);
            }

            if (mesh.physicsImpostor) {
                console.log(`showing imposters for ${mesh.name}`);
                physicsViewer.showImpostor(mesh.physicsImpostor, mesh as any);
                //mesh.visibility = 0;
            } else {
                console.log(`NOT showing imposters for ${mesh.name}`);
            }
        }

        this._scene.meshes.forEach(showImposters);
    }

    async doRender() {
        // Run the render loop.
        this._engine.runRenderLoop(() => {
            //this.sphere.position.y = 4 + Math.random();
            this._scene.render();

            this.actorManager.update(0.016)

            //console.log(`mesh count ${this._scene.meshes.length}`);
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });

        await this.init()
    }
}
