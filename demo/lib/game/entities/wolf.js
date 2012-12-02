ig.module(
	'game.entities.wolf'
)
.requires(
	'plugins.steering-behaviors'
)
.defines(function() {

EntityWolf = SteeringBehaviorsEntity.extend({
	size: {
		x: 8,
		y: 8
	},

	animSheet: new ig.AnimationSheet('media/wolf.png', 8, 8),

	maxForce: 500,

	wallAvoidanceActive: true,
	wanderActive: true,

	wallAvoidanceWeight: 20,

	wanderWeight: 5,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	}
});

});