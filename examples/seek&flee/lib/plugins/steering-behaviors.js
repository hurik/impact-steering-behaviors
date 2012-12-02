/*
 * steering-behaviors
 * https://github.com/hurik/impact-steering-behaviors
 *
 * BETA
 *
 * IMPORTANT:
 * You need this plugins:
 * line-of-sight - https://github.com/hurik/impact-line-of-sight
 * vec2          - https://github.com/hurik/impact-vec2
 *
 * Andreas Giemza
 * andreas@giemza.net
 * http://www.hurik.de/
 *
 * This work is licensed under the Creative Commons Attribution 3.0 Unported License. To view a copy of this license, visit http://creativecommons.org/licenses/by/3.0/.
 *
 * Credits:
 * "Programming Game AI by Example" by Mat Buckland (http://www.jblearning.com/Catalog/9781556220784/student/)
 *
 */

ig.module(
	'plugins.steering-behaviors'
)
.requires(
	'impact.entity',
	'plugins.vec2',
	'plugins.line-of-sight'
)
.defines(function() {

SteeringBehaviorsEntity = ig.Entity.extend({
	// ---- Global settings ----
	maxForce: 500,
	// maxSpeed is limiting the vel, maxVel is not used anymore
	maxSpeed: 50,

	// ---- Steering behaviors settings ----
	// Wall Avoidance
	wallAvoidanceFeelerLenghtFactor: 4,

	// Flee
	vFleeFrom: new ig.Vec2(0, 0),

	// Seek
	vSeekTarget: new ig.Vec2(0, 0),

	// Wander
	wanderRadius: 20,
	wanderDistance: 40,
	wanderJitter: 200,

	// Get Neighbors
	getNeighborsDistance: 40,
	getNeighborsEntityType: '',


	// ---- Steering behaviors weight ----
	wallAvoidanceWeight: 20,
	fleeWeight: 5,
	seekWeight: 5,
	separationWeight: 60,
	alignmentWeight: 20,
	cohesionWeight: 1.25,
	wanderWeight: 2,


	// ---- Steering behaviors switches ----
	wallAvoidanceActive: false,
	fleeActive: false,
	seekActive: false,
	separationActive: false,
	alignmentActive: false,
	cohesionActive: false,
	wanderActive: false,


	// ---- Internal ----
	// Important variables
	vEntityCenter: new ig.Vec2(0, 0),
	vHeading: new ig.Vec2(0, -1),
	vHeadingPerp: new ig.Vec2(1, 0),
	vSteeringForce: new ig.Vec2(0, 0),
	vForce: new ig.Vec2(0, 0),

	// Wander
	vWanderTargert: new ig.Vec2(0, 0),

	// Wall Avoidance
	vWaAvOuterDistance: new ig.Vec2(0, 0),
	vWaAvFrontDistance: new ig.Vec2(0, 0),
	vWaAvUp: new ig.Vec2(0, 0),
	vWaAvDown: new ig.Vec2(0, 0),
	vWaAvOuterLeftStart: new ig.Vec2(0, 0),
	vWaAvOuterLeftEnd: new ig.Vec2(0, 0),
	vWaAvFrontLeftStart: new ig.Vec2(0, 0),
	vWaAvFrontLeftEnd: new ig.Vec2(0, 0),
	vWaAvFrontRightStart: new ig.Vec2(0, 0),
	vWaAvFrontRightEnd: new ig.Vec2(0, 0),
	vWaAvOuterRightStart: new ig.Vec2(0, 0),
	vWaAvOuterRightEnd: new ig.Vec2(0, 0),

	oWaAvCollisionsRes: new Array(4),
	sWaAvOvershoot: new Array(4),

	sWaAvBetterAvoidSide: 0,

	vWaAvLeft: new ig.Vec2(0, 0),
	vWaAvRight: new ig.Vec2(0, 0),

	// Get Neighbors
	lGeNeList: [],
	lGeNeAllEntitiesOfTypeList: [],
	oGeNeRes: null,
	sGeNeOldEntitiesCount: 0,
	sGeNeOldDistance: 0,
	sGeNeSquaredDistance: 0,

	// Seperation
	vSeVectorToNeighbor: new ig.Vec2(0, 0),

	// Cohesion
	vCoCenterOfMass: new ig.Vec2(0, 0),


	// ---- Impact options ----
	// For better collision resolution, so no entity get stucked 
	bounciness: 1,
	minBounceVelocity: 0,

	ready: function() {
		// This must be set for the first run
		this.vEntityCenter.x = this.pos.x + (this.size.x / 2);
		this.vEntityCenter.y = this.pos.y + (this.size.y / 2);

		// Create the collision data resource
		for(var i = 0; i < 4; i++) {
			this.oWaAvCollisionsRes[i] = {
				collision: false,
				x: 0,
				y: 0
			};
		}

		this.oGeNeRes = {
			collision: false,
			x: 0,
			y: 0
		};
	},

	update: function() {
		// Save the last position
		this.last.x = this.pos.x;
		this.last.y = this.pos.y;

		// Get the steering force		
		this.calculateSterringForce();

		// Update the velocity
		this.vel.x += this.vSteeringForce.x * ig.system.tick;
		this.vel.y += this.vSteeringForce.y * ig.system.tick;

		// Get the current speed
		var speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);

		// Check if it is not bigger than the maxSpeed
		if(speed > this.maxSpeed) {
			this.vel.x = this.vel.x / speed * this.maxSpeed;
			this.vel.y = this.vel.y / speed * this.maxSpeed;
		}

		// movement & collision
		var mx = this.vel.x * ig.system.tick;
		var my = this.vel.y * ig.system.tick;
		var res = ig.game.collisionMap.trace(
		this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y);
		this.handleMovementTrace(res);

		if(res.collision.x || res.collision.y) {
			ig.log('collision!');
		}

		// Update vEntityCenter
		this.vEntityCenter.x = this.pos.x + (this.size.x / 2);
		this.vEntityCenter.y = this.pos.y + (this.size.y / 2);

		// We need to recalculate it, becaused it could been truncated
		speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);

		// Update the vHeading and vHeadingPerp only when the speed is bigger than 0
		if(speed > 0) {
			// Set the vHeading, it the vel nomalized
			this.vHeading.x = this.vel.x / speed;
			this.vHeading.y = this.vel.y / speed;

			// Set the vHeadingPerp
			this.vHeadingPerp.x = -this.vHeading.y;
			this.vHeadingPerp.y = this.vHeading.x;
		}

		// Update the animation
		if(this.currentAnim) {
			this.currentAnim.update();
		}

		// Update the animation angle
		this.currentAnim.angle = this.vHeading.azimuth() + Math.PI / 2;
	},

	calculateSterringForce: function() {
		this.vSteeringForce.setNull();

		if(this.wallAvoidanceActive) {
			this.wallAvoidance();
			this.vForce.scale(this.wallAvoidanceWeight);

			if(!this.accumulateForce()) {
				return;
			}
		}

		if(this.fleeActive) {
			this.flee(this.vFleeFrom);
			this.vForce.scale(this.fleeWeight);

			if(!this.accumulateForce()) {
				return;
			}
		} else if (this.seekActive) {
			this.seek(this.vSeekTarget);
			this.vForce.scale(this.seekWeight);

			if(!this.accumulateForce()) {
				return;
			}
		} else {
			if(this.separationActive || this.alignmentActive || this.cohesionActive) {
				this.getNeighbors();

				if(this.separationActive) {
					this.seperation();
					this.vForce.scale(this.separationWeight);

					if(!this.accumulateForce()) {
						return;
					}
				}

				if(this.alignmentActive) {
					this.alignment();
					this.vForce.scale(this.alignmentWeight);

					if(!this.accumulateForce()) {
						return;
					}
				}

				if(this.cohesionActive) {
					this.cohesion();
					this.vForce.scale(this.cohesionWeight);

					if(!this.accumulateForce()) {
						return;
					}
				}
			}

			if(this.wanderActive) {
				this.wander();
				this.vForce.scale(this.wanderWeight);

				if(!this.accumulateForce()) {
					return;
				}
			}
		}
	},


	accumulateForce: function() {
		// Get the current magnitude of thevSteeringForce
		var magnitudeSoFar = this.vSteeringForce.magnitude();
		// Calculate the remaining magnitude
		var magnitudeRemaining = this.maxForce - magnitudeSoFar;

		// When nothing is left, return
		if(magnitudeRemaining <= 0.000000001) {
			return false;
		}

		// Get the magnitude of the vForceToAdd
		var magnitudeToAdd = this.vForce.magnitude();

		// Check if the magnitudeToAdd is smaller magnitudeRemaining
		if(magnitudeToAdd < magnitudeRemaining) {
			// It was smaller, only need to add vForceToAdd to vSteeringForce
			this.vSteeringForce.add(this.vForce);
		} else {
			// It was bigger, so we normalize vForceToAdd and scale it with the magnitudeRemaining
			this.vSteeringForce.add(this.vForce.normalize().scale(magnitudeRemaining));
		}

		return true;
	},

	wander: function() {
		// Add a random vector to the vWanderTarget
		this.vWanderTargert.x += (Math.random() * 2 - 1) * this.wanderJitter * ig.system.tick;
		this.vWanderTargert.y += (Math.random() * 2 - 1) * this.wanderJitter * ig.system.tick;

		// Then normalize it and scale it to the wanderRadius
		this.vWanderTargert.normalize().scale(this.wanderRadius);

		// Set vForce to the current heading, scale it wanderDistance, add the vWanderTarget and subtract the velocity
		this.vForce.set(this.vHeading).scale(this.wanderDistance).add(this.vWanderTargert).subtract(this.vel);
	},

	wallAvoidance: function() {
		outerDistance = this.size.y * (this.wallAvoidanceFeelerLenghtFactor + 1);
		frontDistance = this.size.y * this.wallAvoidanceFeelerLenghtFactor;

		// Distance vectors
		this.vWaAvOuterDistance.set(this.vHeading).scale(outerDistance);
		this.vWaAvFrontDistance.set(this.vHeading).scale(frontDistance);

		// Down vector (for the far left and far right feeler)
		this.vWaAvDown.set(this.vHeading).scale(-this.size.y / 2);

		// Up vector (for the front left and front right feeler)
		this.vWaAvUp.set(this.vHeading).scale(this.size.y / 2);

		// Outer left feeler
		this.vWaAvOuterLeftStart.set(this.vHeadingPerp).scale(-this.size.x).add(this.vWaAvDown).add(this.vEntityCenter);
		this.vWaAvOuterLeftEnd.set(this.vWaAvOuterLeftStart).add(this.vWaAvOuterDistance);

		// Front left feeler
		this.vWaAvFrontLeftStart.set(this.vHeadingPerp).scale(-this.size.x / 4).add(this.vWaAvUp).add(this.vEntityCenter);
		this.vWaAvFrontLeftEnd.set(this.vWaAvFrontLeftStart).add(this.vWaAvFrontDistance);

		// Front right feeler
		this.vWaAvFrontRightStart.set(this.vHeadingPerp).scale(this.size.x / 4).add(this.vWaAvUp).add(this.vEntityCenter);
		this.vWaAvFrontRightEnd.set(this.vWaAvFrontRightStart).add(this.vWaAvFrontDistance);

		// Outer right feeler
		this.vWaAvOuterRightStart.set(this.vHeadingPerp).scale(this.size.x).add(this.vWaAvDown).add(this.vEntityCenter);
		this.vWaAvOuterRightEnd.set(this.vWaAvOuterRightStart).add(this.vWaAvOuterDistance);

		// Check for collisions on the feelers
		ig.game.collisionMap.traceLosDetailed(this.vWaAvOuterLeftStart, this.vWaAvOuterLeftEnd, this.oWaAvCollisionsRes[0]);
		ig.game.collisionMap.traceLosDetailed(this.vWaAvFrontLeftStart, this.vWaAvFrontLeftEnd, this.oWaAvCollisionsRes[1]);
		ig.game.collisionMap.traceLosDetailed(this.vWaAvFrontRightStart, this.vWaAvFrontRightEnd, this.oWaAvCollisionsRes[2]);
		ig.game.collisionMap.traceLosDetailed(this.vWaAvOuterRightStart, this.vWaAvOuterRightEnd, this.oWaAvCollisionsRes[3]);

		if(!this.oWaAvCollisionsRes[0].collision && !this.oWaAvCollisionsRes[1].collision && !this.oWaAvCollisionsRes[2].collision && !this.oWaAvCollisionsRes[3].collision) {
			// No collision!
			this.sWaAvBetterAvoidSide = 0;

			this.vForce.setNull();
		} else {
			// Collision!
			// Calculate the overshoot
			if(this.oWaAvCollisionsRes[0].collision) {
				this.sWaAvOvershoot[0] = outerDistance - ig.Vec2.distance(this.vWaAvOuterLeftStart, this.oWaAvCollisionsRes[0]);
			}
			if(this.oWaAvCollisionsRes[1].collision) {
				this.sWaAvOvershoot[1] = this.sWaAvFrontDistance - ig.Vec2.distance(this.vWaAvFrontLeftStart, this.oWaAvCollisionsRes[1]);
			}
			if(this.oWaAvCollisionsRes[2].collision) {
				this.sWaAvOvershoot[2] = this.sWaAvFrontDistance - ig.Vec2.distance(this.vWaAvFrontRightStart, this.oWaAvCollisionsRes[2]);
			}
			if(this.oWaAvCollisionsRes[3].collision) {
				this.sWaAvOvershoot[3] = outerDistance - ig.Vec2.distance(this.vWaAvOuterRightStart, this.oWaAvCollisionsRes[3]);
			}

			// Get the biggest overshoot
			var biggestOvershoot = -999999,
				biggestOvershootFeeler;

			for(var i = 0; i < 4; i++) {
				if(this.oWaAvCollisionsRes[i].collision) {
					if(this.sWaAvOvershoot[i] > biggestOvershoot) {
						biggestOvershoot = this.sWaAvOvershoot[i];
						biggestOvershootFeeler = i;
					}
				}
			}

			if(this.oWaAvCollisionsRes[0].collision && this.oWaAvCollisionsRes[1].collision && this.oWaAvCollisionsRes[2].collision && this.oWaAvCollisionsRes[3].collision) {
				// Collision on all feelers!
				if(this.sWaAvBetterAvoidSide == 0) {
					// 1 = left, 2= right
					this.vWaAvLeft.set(this.vHeadingPerp).scale(-this.size.x * this.wallAvoidanceFeelerLenghtFactor).add(this.vEntityCenter);
					this.vWaAvRight.set(this.vHeadingPerp).scale(this.size.x * this.wallAvoidanceFeelerLenghtFactor).add(this.vEntityCenter);

					ig.game.collisionMap.traceLosDetailed(this.vEntityCenter, this.vWaAvLeft, this.oWaAvCollisionsRes[1]);
					ig.game.collisionMap.traceLosDetailed(this.vEntityCenter, this.vWaAvRight, this.oWaAvCollisionsRes[2]);

					if(!this.oWaAvCollisionsRes[1].collision && this.oWaAvCollisionsRes[2].collision) {
						// Left side free
						this.sWaAvBetterAvoidSide = 1;
					} else if(this.oWaAvCollisionsRes[1].collision && !this.oWaAvCollisionsRes[2].collision) {
						// Right side free
						this.sWaAvBetterAvoidSide = 2;
					} else {
						// Both side free
						if(biggestOvershootFeeler == 0 || biggestOvershootFeeler == 1) {
							this.sWaAvBetterAvoidSide = 2;
						} else {
							this.sWaAvBetterAvoidSide = 1;
						}
					}
				}

				this.vForce.set(this.vHeadingPerp);

				if(this.sWaAvBetterAvoidSide == 1) {
					this.vForce.scale(-biggestOvershoot);
				} else {
					this.vForce.scale(biggestOvershoot);
				}
			} else {
				this.sWaAvBetterAvoidSide = 0;

				this.vForce.set(this.vHeadingPerp);

				if(biggestOvershootFeeler == 0 || biggestOvershootFeeler == 1) {
					this.vForce.scale(biggestOvershoot);
				} else {
					this.vForce.scale(-biggestOvershoot);
				}
			}
		}
	},

	// TODO: Awfully slow ...
	getNeighbors: function() {
		// Check if there a new entites or an entity was killed
		// TODO: Must be improved because when an entity shoots for example and spawns bullets,
		//       this here get realy often processed ...
		if(ig.game.entities.lenght != this.sGeNeOldEntitiesCount) {
			// Get every entity with this type
			this.lGeNeAllEntitiesOfTypeList = ig.game.getEntitiesByType(this.getNeighborsEntityType);

			this.sGeNeOldEntitiesCount = ig.game.entities.lenght;
		}

		// Check if the distance was changed
		if(this.getNeighborsDistance != this.sGeNeOldDistance) {
			this.sGeNeSquaredDistance = this.getNeighborsDistance * this.getNeighborsDistance;

			this.sGeNeOldDistance = this.getNeighborsDistance;
		}

		// Clear the neighbors list
		this.lGeNeList = [];

		// Go through the entities
		for(var i = 0; i < this.lGeNeAllEntitiesOfTypeList.length; i++) {
			// Check if the entity is not this entity
			if(this.lGeNeAllEntitiesOfTypeList[i] != this) {
				// Check if this entity is in distance
				// For speedup we use the distance square function
				if(ig.Vec2.squaredDistance(this.vEntityCenter, this.lGeNeAllEntitiesOfTypeList[i].vEntityCenter) < this.sGeNeSquaredDistance) {
					// Now we check if the entity have a line of sight
					ig.game.collisionMap.traceLosDetailed(this.vEntityCenter, this.lGeNeAllEntitiesOfTypeList[i].vEntityCenter, this.oGeNeRes);

					if(!this.oGeNeRes.collision) {
						// Put this entity on the neighbors list
						this.lGeNeList.push(this.lGeNeAllEntitiesOfTypeList[i]);
					}
				}

			}
		}
	},

	seperation: function() {
		this.vForce.setNull();

		// Go through the neighbors
		for(var i = 0; i < this.lGeNeList.length; i++) {
			// Check if the this has not the same vEntityCenter like the other or we get an ugly devision through zero
			// This normaly only happens when the two entities are placed on the same position in weltmeister
			if(!ig.Vec2.equals(this.lGeNeList[i].vEntityCenter, this.vEntityCenter)) {
				this.vSeVectorToNeighbor.set(this.vEntityCenter).subtract(this.lGeNeList[i].vEntityCenter);

				var magnitude = this.vSeVectorToNeighbor.magnitude();

				this.vSeVectorToNeighbor.normalize().scale(1 / magnitude)

				this.vForce.add(this.vSeVectorToNeighbor);
			}
		}
	},

	alignment: function() {
		this.vForce.setNull();

		// Go through the neighbors
		for(var i = 0; i < this.lGeNeList.length; i++) {
			this.vForce.add(this.lGeNeList[i].vHeading);
		}

		if(this.lGeNeList.length > 0) {
			this.vForce.scale(1 / this.lGeNeList.length).subtract(this.vHeading);
		}
	},

	cohesion: function() {
		this.vCoCenterOfMass.setNull();

		// Go through the neighbors
		for(var i = 0; i < this.lGeNeList.length; i++) {
			this.vCoCenterOfMass.add(this.lGeNeList[i].vEntityCenter);
		}

		if(this.lGeNeList.length > 0) {
			this.vCoCenterOfMass.scale(1 / this.lGeNeList.length);

			this.seek(this.vCoCenterOfMass);
		}
	},

	seek: function(targetPos) {
		this.vForce.set(targetPos).subtract(this.vEntityCenter).normalize().scale(this.maxSpeed).subtract(this.vel);
	},

	flee: function(targetPos) {
		this.vForce.set(this.vEntityCenter).subtract(targetPos).normalize().scale(this.maxSpeed).subtract(this.vel);
	}
});

});
