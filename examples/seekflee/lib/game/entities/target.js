ig.module(
	'game.entities.target'
)
.requires(
	'impact.entity'
)
.defines(function() {

EntityTarget = ig.Entity.extend({
	size: {
		x: 8,
		y: 8
	},

	animSheet: new ig.AnimationSheet('media/target.png', 8, 8),

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	update: function() {
		if(ig.input.pressed('changeTargetPosition')) {
			this.pos.x = ig.input.mouse.x + ig.game.screen.x - this.size.x / 2;
			this.pos.y = ig.input.mouse.y + ig.game.screen.y - this.size.y / 2;
		}

		this.parent();
	}
});

});