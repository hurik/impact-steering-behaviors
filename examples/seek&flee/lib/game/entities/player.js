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
		if(ig.input.pressed('keyR')) {
			if(this.wanderRadius) {
				this.maxForce--;
			}
		}

		if(ig.input.pressed('keyT')) {
			this.maxForce++;
		}

		if(ig.input.pressed('keyF')) {
			if(this.wanderDistance) {
				this.maxSpeed--;
			}
		}

		if(ig.input.pressed('keyG')) {
			this.maxSpeed++;
		}

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
		if(!ig.global.wm) {
			if(this.state == 0) {
				ig.game.font.draw('State   (Space): seek', 1, 1, ig.Font.ALIGN.LEFT);
			} else {
				ig.game.font.draw('State   (Space): flee', 1, 1, ig.Font.ALIGN.LEFT);
			}

			ig.game.font.draw('maxForce  (r/t): ' + this.maxForce, 1, 9, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('maxSpeed (f/g): ' + this.maxSpeed, 1, 18, ig.Font.ALIGN.LEFT);
		}

		this.parent();
	}
});

});