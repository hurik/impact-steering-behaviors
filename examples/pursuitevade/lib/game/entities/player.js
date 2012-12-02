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

	// 0 = pursuit, 1 = evade
	state: 0,

	maxForce: 50,
	maxSpeed: 20,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	ready: function() {
		this.parent();

		this.pursuitEvader = ig.game.getEntitiesByType('EntityOther')[0];
		this.evadePursuer = this.pursuitEvader;

		this.pursuitActive = true;
		this.evadeActive = false;
	},

	update: function() {
		if(ig.input.pressed('keyR')) {
			if(this.maxForce) {
				this.maxForce--;
			}
		}

		if(ig.input.pressed('keyT')) {
			this.maxForce++;
		}

		if(ig.input.pressed('keyF')) {
			if(this.maxSpeed) {
				this.maxSpeed--;
			}
		}

		if(ig.input.pressed('keyG')) {
			this.maxSpeed++;
		}

		if(ig.input.pressed('pursuitOrEvade')) {
			if(this.state == 0) {
				this.state = 1;

				this.pursuitActive = false;
				this.evadeActive = true;
			} else {
				this.state = 0;

				this.pursuitActive = true;
				this.evadeActive = false;

			}
		}

		this.parent();
	},

	draw: function() {
		if(!ig.global.wm) {
			if(this.state == 0) {
				ig.game.font.draw('State   (Space): pursuit', 9, 9, ig.Font.ALIGN.LEFT);
			} else {
				ig.game.font.draw('State   (Space): evade', 9, 9, ig.Font.ALIGN.LEFT);
			}

			ig.game.font.draw('maxForce  (r/t): ' + this.maxForce, 9, 17, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('maxSpeed (f/g): ' + this.maxSpeed, 9, 25, ig.Font.ALIGN.LEFT);
		}

		this.parent();
	}
});

// Show the debug information from the start
SteeringBehaviorsEntity._pursuit = true;
SteeringBehaviorsEntity._evade = true;

});
