ig.module(
	'game.entities.triangle'
)
.requires(
	'impact.entity'
)
.defines(function() {

EntityTriangle = ig.Entity.extend({
	size: {
		x: 8,
		y: 8
	},

	animSheet: new ig.AnimationSheet('media/triangle.png', 8, 8),

	neighborsType: 'EntityTriangle',

	wanderActive: true,
	separationActive: true,
	alignmentActive: true,
	cohesionActive: true,
	avoidanceActive: true,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	update: function() {
		this.parent();
	},

	draw: function() {
		this.parent();
	}
});

});