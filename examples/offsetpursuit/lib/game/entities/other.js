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

	arriveActive: true,

	target: null,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	ready: function() {
		this.parent();

		this.target = ig.game.getEntitiesByType('EntityTarget')[0];
	},

	update: function() {
		this.vArriveTo.set({
			x: this.target.pos.x + this.target.size.x / 2,
			y: this.target.pos.y + this.target.size.y / 2
		});

		this.parent();
	}
});

});