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

	wolf: null,
	wolfLosRes: {
		collision: false,
		x: 0,
		y: 0
	},

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	ready: function() {
		this.parent();

		this.wolf = ig.game.getEntitiesByType('EntityWolf')[0];
	},

	update: function() {
		// Check if wolf is too near
		if(ig.Vec2.distance(this.wolf.vEntityCenter, this.vEntityCenter) < 40) {
			// Check if there is a line of sight
			ig.game.collisionMap.traceLosDetailed(this.vEntityCenter, this.wolf.vEntityCenter, this.wolfLosRes);

			if(!this.wolfLosRes.collision) {
				this.vFleeFrom.set(this.wolf.vEntityCenter);

				this.fleeActive = true;
			} else {
				this.fleeActive = false;
			}
		} else {
			this.fleeActive = false;
		}

		this.parent();
	}
});

});