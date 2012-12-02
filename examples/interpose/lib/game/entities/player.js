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

	maxForce: 50,
	maxSpeed: 20,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	ready: function() {
		this.parent();

		this.interposeTargetA = ig.game.getEntitiesByType('EntityOther')[0];
		this.interposeTargetB = ig.game.getEntitiesByType('EntityOther')[1];

		this.interposeActive = true;
	},

	update: function() {
		if(ig.input.pressed('keyR')) {
			if(this.arriveFactor > 1) {
				this.arriveFactor--;
			}
		}

		if(ig.input.pressed('keyT')) {
			this.arriveFactor++;
		}

		if(ig.input.pressed('keyF')) {
			if(this.maxForce) {
				this.maxForce--;
			}
		}

		if(ig.input.pressed('keyG')) {
			this.maxForce++;
		}

		if(ig.input.pressed('keyV')) {
			if(this.maxSpeed) {
				this.maxSpeed--;
			}
		}

		if(ig.input.pressed('keyB')) {
			this.maxSpeed++;
		}

		this.parent();
	},

	draw: function() {
		if(!ig.global.wm) {
			ig.game.font.draw('arriveFactor (r/t): ' + this.arriveFactor, 9, 9, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('maxForce    (f/g): ' + this.maxForce, 9, 17, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('maxSpeed   (v/b): ' + this.maxSpeed, 9, 25, ig.Font.ALIGN.LEFT);
		}

		this.parent();
	}
});

// Show the debug information from the start
SteeringBehaviorsEntity._interpose = true;

});
