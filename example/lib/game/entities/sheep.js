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

	neighborsType: 'EntitySheep',

	wanderActive: true,
	separationActive: true,
	alignmentActive: true,
	cohesionActive: true,
	avoidanceActive: true,

	wolf: null,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	ready: function() {
		this.wolf = ig.game.getEntitiesByType('EntityWolf')[0];
	},

	update: function() {
		if(this.distanceTo(this.wolf) < 60) {
			this.fleeFromPos = this.wolf.pos;
			this.fleeActive = true;
		} else {
			this.fleeActive = false;
		}

		this.parent();
	},

	draw: function() {
		this.parent();
	}
});

});