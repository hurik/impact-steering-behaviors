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

ig.Entity.inject({
	// ---- Global settings ----
	maxForce: 500,
	// maxSpeed is limiting the vel, maxVel is not used anymore
	maxSpeed: 50,


	// ---- Steering behaviors settings ----
	// Wall Avoidance
	wallAvoidanceFeelerLenghtFactor: 4,

	// Wander
	wanderRadius: 20,
	wanderDistance: 40,
	wanderJitter: 200,

	// Get Neighbors
	getNeighborsDistance: 40,
	getNeighborsEntityType: '',


	// ---- Steering behaviors weight ----
	wallAvoidanceWeight: 10,
	separationWeight: 50,
	alignmentWeight: 20,
	cohesionWeight: 1,
	wanderWeight: 2,


	// ---- Steering behaviors switches ----
	wallAvoidanceActive: false,
	separationActive: false,
	alignmentActive: false,
	cohesionActive: false,
	wanderActive: false,


	// ---- Internal ----
	// Important variables
	vEntityCenter: new ig.Vec2(0, 0),
	vHeading: new ig.Vec2(0, -1),
	vHeadingPerp: new ig.Vec2(1, 0),

	// Wander internal
	vWanderTargert: new ig.Vec2(0, 0),

	// Wall Avoidance internal
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

	// Get Neighbors internal
	lGeNeList: [],
	lGeNeAllEntitiesOfTypeList: [],
	oGeNeRes: null,
	sGeNeOldEntitiesCount: 0,
	sGeNeOldDistance: 0,
	sGeNeSquaredDistance: 0,

	// Seperation internal
	vSeVectorToNeighbor: new ig.Vec2(0, 0),


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
		var acceleration = this.calculateSterringForce();

		// Update the velocity
		this.vel.x += acceleration.x * ig.system.tick;
		this.vel.y += acceleration.y * ig.system.tick;

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
		var vSteeringForce = new ig.Vec2(0, 0),
			vForce = new ig.Vec2(0, 0);

		if(this.wallAvoidanceActive) {
			this.wallAvoidance(vForce);
			vForce.scale(this.wallAvoidanceWeight);

			if(!this.accumulateForce(vSteeringForce, vForce)) {
				return vSteeringForce;
			}
		}

		if(this.separationActive || this.alignmentActive || this.cohesionActive) {
			this.getNeighbors();

			if(this.separationActive) {
				this.seperation(vForce);
				vForce.scale(this.separationWeight);

				if(!this.accumulateForce(vSteeringForce, vForce)) {
					return vSteeringForce;
				}
			}

			if(this.alignmentActive) {
				this.alignment(vForce);
				vForce.scale(this.alignmentWeight);

				if(!this.accumulateForce(vSteeringForce, vForce)) {
					return vSteeringForce;
				}
			}

			if(this.cohesionActive) {
				this.cohesion(vForce);
				vForce.scale(this.cohesionWeight);

				if(!this.accumulateForce(vSteeringForce, vForce)) {
					return vSteeringForce;
				}
			}
		}

		if(this.wanderActive) {
			this.wander(vForce);
			vForce.scale(this.wanderWeight);

			if(!this.accumulateForce(vSteeringForce, vForce)) {
				return vSteeringForce;
			}
		}

		return vSteeringForce;
	},


	accumulateForce: function(vSteeringForce, vForceToAdd) {
		// Get the current magnitude of thevSteeringForce
		var magnitudeSoFar = vSteeringForce.magnitude();
		// Calculate the remaining magnitude
		var magnitudeRemaining = this.maxForce - magnitudeSoFar;

		// When nothing is left, return
		if(magnitudeRemaining <= 0.000000001) {
			return false;
		}

		// Get the magnitude of the vForceToAdd
		var magnitudeToAdd = vForceToAdd.magnitude();

		// Check if the magnitudeToAdd is smaller magnitudeRemaining
		if(magnitudeToAdd < magnitudeRemaining) {
			// It was smaller, only need to add vForceToAdd to vSteeringForce
			vSteeringForce.add(vForceToAdd);
		} else {
			// It was bigger, so we normalize vForceToAdd and scale it with the magnitudeRemaining
			vSteeringForce.add(vForceToAdd.normalize().scale(magnitudeRemaining));
		}

		return true;
	},

	wander: function(vForce) {
		// Add a random vector to the vWanderTarget
		this.vWanderTargert.x += (Math.random() * 2 - 1) * this.wanderJitter * ig.system.tick;
		this.vWanderTargert.y += (Math.random() * 2 - 1) * this.wanderJitter * ig.system.tick;

		// Then normalize it and scale it to the wanderRadius
		this.vWanderTargert.normalize().scale(this.wanderRadius);

		// Set vForce to the current heading, scale it wanderDistance, add the vWanderTarget and substract the velocity
		vForce.set(this.vHeading).scale(this.wanderDistance).add(this.vWanderTargert).subtract(this.vel);
	},

	wallAvoidance: function(vForce) {
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

			vForce.setNull();
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

				vForce.set(this.vHeadingPerp);

				if(this.sWaAvBetterAvoidSide == 1) {
					vForce.scale(-biggestOvershoot);
				} else {
					vForce.scale(biggestOvershoot);
				}
			} else {
				this.sWaAvBetterAvoidSide = 0;

				vForce.set(this.vHeadingPerp);

				if(biggestOvershootFeeler == 0 || biggestOvershootFeeler == 1) {
					vForce.scale(biggestOvershoot);
				} else {
					vForce.scale(-biggestOvershoot);
				}
			}
		}
	},

	// TODO: Awfully slow ...
	getNeighbors: function() {
		// Check if there a new entites or some where killed
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

	seperation: function(vForce) {
		vForce.setNull();

		// Go through the neighbors
		for(var i = 0; i < this.lGeNeList.length; i++) {
			// Check if the this has not the same pos like the other or we get an ugly devision through zero
			// This normaly only happens when the two entities are placed on the same position in weltmeister
			if(!ig.Vec2.equals(this.lGeNeList[i].pos, this.pos)) {
				this.vSeVectorToNeighbor.set(this.pos).subtract(this.lGeNeList[i].pos);

				var magnitude = this.vSeVectorToNeighbor.magnitude();

				this.vSeVectorToNeighbor.normalize().scale(1 / magnitude)

				vForce.add(this.vSeVectorToNeighbor);
			}
		}
	},

	alignment: function(vForce) {
		vForce.setNull();

		// Go through the neighbors
		for(var i = 0; i < this.lGeNeList.length; i++) {
			vForce.add(this.lGeNeList[i].vHeading);
		}

		if(this.lGeNeList.length > 0) {
			vForce.scale(1 / this.lGeNeList.length).subtract(this.vHeading);
		}
	},

	cohesion: function(vForce) {
		vForce.setNull();

		// Go through the neighbors
		for(var i = 0; i < this.lGeNeList.length; i++) {
			vForce.add(this.lGeNeList[i].pos);
		}

		if(this.lGeNeList.length > 0) {
			vForce.scale(1 / this.lGeNeList.length);

			// TODO: Replace with seek
			vForce.subtract(this.pos).normalize().scale(this.maxSpeed).subtract(this.vel);
		}
	}
});

});
