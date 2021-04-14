import * as THREE from "three";

export class PushSwapLine extends THREE.Mesh{

    constructor(width, height, color=0xffff00) {
        const geometry = new THREE.PlaneGeometry( width, height, 32);
        const material = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );
        super(geometry, material)
    }
}