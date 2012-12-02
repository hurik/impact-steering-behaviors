/*
 * Vec2
 * https://github.com/hurik/impact-vec2
 *
 * v1.1.0
 *
 * Andreas Giemza
 * andreas@giemza.net
 * http://www.hurik.de/
 *
 * Based on:
 * https://code.google.com/p/closure-library/source/browse/trunk/closure/goog/math/vec2.js
 *
 */

ig.module(
	'plugins.vec2'
)
.defines(function(){ "use strict";

/**
 * Class for a two-dimensional vector object and assorted functions useful for
 * manipulating points.
 *
 * @param {number} x The x coordinate for the vector.
 * @param {number} y The y coordinate for the vector.
 * @constructor
 */
ig.Vec2 = function(x, y) {
	this.x = x;
	this.y = y;
};


/**
 * @return {!ig.Vec2} A random unit-length vector.
 */
ig.Vec2.randomUnit = function() {
	var angle = Math.random() * Math.PI * 2;
	return new ig.Vec2(Math.cos(angle), Math.sin(angle));
};


/**
 * @return {!ig.Vec2} A random vector inside the unit-disc.
 */
ig.Vec2.random = function() {
	var mag = Math.sqrt(Math.random());
	var angle = Math.random() * Math.PI * 2;

	return new ig.Vec2(Math.cos(angle) * mag, Math.sin(angle) * mag);
};


/**
 * @return {!ig.Vec2} A new vector with the same coordinates as this one.
 * @override
 */
ig.Vec2.prototype.clone = function() {
	return new ig.Vec2(this.x, this.y);
};


/**
 * Returns the magnitude of the vector measured from the origin.
 * @return {number} The length of the vector.
 */
ig.Vec2.prototype.magnitude = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};


/**
 * Returns the squared magnitude of the vector measured from the origin.
 * NOTE(brenneman): Leaving out the square root is not a significant
 * optimization in JavaScript.
 * @return {number} The length of the vector, squared.
 */
ig.Vec2.prototype.squaredMagnitude = function() {
	return this.x * this.x + this.y * this.y;
};


/**
 * Scales the current vector by a constant.
 * @param {number} s The scale factor.
 * @return {!ig.Vec2} The scaled vector.
 */
ig.Vec2.prototype.scale = function(s) {
	this.x *= s;
	this.y *= s;
	return this;
};


/**
 * Truncate the current vector by a constant.
 * @param {number} s The max magnitude.
 * @return {!ig.Vec2} The truncated vector.
 */
ig.Vec2.prototype.truncate = function(s) {
	if(this.magnitude() > s) {
		this.normalize().scale(s);
	}
	return this;
};


/**
 * Reverses the sign of the vector. Equivalent to scaling the vector by -1.
 * @return {!ig.Vec2} The inverted vector.
 */
ig.Vec2.prototype.invert = function() {
	this.x = -this.x;
	this.y = -this.y;
	return this;
};


/**
 * Normalizes the current vector to have a magnitude of 1.
 * @return {!ig.Vec2} The normalized vector.
 */
ig.Vec2.prototype.normalize = function() {
	return this.scale(1 / this.magnitude());
};


/**
 * Adds another vector to this vector in-place.
 * @param {!ig.Vec2} b The vector to add.
 * @return {!ig.Vec2}  This vector with {@code b} added.
 */
ig.Vec2.prototype.add = function(b) {
	this.x += b.x;
	this.y += b.y;
	return this;
};


/**
 * Subtracts another vector from this vector in-place.
 * @param {!ig.Vec2} b The vector to subtract.
 * @return {!ig.Vec2} This vector with {@code b} subtracted.
 */
ig.Vec2.prototype.subtract = function(b) {
	this.x -= b.x;
	this.y -= b.y;
	return this;
};


/**
 * Returns the angle of the vector from the origin.
 * @return {number} The angle, in radians, clockwise from the positive X
 *     axis.
 */
ig.Vec2.prototype.azimuth = function() {
	return Math.atan2(this.y, this.x);
};


/**
 * Rotates this vector in-place by a given angle, specified in radians.
 * @param {number} angle The angle, in radians.
 * @return {!ig.Vec2} This vector rotated {@code angle} radians.
 */
ig.Vec2.prototype.rotate = function(angle) {
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	var newX = this.x * cos - this.y * sin;
	var newY = this.y * cos + this.x * sin;
	this.x = newX;
	this.y = newY;
	return this;
};


/**
 * Compares this vector with another for equality.
 * @param {!ig.Vec2} b The other vector.
 * @return {boolean} Whether this vector has the same x and y as the given
 *     vector.
 */
ig.Vec2.prototype.equals = function(b) {
	return this == b || !! b && this.x == b.x && this.y == b.y;
};


/**
 * Set this vector to the values of another vector in-place.
 * @param {!ig.Vec2} b The other vector.
 * @return {!ig.Vec2} This vector set to {@code b}.
 */
ig.Vec2.prototype.set = function(b) {
	this.x = b.x;
	this.y = b.y;
	return this;
};


/**
 * Set this vector to the null vector.
 * @return {!ig.Vec2} This vector set to the null vector.
 */
ig.Vec2.prototype.setNull = function() {
	this.x = 0;
	this.y = 0;
	return this;
};


/**
 * Check if this vector is the null vector.
 * @return {boolean} Whether the vectors is the null vector.
 */
ig.Vec2.prototype.isNull = function() {
	return this.x == 0 && this.y == 0;
};


/**
 * Rotates a vector by a given angle, specified in radians, relative to a given
 * axis rotation point. The returned vector is a newly created instance - no
 * in-place changes are done.
 * @param {!ig.Vec2} v A vector.
 * @param {!ig.Vec2} axisPoint The rotation axis point.
 * @param {number} angle The angle, in radians.
 * @return {!ig.Vec2} The rotated vector in a newly created instance.
 */
ig.Vec2.rotateAroundPoint = function(v, axisPoint, angle) {
	var res = v.clone();
	return res.subtract(axisPoint).rotate(angle).add(axisPoint);
};


/**
 * Returns the distance between two vectors.
 * @param {!ig.Vec2} a The first vector.
 * @param {!ig.Vec2} b The second vector.
 * @return {number} The distance.
 */
ig.Vec2.distance = function(a, b) {
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Returns the squared distance between two coordinates. Squared distances can
 * be used for comparisons when the actual value is not required.
 *
 * Performance note: eliminating the square root is an optimization often used
 * in lower-level languages, but the speed difference is not nearly as
 * pronounced in JavaScript (only a few percent.)
 *
 * @param {!ig.Vec2} a The first vector.
 * @param {!ig.Vec2} b The second vector.
 * @return {number} The squared distance.
 */
ig.Vec2.squaredDistance = function(a, b) {
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	return dx * dx + dy * dy;
};


/**
 * Compares vectors for equality.
 * @param {!ig.Vec2} a The first vector.
 * @param {!ig.Vec2} b The second vector.
 * @return {boolean} Whether the vectors have the same x and y coordinates.
 */
ig.Vec2.equals = function(a, b) {
	if(a == b) {
		return true;
	}
	if(!a || !b) {
		return false;
	}
	return a.x == b.x && a.y == b.y;
};


/**
 * Returns the sum of two vectors as a new Vec2.
 * @param {!ig.Vec2} a The first vector.
 * @param {!ig.Vec2} b The second vector.
 * @return {!ig.Vec2} The sum vector.
 */
ig.Vec2.sum = function(a, b) {
	return new ig.Vec2(a.x + b.x, a.y + b.y);
};


/**
 * Returns the difference between two vectors as a new Vec2.
 * @param {!ig.Vec2} a The first vector.
 * @param {!ig.Vec2} b The second vector.
 * @return {!ig.Vec2} The difference vector.
 */
ig.Vec2.difference = function(a, b) {
	return new ig.Vec2(a.x - b.x, a.y - b.y);
};


/**
 * Returns the dot-product of two vectors.
 * @param {!ig.Vec2} a The first vector.
 * @param {!ig.Vec2} b The second vector.
 * @return {number} The dot-product of the two vectors.
 */
ig.Vec2.dot = function(a, b) {
	return a.x * b.x + a.y * b.y;
};


/**
 * Returns a new Vec2 that is the linear interpolant between vectors a and b at
 * scale-value x.
 * @param {!ig.Vec2} a Vector a.
 * @param {!ig.Vec2} b Vector b.
 * @param {number} x The proportion between a and b.
 * @return {!ig.Vec2} The interpolated vector.
 */
ig.Vec2.lerp = function(a, b, x) {
	return new ig.Vec2(a.x + x * (b.x - a.x), a.y + x * (b.y - a.y));
};

});
