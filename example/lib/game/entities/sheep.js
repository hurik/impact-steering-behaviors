ig.module(
	'game.entities.sheep'
)
.requires(
	'impact.entity'
)
.defines(function() {

EntitySheep = ig.Entity.extend({
	size: {
		x: 8,
		y: 8
	},

	animSheet: new ig.AnimationSheet('media/sheep.png', 8, 8),

	getNeighborsEntityType: 'EntitySheep',

	wallAvoidanceActive: true,
	separationActive: true,
	alignmentActive: true,
	cohesionActive: true,
	wanderActive: true,

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