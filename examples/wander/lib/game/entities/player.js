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

	wanderActive: true,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	update: function() {
		if(ig.input.pressed('keyR')) {
			if(this.wanderRadius) {
				this.wanderRadius--;
			}
		}

		if(ig.input.pressed('keyT')) {
			this.wanderRadius++;
		}

		if(ig.input.pressed('keyF')) {
			if(this.wanderDistance) {
				this.wanderDistance--;
			}
		}

		if(ig.input.pressed('keyG')) {
			this.wanderDistance++;
		}

		if(ig.input.pressed('keyV')) {
			this.wanderJitter--;
		}

		if(ig.input.pressed('keyB')) {
			this.wanderJitter++;
		}

		this.parent();
	},

	draw: function() {
		if(!ig.global.wm) {
			ig.game.font.draw('wanderRadius   (r/t): ' + this.wanderRadius, 9, 9, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('wanderDistance (f/g): ' + this.wanderDistance, 9, 17, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('wanderJitter   (v/b): ' + this.wanderJitter, 9, 25, ig.Font.ALIGN.LEFT);
		}

		this.parent();
	}
});

// Activate the wander debug
SteeringBehaviorsEntity._wander = true;

});