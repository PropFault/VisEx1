/**
 * Vis 1 Task 1 Framework
 * Copyright (C) TU Wien
 *   Institute of Visual Computing and Human-Centered Technology
 *   Research Unit of Computer Graphics
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are not permitted.
 *
 * Main script for Vis1 exercise. Loads the volume, initializes the scene, and contains the paint function.
 *
 * @author Manuela Waldner
 * @author Laura Luidolt
 * @author Diana Schalko
 */
let renderer, camera, scene, orbitCamera;
let canvasWidth, canvasHeight = 0;
let container = null;
let volume = null;
let fileInput = null;
let testShader = null;
let voxelShader = null;
let editor = null;

/**
 * Load all data and initialize UI here.
 */
function init() {
    // volume viewer
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.7;
    canvasHeight = window.innerHeight * 0.7;

    // WebGL renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( canvasWidth, canvasHeight );
    container.appendChild( renderer.domElement );

    // read and parse volume file
    fileInput = document.getElementById("upload");
    fileInput.addEventListener('change', readFile);

    editor = new Editor(paint);
    editor.drawEditor();
}

/**
 * Handles the file reader. No need to change anything here.
 */
function readFile(){
    let reader = new FileReader();
    reader.onloadend = function () {
        console.log("data loaded: ");

        let data = new Uint16Array(reader.result);
        volume = new Volume(data);
        

        resetVis();
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

/**
 * Construct the THREE.js scene and update histogram when a new volume is loaded by the user.
 *
 * Currently renders the bounding box of the volume.
 */
async function resetVis(){

    editor.updateHistogram();

    // create new empty scene and perspective camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, canvasWidth / canvasHeight, 0.1, 1000 );

    const boxDimen = new THREE.Vector3(volume.width, volume.height, volume.depth) ;
    const cube = new THREE.BoxGeometry(boxDimen.x, boxDimen.y, boxDimen.z);
    voxelShader = new VoxelShader(volume, 
            new THREE.Vector3(-boxDimen.x / 2.0, -boxDimen.y / 2.0, -boxDimen.z / 2.0), 
            new THREE.Vector3(boxDimen.x / 2.0, boxDimen.y / 2.0, boxDimen.z / 2.0),
            500);

    const material = voxelShader.material;
    await voxelShader.load(); // this function needs to be called explicitly, and only works within an async function!
    const mesh = new THREE.Mesh(cube, material);
    scene.add(mesh);

    // our camera orbits around an object centered at (0,0,0)
    orbitCamera = new OrbitCamera(camera, new THREE.Vector3(0,0,0), 2*Math.max(boxDimen.x,boxDimen.y, boxDimen.z), renderer.domElement);

    // init paint loop
    requestAnimationFrame(paint);
}
/**
 * Render the scene and update all necessary shader information.
 */
function paint(){
    if (volume) {
        let surfaces = editor.getSurfaces();

        voxelShader.updateCam(camera.position);
        voxelShader.updateIsoSurfaces(surfaces);

        renderer.render(scene, camera);
    }
}
