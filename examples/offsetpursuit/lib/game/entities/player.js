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

	offsetPursuitActive: true,

	maxForce: 100,
	maxSpeed: 200,

	init: function(x, y, settings) {
		this.addAnim('idle', 5, [0]);

		this.parent(x, y, settings);
	},

	ready: function() {
		this.parent();

		this.offsetPursuitLeader = ig.game.getEntitiesByType('EntityOther')[0];

		if(this.pos.x == 48) {
			this.vOffsetPursuitOffset.set({x: 0, y: -16});
		}

		if(this.pos.x == 52) {
			this.vOffsetPursuitOffset.set({x: -16, y: -16});
		}

		if(this.pos.x == 328) {
			this.vOffsetPursuitOffset.set({x: 16, y: -16});
		}
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
			ig.game.font.draw('arriveFactor (r/t): ' + this.arriveFactor, 1, 1, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('maxForce    (f/g): ' + this.maxForce, 1, 9, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('maxSpeed   (v/b): ' + this.maxSpeed, 1, 17, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('Click on the map to move the target!', 1, 25, ig.Font.ALIGN.LEFT);
		}

		this.parent();
	}
});

// Show the debug information from the start
SteeringBehaviorsEntity._offsetPursuit = true;

});
