/*
 * steering-behaviors-debug
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
	'plugins.steering-behaviors-debug' 
)
.requires(
	'plugins.steering-behaviors',
	'impact.debug.menu'
)
.defines(function(){

SteeringBehaviorsEntity.inject({
	draw: function() {
		this.parent();

		if(SteeringBehaviorsEntity._pursuit && this.pursuitActive) {
			this._drawCircle(this.vPuPointer, 1, 2, 255, 0, 0, 0.5);
		}

		if(SteeringBehaviorsEntity._evade && this.evadeActive) {
			this._drawCircle(this.vEvPointer, 1, 2, 255, 0, 0, 0.5);
		}

		if(SteeringBehaviorsEntity._wander && this.wanderActive) {
			var vCircleCenter = this.vHeading.clone().scale(this.wanderDistance).add(this.vEntityCenter);
			var vMovementPointer = ig.Vec2.sum(vCircleCenter, this.vWanderTargert);

			this._drawLine(this.vEntityCenter, vCircleCenter, 1, 255, 0, 0, 0.5);
			this._drawCircle(vCircleCenter, this.wanderRadius, 1, 255, 0, 0, 0.5);
			this._drawCircle(vMovementPointer, 1, 2, 255, 0, 0, 0.5);
		}

		if(SteeringBehaviorsEntity._interpose && this.interposeActive) {
			this._drawCircle(this.vInPositionA, 1, 2, 255, 0, 0, 0.5);
			this._drawCircle(this.vInPositionB, 1, 2, 255, 0, 0, 0.5);
			this._drawLine(this.vInPositionA, this.vInPositionB, 1, 255, 0, 0, 0.5);
			this._drawCircle(this.vInMidPoint, 3, 2, 255, 0, 0, 0.5);
		}

		if(SteeringBehaviorsEntity._offsetPursuit && this.offsetPursuitActive) {
			this._drawCircle(this.vOfPuPoint, 1, 2, 255, 0, 0, 0.5);
			this._drawCircle(this.vOfPuOffsetPoint, 2, 1, 255, 0, 0, 0.5);
			this._drawLine(this.vOfPuPoint, this.vOfPuOffsetPoint, 1, 255, 0, 0, 0.5);
		}

		if(SteeringBehaviorsEntity._wallAvoidance && this.wallAvoidanceActive) {
			this._drawLine(this.vWaAvOuterLeftStart, this.vWaAvOuterLeftEnd, 1, 255, 0, 0, 0.5);
			this._drawLine(this.vWaAvFrontLeftStart, this.vWaAvFrontLeftEnd, 1, 255, 0, 0, 0.5);
			this._drawLine(this.vWaAvFrontRightStart, this.vWaAvFrontRightEnd, 1, 255, 0, 0, 0.5);
			this._drawLine(this.vWaAvOuterRightStart, this.vWaAvOuterRightEnd, 1, 255, 0, 0, 0.5);
		}
	},

	_drawCircle: function(vect, radius, width, r, g, b, a) {
		ig.system.context.strokeStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
		ig.system.context.lineWidth = width * ig.system.scale;

		ig.system.context.beginPath();
		ig.system.context.arc(ig.system.getDrawPos(vect.x - ig.game.screen.x), ig.system.getDrawPos(vect.y - ig.game.screen.y), radius * ig.system.scale, 0, Math.PI * 2);
		ig.system.context.stroke();
	},

	_drawLine: function(vect1, vect2, width, r, g, b, a) {
		ig.system.context.strokeStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
		ig.system.context.lineWidth = width * ig.system.scale;

		ig.system.context.beginPath();
		ig.system.context.moveTo(
		ig.system.getDrawPos(vect1.x - ig.game.screen.x), ig.system.getDrawPos(vect1.y - ig.game.screen.y));
		ig.system.context.lineTo(
		ig.system.getDrawPos(vect2.x - ig.game.screen.x), ig.system.getDrawPos(vect2.y - ig.game.screen.y));
		ig.system.context.stroke();
		ig.system.context.closePath();
	}
});

SteeringBehaviorsEntity._pursuit = false;
SteeringBehaviorsEntity._evade = false;
SteeringBehaviorsEntity._wander = false;
SteeringBehaviorsEntity._interpose = false;
SteeringBehaviorsEntity._offsetPursuit = false;
SteeringBehaviorsEntity._wallAvoidance = false;

ig.debug.addPanel({
	type: ig.DebugPanel,
	name: 'steering-behaviors-debug',
	label: 'Steering Behaviors',

	options: [{
		name: 'Pursuit',
		object: SteeringBehaviorsEntity,
		property: '_pursuit'
	}, {
		name: 'Evade',
		object: SteeringBehaviorsEntity,
		property: '_evade'
	}, {
		name: 'Wander',
		object: SteeringBehaviorsEntity,
		property: '_wander'
	}, {
		name: 'Interpose',
		object: SteeringBehaviorsEntity,
		property: '_interpose'
	}, {
		name: 'Offset Pursuit',
		object: SteeringBehaviorsEntity,
		property: '_offsetPursuit'
	}, {
		name: 'Wall Avoidance',
		object: SteeringBehaviorsEntity,
		property: '_wallAvoidance'
	}]
});

});
