
class VoxelShader extends Shader{
    
    constructor(volume, boundingBoxX, boundingBoxY, samples){ // UInt16Array
        super("voxel_vert", "voxel_frag")
        this.texture = new THREE.Data3DTexture(volume.voxels, volume.width, volume.height, volume.depth);
        this.texture.type = THREE.FloatType;
        this.texture.format = THREE.RedFormat;
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.unpackAlignment = 1;


        this.texture.needsUpdate = true;
        this.setUniform("map", this.texture);
        this.setUniform("boundingBox", [
            boundingBoxX,
            boundingBoxY
        ], "v3v");
        this.setUniform("cameraPos", new THREE.Vector3(0,0,0));
        this.setUniform("samples", samples);
        this.setUniform("isoSurfacesColor", []);
        this.setUniform("isoSurfacesData", []);
        this.setUniform("usedIsoSurfaces", 0);
        this.setUniform("lightColor", new THREE.Vector3(0.75,0.75,0.75));
        this.setUniform("ambientColor", new THREE.Vector3(0.005, 0.005, 0.005));
    }
    updateCam(cameraPos) {
        this.material.uniforms.cameraPos.value.copy(cameraPos);
    }
    updateIsoSurfaces(surfaces){
        let surfaceData = [];
        let surfaceColors = [];
        for(let i = 0; i < 5; i++){
            surfaceData[i] = new THREE.Vector3(0,0,0)
            if(surfaces[i] !== undefined){
                surfaceData[i].x = surfaces[i].iso;
                surfaceData[i].y = surfaces[i].opacity;
                surfaceColors[i] = surfaces[i].color;
            }else{
                surfaceData[i].x = 0.5;
                surfaceData[i].y = 1.0;
                surfaceColors[i] = new THREE.Vector3(1.0,1.0,1.0);
            }
        }

        this.material.uniforms.isoSurfacesColor.value = surfaceColors;
        this.material.uniforms.isoSurfacesData.value = surfaceData;
        this.material.uniforms.usedIsoSurfaces.value = surfaces.length;
    }
}