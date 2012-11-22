/*
 * steering-behaviors
 * https://github.com/hurik/impact-steering-behaviors
 *
 * v0.1.0
 *
 * IMPORTANT:
 * You need this plugins:
 * line-of-sight - https://github.com/hurik/impact-line-of-sight
 * vector2d      - https://github.com/hurik/impact-vector2d
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
	'impact.debug.menu',
	'impact.entity'
)
.defines(function(){

ig.Entity.inject({
	draw: function() {

		this.parent();

		if(ig.Entity._wander && this.wanderActive) {
			var vEntityCenter = ig.Vector2D.add(this.pos, ig.Vector2D.scalarDivi(this.size, 2));
			
			var vCircleCenter = ig.Vector2D.add(vEntityCenter, ig.Vector2D.scalarMult(this.vHeading, this.wanderDistance));
			var vMovementPointer = ig.Vector2D.add(vCircleCenter, this.vWanderTargert);

			this._drawLine(vEntityCenter, vCircleCenter, 1, 255, 0, 0, 0.5);
			this._drawCircle(vCircleCenter, this.wanderRadius, 1, 255, 0, 0, 0.5);
			this._drawCircle(vMovementPointer, 1, 2, 255, 0, 0, 0.5);
		}

		if(ig.Entity._avoidance && this.avoidanceActive) {
			var vEntityCenter = ig.Vector2D.add(this.pos, ig.Vector2D.scalarDivi(this.size, 2));
			var distance = ig.Vector2D.length(this.vel) + this.size.y;
			var farDistance = ig.Vector2D.length(this.vel) + this.size.y * 2;

			// Far left
			var vStart = ig.Vector2D.add(vEntityCenter, ig.Vector2D.add(ig.Vector2D.scalarMult(this.vHeading, -this.size.y / 2), ig.Vector2D.scalarMult(this.vHeadingPerp, -this.size.x)));
			var vEnd = ig.Vector2D.add(vStart, ig.Vector2D.scalarMult(this.vHeading, farDistance));

			this._drawLine(vStart, vEnd, 1, 255, 0, 0, 0.5);

			// Front left
			vStart = ig.Vector2D.add(vEntityCenter, ig.Vector2D.add(ig.Vector2D.scalarMult(this.vHeading, this.size.y / 2), ig.Vector2D.scalarMult(this.vHeadingPerp, -this.size.x * 1 / 4)));
			vEnd = ig.Vector2D.add(vStart, ig.Vector2D.scalarMult(this.vHeading, distance));

			this._drawLine(vStart, vEnd, 1, 255, 0, 0, 0.5);

			// Front right
			vStart = ig.Vector2D.add(vEntityCenter, ig.Vector2D.add(ig.Vector2D.scalarMult(this.vHeading, this.size.y / 2), ig.Vector2D.scalarMult(this.vHeadingPerp, this.size.x * 1 / 4)));
			vEnd = ig.Vector2D.add(vStart, ig.Vector2D.scalarMult(this.vHeading, distance));

			this._drawLine(vStart, vEnd, 1, 255, 0, 0, 0.5);

			// Far right
			vStart = ig.Vector2D.add(vEntityCenter, ig.Vector2D.add(ig.Vector2D.scalarMult(this.vHeading, -this.size.y / 2), ig.Vector2D.scalarMult(this.vHeadingPerp, this.size.x)));
			vEnd = ig.Vector2D.add(vStart, ig.Vector2D.scalarMult(this.vHeading, farDistance));

			this._drawLine(vStart, vEnd, 1, 255, 0, 0, 0.5);

			// Sterring force
			var vSteeringForce = ig.Vector2D.add(vEntityCenter, this.avoidance());

			this._drawLine(vEntityCenter, vSteeringForce, 1, 0, 255, 0, 0.5);
		}

	},

	_drawCircle: function(vect, radius, width, r, g, b, a) {
		var ctx = ig.system.context;

		ctx.strokeStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
		ctx.lineWidth = width;

		ctx.beginPath();
		ctx.arc(ig.system.getDrawPos(vect.x - ig.game.screen.x), ig.system.getDrawPos(vect.y - ig.game.screen.y), radius * ig.system.scale, 0, Math.PI * 2);
		ctx.stroke();
	},

	_drawLine: function(vect1, vect2, width, r, g, b, a) {
		var ctx = ig.system.context;

		ctx.strokeStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
		ctx.lineWidth = width;

		ctx.beginPath();
		ctx.moveTo(
		ig.system.getDrawPos(vect1.x - ig.game.screen.x), ig.system.getDrawPos(vect1.y - ig.game.screen.y));
		ctx.lineTo(
		ig.system.getDrawPos(vect2.x - ig.game.screen.x), ig.system.getDrawPos(vect2.y - ig.game.screen.y));
		ctx.stroke();
		ctx.closePath();
	}
});

ig.Entity._wander = false;
ig.Entity._avoidance = false;

ig.debug.addPanel({
	type: ig.DebugPanel,
	name: 'steering-behaviors-debug',
	label: 'Steering Behaviors',

	options: [{
		name: 'Wander',
		object: ig.Entity,
		property: '_wander'
	}, {
		name: 'Avoidance',
		object: ig.Entity,
		property: '_avoidance'
	}]
});

});