import * as THREE from "three"

export class PushSwapAnimationStacks {
    constructor(mixers, width, height, heightLine) {
        this.a = mixers
        this.b = []
        this.actionsQueue = []
        this.animationDuration = 2
        this.width = width
        this.positionA = {x :-(width / 4), y: height / 4 }
        this.positionB = {x :(width / 4), y: height / 4 }
        this.heightLine = heightLine
    }

    update(delta){
        this.a.forEach(mixer => mixer.update(delta))
        this.b.forEach(mixer => mixer.update(delta))
    }

    animateRA(){
        if (this.a.length === 0)
            return
        this.moveLineStackToPositionAnimation(this.a[0], this.a[this.a.length - 1].getRoot().position)
        this.scrollStackAnimation(this.a, 1)
        this.a.push(this.a.shift())
    }

    animateRB(){
        if (this.b.length === 0)
            return

        const mask = [
            0, 0, 0,
            10, 0, 0,
            10, 0, 0,
            0, 0, 0
        ]

        this.moveLineStackToPositionAnimation(
            this.b[0],
            this.b[this.b.length - 1].getRoot().position,
            undefined,
            mask
        )

        this.scrollStackAnimation(this.b, 1)
        this.b.push(this.b.shift())
    }

    animateRRA(){
        if (this.a.length === 0)
            return

        const mask = [
            0, 0, 0,
            -10, 0, 0,
            -10, 0, 0,
            0, 0, 0
        ]

        this.moveLineStackToPositionAnimation(
            this.a[this.a.length - 1],
            this.a[0].getRoot().position,
            undefined,
            mask
        )

        this.scrollStackAnimation(this.a, undefined, this.a.length - 1, -this.heightLine)
        this.a.unshift(this.a.pop())
    }

    animateRRB(){
        if (this.b.length === 0)
            return

        const mask = [
            0, 0, 0,
            10, 0, 0,
            10, 0, 0,
            0, 0, 0
        ]

        this.moveLineStackToPositionAnimation(
            this.b[this.b.length - 1],
            this.b[0].getRoot().position,
            undefined,
            mask
        )

        this.scrollStackAnimation(this.b, undefined, this.b.length - 1, -this.heightLine)
        this.b.unshift(this.b.pop())
    }

    animatePA(){
        if (this.b.length === 0)
            return

        const mask = [
            0, 0, 0,
            0, this.heightLine, 0,
            this.width / 2, this.heightLine, 0,
            this.width / 2, 0, 0
        ]

        this.moveLineStackToPositionAnimation(
            this.b[0],
            this.b[0].getRoot().position,
            undefined,
            mask
        )

        this.scrollStackAnimation(this.a, undefined, undefined, -this.heightLine)
        this.scrollStackAnimation(this.b, 1, undefined)
        this.a.unshift(this.b.shift())
    }

    animatePB(){
        if (this.a.length === 0)
            return

        const mask = [
            0, 0, 0,
            0, 5, 0,
            - this.width / 2, 5, 0,
            - this.width / 2, 0, 0
        ]

        this.moveLineStackToPositionAnimation(
            this.a[0],
            this.a[0].getRoot().position,
            undefined,
            mask
        )

        this.scrollStackAnimation(this.b, undefined, undefined, -this.heightLine)
        this.scrollStackAnimation(this.a, 1, undefined)
        this.b.unshift(this.a.shift())
    }

    animateRR(){
        this.animateRA()
        this.animateRB()
    }

    animateRRR(){
        this.animateRRA()
        this.animateRRB()
    }

    execute(command){
        switch (command){
            case 'ra':  this.animateRA(); break
            case 'rb':  this.animateRB(); break
            case 'rra': this.animateRRA(); break
            case 'rrb': this.animateRRB(); break
            case 'rr':  this.animateRR(); break
            case 'rrr': this.animateRRR(); break
            case 'pa':  this.animatePA(); break
            case 'pb':  this.animatePB(); break
        }
    }

    haveRunningActions(){
        const indexesForDelArr = []

        for (let i = 0; i < this.actionsQueue.length; i++) {
            const currentAction = this.actionsQueue[i]
            if (!currentAction.isRunning()) {
                indexesForDelArr.push(i)
                const line = currentAction.getMixer().getRoot()
                const positionDump = line.position.clone()
                currentAction.stop()
                line.position.copy(positionDump)
            }
        }
        while (indexesForDelArr.length > 0){
            this.actionsQueue.splice(indexesForDelArr.pop(), 1)
        }
        return this.actionsQueue.length !== 0
    }

    createAction(times, values, mixer){
        const newPositionKF = new THREE.VectorKeyframeTrack(".position", times, values)
        const newTestAnimationClip = new THREE.AnimationClip("test animation", -1, [newPositionKF])
        const newAction = mixer.clipAction(newTestAnimationClip)
        newAction.loop = THREE.LoopOnce
        newAction.clampWhenFinished = true
        newAction.play()
        this.actionsQueue.push(newAction)
    }

    // attention shift!!!
    scrollStackAnimation(stack, indexFrom= 0, indexTo = -1, shift = this.heightLine, times = [0, this.animationDuration]){
        let terminateIndex = stack.length;
        if (indexTo !== -1 && indexTo < terminateIndex){
            terminateIndex =  indexTo
        }
        for (let i = indexFrom; i < terminateIndex; i++) {
            const mixer = stack[i]
            const line = mixer.getRoot()
            const values = [
                line.position.x, line.position.y, line.position.z,
                line.position.x, line.position.y + shift, line.position.z
            ]
            this.createAction(times, values, mixer)
        }
    }

    moveLineStackToPositionAnimation(
        mixerLineStack,
        position,
        times = [0, 0.5, 1.5, 2],
        mask = [0, 0, 0,  -10, 0, 0,  -10, 0, 0,  0, 0, 0],
        direction = 'down'
        ){
        const line = mixerLineStack.getRoot()
        const values = [
            line.position.x + mask[0], line.position.y + mask[1], line.position.z + mask[2],
            line.position.x + mask[3], line.position.y + mask[4], line.position.z + mask[5],
            line.position.x + mask[6], position.y + mask[7], line.position.z + mask[8],
            line.position.x + mask[9], position.y + mask[10], line.position.z + mask[11]
        ]
        this.createAction(times, values, mixerLineStack)
    }
}