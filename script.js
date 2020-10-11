

/*
from original paper

At each execution step of the scheduler, every agent attempts to move forward one step in the current direction.

for p in particles {
  p.tryMoveForward()
}

After every agent has attempted to move, the entire population performs its sensory behavior

for p in particles {
  // Record whether the attempt is successful
  p.senseNeighbors()
  if(p.hasSpotAvailable) {
    p.moveToSpot()
    p.deposit(chemoattractant)
  } else {
    p.stay()
    p.orientation = orientation.random()
  }
}

If the movement is successful (i.e., if the next site is not occupied) the agent moves to the
new site and deposits a constant chemoattractant value.

if there's actual space available in the movement step, you have SUCCEEDED.



If the movement is not successful, the agent
remains in its current position, no chemoattractant is deposited, and a new orientation is randomly selected. Agents are selected from the population randomly in the motor and sensory stages to avoid the
possibility of long term bias by sequential ordering. The agent both deposits to and senses from the trail
map, resulting in an autocrine mode of stimulus/response. 


*/ 

// particle
// has: sensor distance (SD)
// sensor angle (SA)
// heading angle particle is faced towards
// location (x,y)

//rotation posibilities
// none 
// turn randomly
// turn right (by RA)
// turn left (by RA)

// move by StA (Step amount)
// deposite
// diffuse 
// decay

//LAYERS:
// DATA LAYER
// TRAIL LAYER

// CANVAS SETUP
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const midX =  WIDTH/2
const midY = HEIGHT/2

function setup() {
  createCanvas(WIDTH,HEIGHT)
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
  function attemptMoveForward(stepAmount) {
    return {
      x: this.position.x + stepAmount * Math.cos(this.orientation),
      y: this.position.y + stepAmount * Math.sin(this.orientation)
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
    attemptMoveForward,
    draw
  }
}

// GLOBAL VARIABLES
const numParticles = 50
const r = 10;
const initialPos = {x: midX-r/2, y: midY-r/2 }

const numParticleArr = Array(numParticles).fill(0);

// Declare the particles once.
const particles = numParticleArr.map(n => Particle(initialPos.x, initialPos.y, r))

// Stores the particles and their positions.
const dataMap = {
  particles
}

// convert between screen coordinates and grid coorindates to be able to query the trail map easily

const rotateAmount = Math.PI/4;
const stepAmount = Math.max(WIDTH,HEIGHT)*0.01;
const decayAmount = 0.1;

const sensorAngle = Math.PI/4;
// offset in number of grid units.
const sensorOffset = 1;

// Affect how the trail disperses
const avgWeight = 1;

// How much each particle drops on the trail map when it successfully moves. 
const deposit = 5;

const trailMap = {
  // Stores  deposit data and is read from
  // Initialize with an nxn array of values.
  data: numParticleArr.map(n => [...numParticleArr]) 
}

console.log(dataMap)
console.log(particles[0])
console.log(trailMap)

function depositTrail(x,y) {
}

// MAIN LOOP
function draw() {
  background(0)
  const jiggle = sin(frameCount/20);

  // MOTOR STAGE 
  particles.forEach((p,i) => {
    const attemptPos = p.attemptMoveForward(stepAmount)
    const movedForward = true;
    if(movedForward) {
      depositTrail(attemptPos.x, attemptPos.y)
    } else {
      // Choose a random orientation
      p.rotateTo(Math.random()*Math.PI*2);
    }
  })

  // SENSORY STAGE
  particles.forEach((p,i) => {
    // check if there's already another particle in that attempt position...
    // how do you easily check the positions of other particles in the grid?
    // maybe the grid should store whether there's a particle in it?

    // Finally, after its done sensing, draw
    p.draw()
  })
}