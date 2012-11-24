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
	'impact.entity'
)
.defines(function() {

ig.Entity.inject({
	// ----- Global settings -----
	maxForce: 10,
	maxSpeed: 50,


	// ----- Steering behaviors settings -----
	// Wander
	wanderRadius: 16,
	wanderDistance: 12,
	wanderJitter: 200,


	// ----- Steering behaviors weight -----
	wanderWeight: 1,


	// ----- Steering behaviors switches -----
	wanderActive: true,


	// ----- Internal -----	
	// Calculation internal
	// Center of the entity
	vEntityCenter: new ig.Vec2(0, 0),
	// Heading of the entity (normalized vel)
	vHeading: new ig.Vec2(0, -1),
	// Perpendicular of the heading
	vHeadingPerp: new ig.Vec2(1, 0),

	// Wander internal
	vWanderTargert: new ig.Vec2(0, 0),


	// ----- Impact options -----
	// For better collision resolution, so no entity get stucked 
	bounciness: 1,
	minBounceVelocity: 0,


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

		// Update the vHeading and vHeadingPerp only when the speed is bigger than 0
		if(speed > 0) {
			// Set the vHeading
			this.vHeading.x = this.vel.x / speed;
			this.vHeading.y = this.vel.y / speed;

			// Set the vHeadingPerp
			this.vHeadingPerp.x = -this.vHeading.y;
			this.vHeadingPerp.y = this.vHeading.x;
		}

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

		// Update vEntityCenter
		this.vEntityCenter.x = this.pos.x + (this.size.x / 2);
		this.vEntityCenter.y = this.pos.y + (this.size.y / 2);

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
		var lengthSoFar = vSteeringForce.magnitude();
		var lengthRemaining = this.maxForce - lengthSoFar;

		if(lengthRemaining <= 0.000000001) {
			return false;
		}

		var lengthToAdd = vForceToAdd.magnitude();

		if(lengthToAdd < lengthRemaining) {
			vSteeringForce.add(vForceToAdd);
		} else {
			vSteeringForce.add(vForceToAdd.normalize().scale(lengthRemaining));
		}

		return true;
	},

	wander: function(vForce) {
		this.vWanderTargert.x += (Math.random() * 2 - 1) * this.wanderJitter * ig.system.tick;
		this.vWanderTargert.y += (Math.random() * 2 - 1) * this.wanderJitter * ig.system.tick;

		this.vWanderTargert.normalize().scale(this.wanderRadius);

		vForce.x = this.vHeading.x;
		vForce.y = this.vHeading.y;

		vForce.scale(this.wanderDistance).add(this.vWanderTargert).subtract(this.vel);
	}
});

});
