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
        this.setUniform("iso", 0.5);
        this.setUniform("objectColor", new THREE.Vector3(1,1,1));
        this.setUniform("lightColor", new THREE.Vector3(0.75,0.75,0.75));
        this.setUniform("ambientColor", new THREE.Vector3(0.005, 0.005, 0.005));
    }
    updateCam(cameraPos) {
        this.material.uniforms.cameraPos.value.copy(cameraPos);
    }
    updateIso(iso){
        this.material.uniforms.iso.value = iso
    }
    updateObjectColor(color) {
        this.material.uniforms.objectColor.value.copy(color);
    }
}