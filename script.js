

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

// Particle object.
function Particle(x,y,r) {
  this.orientation = Math.PI;
  this.position = {x,y};
  this.r = r;

  // Rotation functions
  function rotateTo(rad) {
    this.r = rad;
  }
  function rotateBy(rad) {
    this.r += rad;
  }

  // Movement functions
  function moveBy(dx,dy) {
    this.x += x;
    this.y += y;
  }
  function moveTo(x,y) {
    this.x = x;
    this.y = y;
  }

  // Rendering function
  function render() {
    return ellipse(this.position.x, this.position.y, this.r, this.r)
  }

  // Object
  return {
    position: this.position,
    r,
    rotateTo,
    rotateBy,
    moveTo,
    moveBy,
    render
  }
}

// GLOBAL VARIABLES
const numParticles = 50
const r = 50;
const initialPos = {x: midX-r/2, y: midY-r/2 }
// Declare the particles once.
const particles = Array(numParticles).fill(0).map(n => Particle(initialPos.x, initialPos.y, r))


// MAIN LOOP
function draw() {
  background(0)
  const jiggle = sin(frameCount/20);

  particles.forEach((p,i) => {
    const {x,y} = p.position
    p.position = { x: x+(jiggle*i/10), y: y+(jiggle*i/10)}
    p.r = p.r + jiggle * i/20
    p.render()
  })
}