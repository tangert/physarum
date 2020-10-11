/*
FROM ORIGINAL PAPER

At each execution step of the scheduler, every agent attempts to move forward one step in the current direction.

After every agent has attempted to move, the entire population performs its sensory behavior

If the movement is successful (i.e., if the next site is not occupied) the agent moves to the
new site and deposits a constant chemoattractant value.

If the movement is not successful, the agent
remains in its current position, no chemoattractant is deposited, and a new orientation is randomly selected. Agents are selected from the population randomly in the motor and sensory stages to avoid the
possibility of long term bias by sequential ordering. The agent both deposits to and senses from the trail
map, resulting in an autocrine mode of stimulus/response. 
*/ 

// CANVAS SETUP
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const midX =  WIDTH/2
const midY = HEIGHT/2

function setup() {
  frameRate(30);
  createCanvas(WIDTH,HEIGHT)
  background(0)
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Particle object.
function Particle(x,y,r) {
  this.id = uuidv4();
  this.orientation = Math.PI;
  this.position = {x,y};
  this.r = r;

  // Rotation functions
  function rotateTo(rad) {
    this.orientation = rad;
  }

  function rotateBy(rad) {
    this.orientation += rad;
  }

  // Scaling functions
  function scaleTo(radius) {
    this.r = radius
  }

  function scaleBy(scale) {
    this.r *= scale 
  }
  
  // Movement functions
  // Used for checking attempts without actually moving the particle.
  function getMoveForward(stepAmount, at) {
    return {
      x: this.position.x + stepAmount * Math.cos(at || this.orientation),
      y: this.position.y + stepAmount * Math.sin(at || this.orientation)
    }
  }

  // Moves by a specific dx and dy at the given orientation
  function moveBy(dx,dy) {
    this.position.x += dx * Math.cos(this.orientation);
    this.position.y += dy * Math.sin(this.orientation);
  }

  function moveTo(x,y) {
    this.position.x = x;
    this.position.y = y;
  }

  // Main rendering function
  function draw() {
    return ellipse(this.position.x, this.position.y, this.r, this.r)
  }

  // Object
  return {
    id,
    position,
    orientation,
    r,
    rotateTo,
    rotateBy,
    scaleTo,
    scaleBy,
    moveTo,
    moveBy,
    getMoveForward,
    draw
  }
}

// GLOBAL VARIABLES
const numParticles = 100;
const r = 2;
const initialPos = {x: midX-r/2, y: midY-r/2 }

function getRandomOrientation() {
  return Math.random()*Math.PI*2
}
function getRandomPosition() {
  return {x: Math.random()*WIDTH, y: Math.random()*HEIGHT}
}

const numParticleArr = Array(numParticles).fill(0);

// Declare the particles once.
const particles = numParticleArr.map(n =>{
  const {x,y} = getRandomPosition();
  return Particle(x, y, r)
})

// convert between screen coordinates and grid coorindates to be able to query the trail map easily
// 22.5 degrees
const rotateAmount = Math.PI/4;
const percent = (num) => Math.max(WIDTH,HEIGHT)*(num/100)
const stepAmount = percent(1)
const decayAmount = 0.1;

const sensorAngle = Math.PI/4;
// offset in number of grid units.
const sensorOffset = 1;

// Affect how the trail disperses
const avgWeight = 1;

// How much each particle drops on the trail map when it successfully moves. 
const depositAmount = 5;

const trailMap = numParticleArr.map(n => numParticleArr.map(n => {
    return {
      occupied: false,
      value: 0 
    }
  })
);

const xLength = trailMap.length
const yLength = trailMap[0].length

// What does depositing onto the trail do?
// get the pixel value of the deposit cell  by multiplying its position in the 2d array by the width/height
function gridToScreen(x,y) {
  const xScale = x/xLength
  const yScale = y/yLength
  const xPos = xScale*WIDTH
  const yPos = yScale*HEIGHT
  return {x: xPos, y: yPos }
}

function screenToGrid(x,y) {
  const xScale = x/WIDTH;
  const yScale = y/HEIGHT;
  // Need to round because you can only index by integers
  const xPos = Math.floor(xScale*yLength)
  const yPos = Math.floor(yScale*yLength);
  return {x: xPos, y: yPos }
}

// Checks if a pair of coordinates is in bounds in the trail map
function inBounds(x,y) {
  return (
       x >= 0 &&
       y < yLength && 
       y >= 0 &&  
       x < xLength
  );
}

// MAIN LOOP
function draw() {
  background(0);

  for(let i = 0; i < particles.length; i++) {
    const p = particles[i]
    // MOTOR STAGE 
    const currGridPos = screenToGrid(p.position.x, p.position.y)
    const curr = trailMap[currGridPos.x][currGridPos.y]
    // const stepJiggle = sin(frameCount/10)+0.5
    const stepJiggle = 1

    // Attempt to move forward
    const attemptPos = p.getMoveForward(stepAmount*stepJiggle)
    const nextGridPos = screenToGrid(attemptPos.x, attemptPos.y)

    // First, check if it's in bounds
    if(inBounds(nextGridPos.x, nextGridPos.y)){
      const next = trailMap[nextGridPos.x][nextGridPos.y]
      // you can move forward if that grid cell hasn't been occupied yet!
      // have to handle out of bounds errors...
      // want particles to go to random position
      if(!next.occupied) {
        // Deposit the ammount
        next.value += depositAmount;
        // set current spot to open
        curr.occupied = false;
        // set the next spot (which you are about to move to) to occupied
        next.occupied = true;
        // move the particle
        p.moveTo(attemptPos.x, attemptPos.y)
      } else {
        // Choose a random orientation
        p.rotateTo(getRandomOrientation());
      }

    } else {

      // If you  are about to go out of bounds, bounce off.
      p.rotateBy(Math.PI)
    }

      // These are essentialy samples from the trail map of a given size (SW, sensor width) and at a given diistance (SO, sensor offset)

    // SENSORY STAGE 
    const Fpos = p.getMoveForward(sensorOffset)
    const FposGrid = screenToGrid(Fpos.x, Fpos.y)

    const FLpos = p.getMoveForward(sensorOffset, p.orientation - sensorAngle);
    const FLposGrid = screenToGrid(FLpos.x, FLpos.y)

    const FRpos = p.getMoveForward(sensorOffset, p.orientation + sensorAngle);
    const FRposGrid = screenToGrid(FRpos.x, FRpos.y)

    // Make sure all the sensors  are also inbounds. 
    if(inBounds(FposGrid.x, FposGrid.y) && 
       inBounds(FLposGrid.x, FLposGrid.y) && 
       inBounds(FRposGrid.x, FRposGrid.y)) {
         
        const F = trailMap[FposGrid.x][FposGrid.y].value
        const FL = trailMap[FLposGrid.x][FLposGrid.y].value
        const FR = trailMap[FRposGrid.x][FRposGrid.y].value

        if(F > FL && F > FR) {
          // stay facing  same direction
          continue;
        } else if (F < FL && F < FR) {
          //rotate randomly left or right by rotateAmount
          if(Math.random() > 0.5) {
            p.rotateBy(-rotateAmount)
          } else {
            p.rotateBy(rotateAmount)
          }
        } else if( FL < FR) {
          // rotate right by RA 
          p.rotateBy(rotateAmount)
        } else if( FR < FL) {
          // rotate left by RA
          p.rotateBy(-rotateAmount)
        }
    } else {
      // Otherwise hit a wall, turn around
      p.rotateBy(Math.PI)
    }
    // Finally, after its done sensing, draw the particle
    fill(255)
    p.draw()
  }

  // Diffuse and decay the trail map
  for(let r = 0; r < trailMap.length; r++) {
    const row = trailMap[r]
    for(let c = 0; c < trailMap[r].length; c++) {
      const point = trailMap[r][c]
      const screenPoint = gridToScreen(r,c)
      trailMap[r][c].value -= (trailMap[r][c].value * decayAmount)
      let trailColor = color(255);
      trailColor.setAlpha(trailMap[r][c].value)
      fill(trailColor)
      ellipse(screenPoint.x, screenPoint.y, 2.5, 2.5)
    }
  }
}