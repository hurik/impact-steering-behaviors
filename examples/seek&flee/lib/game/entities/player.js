ig.module(
	'game.entities.player'
)
.requires(
	'plugins.steering-behaviors'
)
.defines(function() {

EntityPlayer = SteeringBehaviorsEntity.extend({
	size: {
		x: 8,
		y: 8
	},

	animSheet: new ig.AnimationSheet('media/player.png', 8, 8),

	maxForce: 20,

	// 0 = seek, 1 = flee
	state: 0,

	target: null,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	ready: function() {
		this.parent();

		this.target = ig.game.getEntitiesByType('EntityTarget')[0];

		this.seekActive = true;
		this.fleeActive = false;
	},

	update: function() {
		if(ig.input.pressed('seekOrFlee')) {
			if(this.state == 0) {
				this.state = 1;

				this.seekActive = false;
				this.fleeActive = true;
			} else {
				this.state = 0;

				this.seekActive = true;
				this.fleeActive = false;

			}
		}

		if(this.state == 0) {
			this.vSeekTarget.set(this.target.pos);
		} else {
			this.vFleeFrom.set(this.target.pos);
		}

		this.parent();
	},

	draw: function() {
		if(this.state == 0) {
			ig.game.font.draw('State: seek\nPress SPACE to change state!', 1, 1, ig.Font.ALIGN.LEFT);
		} else {
			ig.game.font.draw('State: flee\nPress SPACE to change state!', 1, 1, ig.Font.ALIGN.LEFT);
		}

		this.parent();
	}
});

});