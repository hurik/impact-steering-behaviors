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

		if(ig.input.pressed('keyR')) {
			if(this.arriveFactor) {
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

});