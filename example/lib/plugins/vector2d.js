/*
 * vector2d
 * https://github.com/hurik/impact-vector2d
 *
 * v1.0.2
 *
 * Andreas Giemza
 * andreas@giemza.net
 * http://www.hurik.de/
 *
 * This work is licensed under the Creative Commons Attribution 3.0 Unported License. To view a copy of this license, visit http://creativecommons.org/licenses/by/3.0/.
 *
 * Credits:
 * Based on the work of anthonycosgrave (http://impactjs.com/forums/impact-engine/vector-math-helper-class)
 * and the 2D vector struct from "Programming Game AI by Example" by Mat Buckland (http://www.jblearning.com/Catalog/9781556220784/student/).
 *
 */

ig.module(
	'plugins.vector2d'
)
.defines(function(){ "use strict";

ig.Vector2D = {
	// Returns the sum of vectA and vectB
	add: function(vectA, vectB) {
		return {
			x: (vectA.x + vectB.x),
			y: (vectA.y + vectB.y)
		};
	},

	// Returns the difference between vectA and vectB
	sub: function(vectA, vectB) {
		return {
			x: (vectA.x - vectB.x),
			y: (vectA.y - vectB.y)
		};
	},

	// Multiplying by a scalar changes the magnitude but leaves the direction the same
	scalarMult: function(vect, scalar) {
		return {
			x: (vect.x * scalar),
			y: (vect.y * scalar)
		};
	},

	// Divide by a scalar changes the magnitude but leaves the direction the same
	scalarDivi: function(vect, scalar) {
		return {
			x: (vect.x / scalar),
			y: (vect.y / scalar)
		};
	},

	// Returns true if vectA equals vectB
	equals: function(vectA, vectB) {
		return(vectA.x == vectB.x && vectA.y == vectB.y);
	},

	// Calculate the length of a vector
	length: function(vect) {
		return Math.sqrt(vect.x * vect.x + vect.y * vect.y);
	},

	// Calculate the length squared of a vector
	lengthSq: function(vect) {
		return(vect.x * vect.x + vect.y * vect.y);
	},

	// Calculate dot product
	dot: function(vectA, vectB) {
		return(vectA.x * vectB.x + vectA.y * vectB.y);
	},

	// Returns a perpendicular vector to vect
	perp: function(vect) {
		return {
			x: -vect.y,
			y: vect.x
		};
	},

	// Returns distance between vectA and vectB
	distance: function(vectA, vectB) {
		var sub = this.sub(vectA, vectB);

		return this.length(sub);
	},

	// Returns distance squared between vectA and vectB
	distanceSq: function(vectA, vectB) {
		var sub = this.sub(vectA, vectB);

		return this.lengthSq(sub);
	},

	// Truncates a vector so that its length does not exceed max
	truncate: function(vect, max) {
		if(this.length(vect) > max) {
			return this.scalarMult(this.norm(vect), max);
		}

		return vect;
	},

	// Returns the reverse of vect
	reverse: function(vect) {
		return {
			x: -vect.x,
			y: -vect.y
		};
	},

	// Normalize a vector (i.e. get the direction, reduce the length to 1)
	norm: function(vect) {
		var lenght = this.length(vect);

		if(lenght > 0) {
			return {
				x: (vect.x / lenght),
				y: (vect.y / lenght)
			};
		} else {
			return vect;
		}
	},

	// Set the vect to zero
	zero: function() {
		return {
			x: 0,
			y: 0
		};
	},

	// Returns true when the vect is zero
	isZero: function(vect) {
		if(vect.x == 0 && vect.y == 0) {
			return true;
		} else {
			return false;
		}
	}
};

});