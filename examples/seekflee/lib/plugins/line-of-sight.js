/*
 * line-of-sight
 * https://github.com/hurik/impact-line-of-sight
 *
 * v0.4.1
 *
 * Andreas Giemza
 * andreas@giemza.net
 * http://www.hurik.de/
 *
 * This work is licensed under the Creative Commons Attribution 3.0 Unported License. To view a copy of this license, visit http://creativecommons.org/licenses/by/3.0/.
 *
 */

ig.module(
	'plugins.line-of-sight'
)
.requires(
	'impact.collision-map'
)
.defines(function() {

ig.CollisionMap.inject({
	losMap: null,
	losHeight: 0,
	losWidth: 0,

	// When a map is loaded, create the pixel based collision map
	init: function(tilesize, data, tiledef) {
		this.parent(tilesize, data, tiledef);

		// Get them map size in pixels
		this.losHeight = this.height * this.tilesize;
		this.losWidth = this.width * this.tilesize;

		// Create the empty array for the pixel based collision map
		this.losMap = new Array(this.losHeight);

		for(var y = 0; y < this.losHeight; y++) {
			this.losMap[y] = new Array(this.losWidth);

			for(var x = 0; x < this.losWidth; x++) {
				this.losMap[y][x] = 0;
			}
		}

		// Copy the collision map in the pixel based collision map
		for(var y = 0; y < this.height; y++) {
			for(var x = 0; x < this.width; x++) {
				if(this.data[y][x] == 1) {
					for(var los_y = 0; los_y < this.tilesize; los_y++) {
						for(var los_x = 0; los_x < this.tilesize; los_x++) {
							this.losMap[y * this.tilesize + los_y][x * this.tilesize + los_x] = 1;
						}
					}
				}
			}
		}
	},

	traceLos: function(x, y, vx, vy, objectWidth, objectHeight, entityTypesArray, ignoreEntityArray) {
		if (entityTypesArray == null) {
			entityTypesArray = [];
		}
		
		if (ignoreEntityArray == null) {
			ignoreEntityArray = [];
		}

		objectWidth = objectWidth - 1;
		objectHeight = objectHeight - 1;

		var ignoreThisEntity;

		// Add the entity types to the pixel based collision map
		this._addEraseEntityLos(0, entityTypesArray, ignoreEntityArray);

		// Check if we have a free line of sight ...
		var ret = false;

		if(this._traceLosStep(x, y, x + vx, y + vy)) {
			ret = true;
		}

		if (!ret) {
			if(this._traceLosStep(x + objectWidth, y, x + vx + objectWidth, y + vy)) {
				ret = true;
			}
		}

		if (!ret) {
			if(this._traceLosStep(x, y + objectHeight, x + vx, y + vy + objectHeight)) {
				ret = true;
			}
		}

		if (!ret) {
			if(this._traceLosStep(x + objectWidth, y + objectHeight, x + vx + objectWidth, y + vy + objectHeight)) {
				ret = true;
			}
		}

		// Erase the entity types from the pixel based collision map
		this._addEraseEntityLos(1, entityTypesArray, ignoreEntityArray);

		return ret;
	},

	_addEraseEntityLos: function(mode, entityTypesArray, ignoreEntityArray) {
		// Go through the entityTypesArray
		for(i = 0; i < entityTypesArray.length; i++) {
			var entities = ig.game.getEntitiesByType(entityTypesArray[i]);

			// Get every entity of this type
			for(j = 0; j < entities.length; j++) {
				ignoreThisEntity = false;

				// Check if this entity is excluded from the line of sight check
				for(k = 0; k < ignoreEntityArray.length; k++) {
					if(ignoreEntityArray[k].id == entities[j].id) {
						ignoreThisEntity = true;
					}
				}

				// Add the entity to the pixel collision map
				if(!ignoreThisEntity) {
					for(var los_y = 0; los_y < entities[j].size.y; los_y++) {
						for(var los_x = 0; los_x < entities[j].size.x; los_x++) {
							// 0 = add, 1 = erase
							if (mode == 0) {
								if (this.losMap[(entities[j].pos.y).floor() + los_y][(entities[j].pos.x).floor() + los_x] == 0) {
									this.losMap[(entities[j].pos.y).floor() + los_y][(entities[j].pos.x).floor() + los_x] = 9999;
								}
							} else if (mode == 1) {
								if (this.losMap[(entities[j].pos.y).floor() + los_y][(entities[j].pos.x).floor() + los_x] == 9999) {
									this.losMap[(entities[j].pos.y).floor() + los_y][(entities[j].pos.x).floor() + los_x] = 0;
								}
							}
						}
					}
				}
			}
		}
	},
	
	_traceLosStep: function(x0, y0, x1, y1) {
		x0 = x0.floor();
		y0 = y0.floor();

		x1 = x1.floor();
		y1 = y1.floor();

		// Bresenham's line algorithm
		var dx = Math.abs(x1 - x0),
			sx = x0 < x1 ? 1 : -1;
		var dy = Math.abs(y1 - y0),
			sy = y0 < y1 ? 1 : -1;
		var err = (dx > dy ? dx : -dy) / 2;

		while(true) {
			if(y0 < 0 || y0 >= this.losHeight || x0 < 0 || x0 >= this.losWidth) {
				return true;
			}

			if(this.losMap[y0][x0] != 0) {
				return true;
			}

			if(x0 === x1 && y0 === y1) {
				break;
			}

			var e2 = err;

			if(e2 > -dx) {
				err -= dy;
				x0 += sx;
			}

			if(e2 < dy) {
				err += dx;
				y0 += sy;
			}
		}

		return false;
	},

	traceLosDetailed: function(vStart, vEnd, res) {
		var x0 = vStart.x.floor(),
			y0 = vStart.y.floor();

		var x1 = vEnd.x.floor(),
			y1 = vEnd.y.floor();

		// Bresenham's line algorithm
		var dx = Math.abs(x1 - x0),
			sx = x0 < x1 ? 1 : -1;
		var dy = Math.abs(y1 - y0),
			sy = y0 < y1 ? 1 : -1;
		var err = (dx > dy ? dx : -dy) / 2;

		while(true) {
			if(y0 < 0 || y0 >= this.losHeight || x0 < 0 || x0 >= this.losWidth) {
				res.collision = true;
				res.x = x0;
				res.y = y0;

				return;
			}

			if(this.losMap[y0][x0] != 0) {
				res.collision = true;
				res.x = x0;
				res.y = y0;

				return;
			}

			if(x0 === x1 && y0 === y1) {
				break;
			}

			var e2 = err;

			if(e2 > -dx) {
				err -= dy;
				x0 += sx;
			}

			if(e2 < dy) {
				err += dx;
				y0 += sy;
			}
		}

		res.collision = false;
		res.x = 0;
		res.y = 0;
	}
});

});