ig.module( 
	'game.main' 
)
.requires(
	'impact.game',

	// Plugins
	'plugins.steering-behaviors',

	// Debug
	'impact.debug.debug',
	'plugins.steering-behaviors-debug',

	// Maps
	'game.levels.example'
)
.defines(function(){

MyGame = ig.Game.extend({
	font: new ig.Font('media/font.png'),

	init: function() {
		// Initialize your game here; bind keys etc.
		ig.input.bind(ig.KEY.MOUSE1, 'changeTargetPosition');
		ig.input.bind(ig.KEY.SPACE, 'seekOrFlee');
		ig.input.bind(ig.KEY.R, 'keyR');
		ig.input.bind(ig.KEY.T, 'keyT');
		ig.input.bind(ig.KEY.F, 'keyF');
		ig.input.bind(ig.KEY.G, 'keyG');

		this.loadLevel(LevelExample);
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();

		// Add your own, additional update code here
	},

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();

		// Add your own drawing code here
	}
});

ig.main('#canvas', MyGame, 60, 400, 240, 1);

});
