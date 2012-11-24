ig.module(
	'game.entities.wolf'
)
.requires(
	'impact.entity'
)
.defines(function() {

EntityWolf = ig.Entity.extend({
	size: {
		x: 8,
		y: 8
	},

	animSheet: new ig.AnimationSheet('media/wolf.png', 8, 8),

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