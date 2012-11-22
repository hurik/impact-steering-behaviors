ig.module( 
	'game.main' 
)
.requires(
	'impact.game',

	// Plugins
	'plugins.line-of-sight',
	'plugins.steering-behaviors',
	'plugins.vector2d',

	// Debug
	'impact.debug.debug',
	'plugins.steering-behaviors-debug',

	// Entities
	'game.entities.triangle',

	// Maps
	'game.levels.example'
)
.defines(function(){

MyGame = ig.Game.extend({
	init: function() {
		// Initialize your game here; bind keys etc.
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


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 400, 240, 1 );

});
