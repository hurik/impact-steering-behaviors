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
			this.vSeekTarget.set({
				x: this.target.pos.x + this.target.size.x / 2,
				y: this.target.pos.y + this.target.size.y / 2
			});
		} else {
			this.vFleeFrom.set({
				x: this.target.pos.x + this.target.size.x / 2,
				y: this.target.pos.y + this.target.size.y / 2
			});
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
			ig.game.font.draw('maxSpeed (f/g): ' + this.maxSpeed, 1, 17, ig.Font.ALIGN.LEFT);
			ig.game.font.draw('Click on the map to move the target!', 1, 25, ig.Font.ALIGN.LEFT);
		}

		this.parent();
	}
});

});