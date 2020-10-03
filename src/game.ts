import { WebGame } from "./multiplayer/WebGame";
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import '@babylonjs/loaders/OBJ/index';
import {TerrainDemo} from "./TerrainDemo";
import {GameMain} from "./GameMain";

window.addEventListener('DOMContentLoaded', async () => {
    // Create the game using the 'renderCanvas'.
    let game = new GameMain('renderCanvas');

    // Start render loop.
    game.doRender();
});
