import * as THREE from "three"
import {PushSwapLine} from "./line";
import {PushSwapAnimationStacks} from "./PushSwapAnimationStacks";
import * as dat from "dat.gui"

export class PushSwapApp{

    constructor(pushSwapData, documentElement) {
        this.pushSwapData = pushSwapData
        this.documentElement = documentElement;

        const styles = window.getComputedStyle(documentElement)
        this.width = parseInt(styles.width, 10);
        this.height = parseInt(styles.height, 10);

        this.widthSection = 3
    }

    setWidthSection(width){
        this.widthSection = width
    }

    init(){

        // Initialization canvas
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.width, this.height);
        this.documentElement.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 500 );
        this.camera.position.set( 0, 0, 100 );
        this.camera.lookAt( 0, 0, 0 );
        this.scene = new THREE.Scene();

        // Define the order
        const numbersArr = this.pushSwapData.numbers
        const sortedNumbers = numbersArr.slice().sort((a,b)=> {return (a-b)})

        const orderMap = new Map()
        for (let i = 0; i < sortedNumbers.length; i++) {
            orderMap.set(sortedNumbers[i], i + 1)
        }

        // GUI panel for debug
        //const gui = new dat.GUI();

        const mixers = []
        const heightLine = (this.width / 2) / numbersArr.length
        const beginPositionY = this.width / 4
        const beginPositionX = this.height / 4
        let color = 0xdc0200
        for (let i = 0; i < numbersArr.length; i++) {
            const line = new PushSwapLine((orderMap.get(numbersArr[i]) * this.widthSection), heightLine, color)
            line.position.setY(beginPositionY - heightLine * i)
            line.position.setX(beginPositionX)
            //gui.add(line.position, "y")
            this.scene.add(line)
            mixers.push(new THREE.AnimationMixer(line))
            color += 10000
        }
        this.camera.position.z = 300;
        this.stacks = new PushSwapAnimationStacks(mixers, this.width, this.height, heightLine)
    }

    run(){
        const renderer = this.renderer
        const scene = this.scene
        const camera = this.camera
        const stacks = this.stacks

        const commands = this.pushSwapData.commands

        const clock = new THREE.Clock();

        //const commands = ['ra', 'rra', 'ra', 'rra', 'ra', 'rra', 'ra', 'ra', 'ra', 'rra']
        //const commands = ['rra', 'rra', 'rra', 'rra', 'rra', 'rra', 'rra', 'rra', 'rra', 'rra']
        //const commands = ['pb', 'pb', 'pb', 'pb', 'rrb', 'rrb']

        let indexCmd = 0
        function animate() {

            const delta = clock.getDelta();

            if (!stacks.haveRunningActions() && indexCmd < commands.length){
                stacks.execute(commands[indexCmd])
                indexCmd += 1
            }

            stacks.update(delta)

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();
    }
}