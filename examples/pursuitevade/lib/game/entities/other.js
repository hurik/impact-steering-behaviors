ig.module(
	'game.entities.other'
)
.requires(
	'plugins.steering-behaviors'
)
.defines(function() {

EntityOther = SteeringBehaviorsEntity.extend({
	size: {
		x: 8,
		y: 8
	},

	animSheet: new ig.AnimationSheet('media/other.png', 8, 8),

	wanderActive: true,
	wallAvoidanceActive: true,

	maxForce: 100,
	wanderDistance: 20,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	}
});

});