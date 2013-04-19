/**
 * @fileOverview Contains doodle subclasses for glaucoma
 * @author <a href="mailto:bill.aylward@mac.com">Bill Aylward</a>
 * @version 0.8
 *
 * Modification date: 28th Ootober 2011
 * Copyright 2011 OpenEyes
 * 
 * This file is part of OpenEyes.
 * 
 * OpenEyes is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * OpenEyes is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with OpenEyes.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Defines the EyeDraw namespace
 * @namespace Namespace for all EyeDraw classes
 */
if (ED == null || typeof(ED) != "object") { var ED = new Object();}

/**
 * Radii from out to in (mainly for gonioscopy)
 * @ignore
 */
var rsl = 480;
var rsli = 470;
var rtmo = 404;
var rtmi = 304;
var rcbo = 270;
var rcbi = 190;
var riro = 190;
var riri = 176;
var rpu = 100;

/**
 * Gonioscopy
 *
 * @class Gonioscopy
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.Gonioscopy = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "Gonioscopy";

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.Gonioscopy.prototype = new ED.Doodle;
ED.Gonioscopy.prototype.constructor = ED.Gonioscopy;
ED.Gonioscopy.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.Gonioscopy.prototype.setHandles = function()
{
    this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Set default properties
 */
ED.Gonioscopy.prototype.setPropertyDefaults = function()
{
    this.isDeletable = false;
	this.isScaleable = false;
	this.isMoveable = false;
	this.isRotatable = false;
    this.isUnique = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-460, -420);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-460, -400);
}

/**
 * Sets default parameters
 */
ED.Gonioscopy.prototype.setParameterDefaults = function()
{
    this.apexX = -460;
    this.apexY = -460;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.Gonioscopy.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.Gonioscopy.superclass.draw.call(this, _point);
    
	// Calculate parameters for arcs
	var arcStart = 0;
	var arcEnd = 2 * Math.PI;
    
	// Boundary path
	ctx.beginPath();
    
	// Do a 360 arc
	ctx.arc(0, 0, rsl, arcStart, arcEnd, true);
	
	// Set line attributes
	ctx.lineWidth = 15;
	ctx.fillStyle = "rgba(255, 255, 255, 0)";
	ctx.strokeStyle = "rgba(200, 200, 200, 1)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Non boundary paths
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Trabecular meshwork
        ctx.beginPath();
        
        // Arc across, move to inner and arc back
        ctx.arc(0, 0, rtmo, arcStart, arcEnd, true);
        ctx.moveTo(rtmi, 0);
        ctx.arc(0, 0, rtmi, arcEnd, arcStart, false);
        
        // Set line attributes
        ctx.lineWidth = 1;
        
        // Fill style
        var ptrn;
        
        // Pattern
        if (this.apexX < -440)
        {
            if (this.apexY < -440) ptrn = ctx.createPattern(this.drawing.imageArray['MeshworkPatternLight'],'repeat');
            else if (this.apexY < -420) ptrn = ctx.createPattern(this.drawing.imageArray['MeshworkPatternMedium'],'repeat');
            else ptrn = ctx.createPattern(this.drawing.imageArray['MeshworkPatternHeavy'],'repeat');
            ctx.fillStyle = ptrn;
        }
        // Uniform
        else
        {
            if (this.apexY < -440) ctx.fillStyle = "rgba(250, 200, 0, 1)";
            else if (this.apexY < -420) ctx.fillStyle = "rgba(200, 150, 0, 1)";
            else ctx.fillStyle = "rgba(150, 100, 0, 1)";
        }
        
        // Stroke style
        ctx.strokeStyle = "rgba(200, 200, 200, 1)";
        
        // Draw it
        ctx.fill();
        ctx.stroke();
        
        // Ciliary Body
        ctx.beginPath();
        
        // Arc across, move to inner and arc back
        ctx.arc(0, 0, rcbo, arcStart, arcEnd, true);
        ctx.arc(0, 0, rcbi, arcEnd, arcStart, false);
        
        // Draw it
        ctx.fillStyle = "rgba(200, 200, 200, 1)";
        ctx.fill();
        
        // Draw radial lines
        var firstAngle = 15;
        var innerPoint = new ED.Point(0,0);
        var outerPoint = new ED.Point(0,0);
        var i = 0;
        
        // Loop through clock face
        for (i = 0; i < 12; i++)
        {
            // Get angle
            var angleInRadians = (firstAngle + i * 30) * Math.PI/180;
            innerPoint.setWithPolars(rcbi, angleInRadians);
            
            // Set new line
            ctx.beginPath();
            ctx.moveTo(innerPoint.x, innerPoint.y);
            
            // Some lines are longer, wider and darker
            if (i == 1 || i == 4 || i == 7 || i == 10)
            {
                outerPoint.setWithPolars(rsl + 80, angleInRadians);
                ctx.lineWidth = 6;
                ctx.strokeStyle = "rgba(20, 20, 20, 1)";
            }
            else
            {
                outerPoint.setWithPolars(rsl, angleInRadians);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "rgba(137, 137, 137, 1)";
            }
            
            // Draw line
            ctx.lineTo(outerPoint.x, outerPoint.y);
            ctx.closePath();
            ctx.stroke();
        }
        
        // Iris
        ctx.beginPath();
        
        // Arc across, move to inner and arc back
        ctx.arc(0, 0, riro, arcStart, arcEnd, true);
        ctx.arc(0, 0, riri, arcEnd, arcStart, false);
        
        // Set attributes
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(180, 180, 180, 1)";
        ctx.fillStyle = "rgba(200, 200, 200, 1)";
        
        // Draw it
        ctx.fill();
        ctx.stroke();
	}
    
    // Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
    
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hit test
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle (overridden by subclasses)
 *
 * @returns {String} Description of doodle
 */
ED.Gonioscopy.prototype.description = function()
{
    var returnValue = "";
    
    if (this.apexX < -440)
    {
        if (this.apexY < -440) returnValue = "Light patchy pigment";
        else if (this.apexY < -420) returnValue = "Medium patchy pigment";
        else returnValue = "Heavy patchy pigment";
    }
    // Uniform
    else
    {
        if (this.apexY < -440) returnValue = "Light homogenous pigment";
        else if (this.apexY < -420) returnValue = "Medium homogenous pigment";
        else returnValue = "Heavy homogenous pigment";
    }

    return returnValue;
}

/**
 * AngleGradeNorth
 *
 * @class AngleGradeNorth
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.AngleGradeNorth = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "AngleGradeNorth";
    
    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.grade = "4";
    this.seen = "Yes";

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.AngleGradeNorth.prototype = new ED.Doodle;
ED.AngleGradeNorth.prototype.constructor = ED.AngleGradeNorth;
ED.AngleGradeNorth.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.AngleGradeNorth.prototype.setHandles = function()
{
    this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.AngleGradeNorth.prototype.setPropertyDefaults = function()
{
    this.isDeletable = false;
	this.isScaleable = false;
	this.isMoveable = false;
	this.isRotatable = false;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-rsli, -riri);
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['grade'] = {kind:'derived', type:'string', list:['4', '3', '2', '1', '0'], animate:true};
    this.parameterValidationArray['seen'] = {kind:'derived', type:'string', list:['Yes', 'No'], animate:true};
}

/**
 * Sets default parameters
 */
ED.AngleGradeNorth.prototype.setParameterDefaults = function()
{
    this.arc = 90 * Math.PI/180;
    this.apexY = -riri;
    this.setParameterFromString('grade', '4');
    this.setParameterFromString('seen', 'Yes');
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if their 'animate' property is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.AngleGradeNorth.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();
    
    switch (_parameter)
    {
        case 'apexY':
            // Return value uses Schaffer classificaton (although visibility is based on Scheie)
            var returnValue = "4";
            if (-_value >= riro) returnValue = "3";
            if (-_value >= rcbo) returnValue = "2";
            if (-_value >= rtmo) returnValue = "1";
            if (-_value >= rsli) returnValue = "0";
            returnArray['grade'] = returnValue;
            returnArray['seen'] = (-_value >= rtmo) ? 'No' : 'Yes';
            break;
            
        case 'grade':
            var returnValue = "";
            switch (_value)
            {
                case '0':
                    if (-this.apexY >= rsli) returnValue = this.apexY;
                    else returnValue = -rsli;
                    break;
                case '1':
                    if (-this.apexY >= rtmo && -this.apexY < rsli) returnValue = this.apexY;
                    else returnValue = -rtmo;
                    break;
                case '2':
                    if (-this.apexY >= rcbo && -this.apexY < rtmo) returnValue = this.apexY;
                    else returnValue = -360; //-rcbo;
                    break;
                case '3':
                    if (-this.apexY >= riro && -this.apexY < rcbo) returnValue = this.apexY;
                    else returnValue = -230; //-riro;
                    break;
                case '4':
                    if (-this.apexY >= riri && -this.apexY < riro) returnValue = this.apexY;
                    else returnValue= -riri;
                    break;
            }
            returnArray['apexY'] = returnValue;
            break;
            
        case 'seen':
            var returnValue = "";
            switch (_value)
            {
	            case 'No':
	              if (-this.apexY >= rtmo) returnValue = this.apexY;
	              else returnValue = -rtmo;
	              break;
	            case 'Yes':
	              if (-this.apexY < rtmo) returnValue = this.apexY;
	              else returnValue = -riri;
	              break;
            }
            returnArray['apexY'] = returnValue;
            break;
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.AngleGradeNorth.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.AngleGradeNorth.superclass.draw.call(this, _point);
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
	// Boundary path
	ctx.beginPath();
  
    // Arc across, move to inner and arc back
	ctx.arc(0, 0, -this.apexY, arcStart, arcEnd, true);
	ctx.arc(0, 0, rpu, arcEnd, arcStart, false);
    ctx.closePath();
    
    // Set fill attributes (same colour as Iris)
    ctx.fillStyle = "rgba(100, 200, 250, 1.0)";
	ctx.strokeStyle = "rgba(100, 100, 100, 1.0)";
    ctx.lineWidth = 4;
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * AngleGradeEast
 *
 * @class AngleGradeEast
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.AngleGradeEast = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "AngleGradeEast";
    
    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.grade = "4";
    this.seen = "Yes";
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.AngleGradeEast.prototype = new ED.Doodle;
ED.AngleGradeEast.prototype.constructor = ED.AngleGradeEast;
ED.AngleGradeEast.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.AngleGradeEast.prototype.setHandles = function()
{
    this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.AngleGradeEast.prototype.setPropertyDefaults = function()
{
    this.isDeletable = false;
	this.isScaleable = false;
	this.isMoveable = false;
	this.isRotatable = false;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-rsli, -riri);
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['grade'] = {kind:'derived', type:'string', list:['4', '3', '2', '1', '0'], animate:true};
    this.parameterValidationArray['seen'] = {kind:'derived', type:'string', list:['Yes', 'No'], animate:true};
}

/**
 * Sets default parameters
 */
ED.AngleGradeEast.prototype.setParameterDefaults = function()
{
    this.arc = 90 * Math.PI/180;
    this.apexY = -riri;
    this.rotation = Math.PI/2;
    this.setParameterFromString('grade', '4');
    this.setParameterFromString('seen', 'Yes');
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if their 'animate' property is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.AngleGradeEast.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();
    
    switch (_parameter)
    {
        case 'apexY':
            // Return value uses Schaffer classificaton (although visibility is based on Scheie)
            var returnValue = "4";
            if (-_value >= riro) returnValue = "3";
            if (-_value >= rcbo) returnValue = "2";
            if (-_value >= rtmo) returnValue = "1";
            if (-_value >= rsli) returnValue = "0";
            returnArray['grade'] = returnValue;
            returnArray['seen'] = (-_value >= rtmo) ? 'No' : 'Yes';
            break;
            
        case 'grade':
            var returnValue = "";
            switch (_value)
            {
                case '0':
                    if (-this.apexY >= rsli) returnValue = this.apexY;
                    else returnValue = -rsli;
                    break;
                case '1':
                    if (-this.apexY >= rtmo && -this.apexY < rsli) returnValue = this.apexY;
                    else returnValue = -rtmo;
                    break;
                case '2':
                    if (-this.apexY >= rcbo && -this.apexY < rtmo) returnValue = this.apexY;
                    else returnValue = -360; //-rcbo;
                    break;
                case '3':
                    if (-this.apexY >= riro && -this.apexY < rcbo) returnValue = this.apexY;
                    else returnValue = -230; //-riro;
                    break;
                case '4':
                    if (-this.apexY >= riri && -this.apexY < riro) returnValue = this.apexY;
                    else returnValue= -riri;
                    break;
            }
            returnArray['apexY'] = returnValue;
            break;
            
        case 'seen':
            var returnValue = "";
            switch (_value)
            {
                case 'No':
                    if (-this.apexY >= rtmo) returnValue = this.apexY;
                    else returnValue = -rtmo;
                    break;
                case 'Yes':
                    if (-this.apexY < rtmo) returnValue = this.apexY;
                    else returnValue = -riri;
                    break;
            }
            returnArray['apexY'] = returnValue;
            break;
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.AngleGradeEast.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.AngleGradeEast.superclass.draw.call(this, _point);
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
	// Boundary path
	ctx.beginPath();
    
    // Arc across, move to inner and arc back
	ctx.arc(0, 0, -this.apexY, arcStart, arcEnd, true);
	ctx.arc(0, 0, rpu, arcEnd, arcStart, false);
    ctx.closePath();
    
    // Set fill attributes (same colour as Iris)
    ctx.fillStyle = "rgba(100, 200, 250, 1.0)";
	ctx.strokeStyle = "rgba(100, 100, 100, 1.0)";
    ctx.lineWidth = 4;
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * AngleGradeSouth
 *
 * @class AngleGradeSouth
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.AngleGradeSouth = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "AngleGradeSouth";
    
    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.grade = "4";
    this.seen = "Yes";
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.AngleGradeSouth.prototype = new ED.Doodle;
ED.AngleGradeSouth.prototype.constructor = ED.AngleGradeSouth;
ED.AngleGradeSouth.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.AngleGradeSouth.prototype.setHandles = function()
{
    this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.AngleGradeSouth.prototype.setPropertyDefaults = function()
{
    this.isDeletable = false;
	this.isScaleable = false;
	this.isMoveable = false;
	this.isRotatable = false;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-rsli, -riri);
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['grade'] = {kind:'derived', type:'string', list:['4', '3', '2', '1', '0'], animate:true};
    this.parameterValidationArray['seen'] = {kind:'derived', type:'string', list:['Yes', 'No'], animate:true};
}

/**
 * Sets default parameters
 */
ED.AngleGradeSouth.prototype.setParameterDefaults = function()
{
    this.arc = 90 * Math.PI/180;
    this.apexY = -riri;
    this.rotation = Math.PI;
    this.setParameterFromString('grade', '4');
    this.setParameterFromString('seen', 'Yes');
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if their 'animate' property is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.AngleGradeSouth.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();
    
    switch (_parameter)
    {
        case 'apexY':
            // Return value uses Schaffer classificaton (although visibility is based on Scheie)
            var returnValue = "4";
            if (-_value >= riro) returnValue = "3";
            if (-_value >= rcbo) returnValue = "2";
            if (-_value >= rtmo) returnValue = "1";
            if (-_value >= rsli) returnValue = "0";
            returnArray['grade'] = returnValue;
            returnArray['seen'] = (-_value >= rtmo) ? 'No' : 'Yes';
            break;
            
        case 'grade':
            var returnValue = "";
            switch (_value)
            {
                case '0':
                    if (-this.apexY >= rsli) returnValue = this.apexY;
                    else returnValue = -rsli;
                    break;
                case '1':
                    if (-this.apexY >= rtmo && -this.apexY < rsli) returnValue = this.apexY;
                    else returnValue = -rtmo;
                    break;
                case '2':
                    if (-this.apexY >= rcbo && -this.apexY < rtmo) returnValue = this.apexY;
                    else returnValue = -360; //-rcbo;
                    break;
                case '3':
                    if (-this.apexY >= riro && -this.apexY < rcbo) returnValue = this.apexY;
                    else returnValue = -230; //-riro;
                    break;
                case '4':
                    if (-this.apexY >= riri && -this.apexY < riro) returnValue = this.apexY;
                    else returnValue= -riri;
                    break;
            }
            returnArray['apexY'] = returnValue;
            break;
            
        case 'seen':
            var returnValue = "";
            switch (_value)
            {
                case 'No':
                    if (-this.apexY >= rtmo) returnValue = this.apexY;
                    else returnValue = -rtmo;
                    break;
                case 'Yes':
                    if (-this.apexY < rtmo) returnValue = this.apexY;
                    else returnValue = -riri;
                    break;
            }
            returnArray['apexY'] = returnValue;
            break;
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.AngleGradeSouth.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.AngleGradeSouth.superclass.draw.call(this, _point);
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
	// Boundary path
	ctx.beginPath();
    
    // Arc across, move to inner and arc back
	ctx.arc(0, 0, -this.apexY, arcStart, arcEnd, true);
	ctx.arc(0, 0, rpu, arcEnd, arcStart, false);
    ctx.closePath();
    
    // Set fill attributes (same colour as Iris)
    ctx.fillStyle = "rgba(100, 200, 250, 1.0)";
	ctx.strokeStyle = "rgba(100, 100, 100, 1.0)";
    ctx.lineWidth = 4;
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * AngleGradeWest
 *
 * @class AngleGradeWest
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.AngleGradeWest = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "AngleGradeWest";
    
    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.grade = "4";
    this.seen = "Yes";
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.AngleGradeWest.prototype = new ED.Doodle;
ED.AngleGradeWest.prototype.constructor = ED.AngleGradeWest;
ED.AngleGradeWest.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.AngleGradeWest.prototype.setHandles = function()
{
    this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.AngleGradeWest.prototype.setPropertyDefaults = function()
{
    this.isDeletable = false;
	this.isScaleable = false;
	this.isMoveable = false;
	this.isRotatable = false;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-rsli, -riri);
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['grade'] = {kind:'derived', type:'string', list:['4', '3', '2', '1', '0'], animate:true};
    this.parameterValidationArray['seen'] = {kind:'derived', type:'string', list:['Yes', 'No'], animate:true};
}

/**
 * Sets default parameters
 */
ED.AngleGradeWest.prototype.setParameterDefaults = function()
{
    this.arc = 90 * Math.PI/180;
    this.apexY = -riri;
    this.rotation = 3 * Math.PI/2;
    this.setParameterFromString('grade', '4');
    this.setParameterFromString('seen', 'Yes');
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if their 'animate' property is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.AngleGradeWest.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();
    
    switch (_parameter)
    {
        case 'apexY':
            // Return value uses Schaffer classificaton (although visibility is based on Scheie)
            var returnValue = "4";
            if (-_value >= riro) returnValue = "3";
            if (-_value >= rcbo) returnValue = "2";
            if (-_value >= rtmo) returnValue = "1";
            if (-_value >= rsli) returnValue = "0";
            returnArray['grade'] = returnValue;
            returnArray['seen'] = (-_value >= rtmo) ? 'No' : 'Yes';
            break;
            
        case 'grade':
            var returnValue = "";
            switch (_value)
            {
                case '0':
                    if (-this.apexY >= rsli) returnValue = this.apexY;
                    else returnValue = -rsli;
                    break;
                case '1':
                    if (-this.apexY >= rtmo && -this.apexY < rsli) returnValue = this.apexY;
                    else returnValue = -rtmo;
                    break;
                case '2':
                    if (-this.apexY >= rcbo && -this.apexY < rtmo) returnValue = this.apexY;
                    else returnValue = -360; //-rcbo;
                    break;
                case '3':
                    if (-this.apexY >= riro && -this.apexY < rcbo) returnValue = this.apexY;
                    else returnValue = -230; //-riro;
                    break;
                case '4':
                    if (-this.apexY >= riri && -this.apexY < riro) returnValue = this.apexY;
                    else returnValue= -riri;
                    break;
            }
            returnArray['apexY'] = returnValue;
            break;
            
        case 'seen':
            var returnValue = "";
            switch (_value)
            {
                case 'No':
                    if (-this.apexY >= rtmo) returnValue = this.apexY;
                    else returnValue = -rtmo;
                    break;
                case 'Yes':
                    if (-this.apexY < rtmo) returnValue = this.apexY;
                    else returnValue = -riri;
                    break;
            }
            returnArray['apexY'] = returnValue;
            break;
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.AngleGradeWest.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.AngleGradeWest.superclass.draw.call(this, _point);
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
	// Boundary path
	ctx.beginPath();
    
    // Arc across, move to inner and arc back
	ctx.arc(0, 0, -this.apexY, arcStart, arcEnd, true);
	ctx.arc(0, 0, rpu, arcEnd, arcStart, false);
    ctx.closePath();
    
    // Set fill attributes (same colour as Iris)
    ctx.fillStyle = "rgba(100, 200, 250, 1.0)";
	ctx.strokeStyle = "rgba(100, 100, 100, 1.0)";
    ctx.lineWidth = 4;
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Angle New Vessels
 *
 * @class AngleNV
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.AngleNV = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "AngleNV";

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.AngleNV.prototype = new ED.Doodle;
ED.AngleNV.prototype.constructor = ED.AngleNV;
ED.AngleNV.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.AngleNV.prototype.setHandles = function()
{
	this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Arc, false);
}

/**
 * Sets default dragging attributes
 */
ED.AngleNV.prototype.setPropertyDefaults = function()
{
	this.isScaleable = false;
	this.isMoveable = false;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(+50, +250);
}

/**
 * Sets default parameters
 */
ED.AngleNV.prototype.setParameterDefaults = function()
{
    this.arc = 30 * Math.PI/180;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.AngleNV.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.AngleNV.superclass.draw.call(this, _point);
    
    // AngleNV is at equator
    var ras = rtmo;
	var rir = rtmi;
    var r = rir + (ras - rir)/2;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
    // Coordinates of 'corners' of AngleNV
	var topRightX = r * Math.sin(theta);
	var topRightY = - r * Math.cos(theta);
	var topLeftX = - r * Math.sin(theta);
	var topLeftY = topRightY;
    
	// Boundary path
	ctx.beginPath();
    
	// Path
	ctx.arc(0, 0, rir, arcStart, arcEnd, true);
	ctx.arc(0, 0, ras, arcEnd, arcStart, false);
    
	// Close path
	ctx.closePath();
    
    // create pattern
    var ptrn = ctx.createPattern(this.drawing.imageArray['NewVesselPattern'],'repeat');
    ctx.fillStyle = ptrn;
	ctx.strokeStyle = "rgba(255, 255, 255, 0)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(new ED.Point(topLeftX, topLeftY));
	this.handleArray[3].location = this.transform.transformPoint(new ED.Point(topRightX, topRightY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a String which, if not empty, determines the root descriptions of multiple instances of the doodle
 *
 * @returns {String} Group description
 */
ED.AngleNV.prototype.groupDescription = function()
{
    // Calculate total extent in degrees
    var degrees = this.drawing.totalDegreesExtent(this.className);
    
    // Return string
    return "Angle new vessels over " + degrees.toString() + " degrees";
}

/**
 * Anterior Synechiae
 *
 * @class AntSynech
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.AntSynech = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "AntSynech";

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.AntSynech.prototype = new ED.Doodle;
ED.AntSynech.prototype.constructor = ED.AntSynech;
ED.AntSynech.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.AntSynech.prototype.setHandles = function()
{
	this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Arc, false);
    this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.AntSynech.prototype.setPropertyDefaults = function()
{
	this.isScaleable = false;
	this.isMoveable = false;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-rsli, -rcbo);
    this.parameterValidationArray['arc']['range'].setMinAndMax(30 * Math.PI/180, Math.PI*2);
}

/**
 * Sets default parameters
 */
ED.AntSynech.prototype.setParameterDefaults = function()
{
    this.arc = 30 * Math.PI/180;
    this.apexY = -rtmi;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.AntSynech.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.AntSynech.superclass.draw.call(this, _point);
    
    // AntSynech is at equator
    var ras = -this.apexY;
	var rir = riri;
    
    var r = rir + (ras - rir)/2;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    var outArcStart = - Math.PI/2 + theta - Math.PI/14;
    var outArcEnd = - Math.PI/2 - theta + Math.PI/14;
    
    // Coordinates of 'corners' of AntSynech
	var topRightX = rir * Math.sin(theta);
	var topRightY = - rir * Math.cos(theta);
	var topLeftX = - rir * Math.sin(theta);
	var topLeftY = topRightY;
    
	// Boundary path
	ctx.beginPath();
    
	// Path
	ctx.arc(0, 0, rir, arcStart, arcEnd, true);
	ctx.arc(0, 0, ras, outArcEnd, outArcStart, false);
    
	// Close path
	ctx.closePath();
    
    ctx.fillStyle = "rgba(100, 200, 250, 1.0)";
	ctx.strokeStyle = "rgba(255, 255, 255, 0)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(new ED.Point(topLeftX, topLeftY));
	this.handleArray[3].location = this.transform.transformPoint(new ED.Point(topRightX, topRightY));
    this.handleArray[4].location = this.transform.transformPoint(new ED.Point(0, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a String which, if not empty, determines the root descriptions of multiple instances of the doodle
 *
 * @returns {String} Group description
 */
ED.AntSynech.prototype.groupDescription = function()
{
    // Calculate total extent in degrees
    var degrees = this.drawing.totalDegreesExtent(this.className);
    
    // Return string
    return "Anterior synechiae over " + degrees.toString() + " degrees";
}

/**
 * Angle Recession
 *
 * @class AngleRecession
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.AngleRecession = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
	
	// Set classname
	this.className = "AngleRecession";
}

/**
 * Sets superclass and constructor
 */
ED.AngleRecession.prototype = new ED.Doodle;
ED.AngleRecession.prototype.constructor = ED.AngleRecession;
ED.AngleRecession.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.AngleRecession.prototype.setHandles = function()
{
	this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Arc, false);
}

/**
 * Sets default dragging attributes
 */
ED.AngleRecession.prototype.setPropertyDefaults = function()
{
	this.isScaleable = false;
	this.isMoveable = false;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+0.125, +1.5);
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(+50, +250);
}

/**
 * Sets default parameters
 */
ED.AngleRecession.prototype.setParameterDefaults = function()
{
    this.arc = 30 * Math.PI/180;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.AngleRecession.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.AngleRecession.superclass.draw.call(this, _point);
    
    // AngleRecession is at equator
    var ras = riri - 30;
	var rir = riri;
    var r = rir + (ras - rir)/2;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    var outArcStart = - Math.PI/2 + theta - Math.PI/24;
    var outArcEnd = - Math.PI/2 - theta + Math.PI/24;
    
    // Coordinates of 'corners' of AngleRecession
	var topRightX = rir * Math.sin(theta);
	var topRightY = - rir * Math.cos(theta);
	var topLeftX = - rir * Math.sin(theta);
	var topLeftY = topRightY;
    
	// Boundary path
	ctx.beginPath();
    
	// Path
	ctx.arc(0, 0, rir, arcStart, arcEnd, true);
	ctx.arc(0, 0, ras, outArcEnd, outArcStart, false);
    
	// Close path
	ctx.closePath();
    
    ctx.fillStyle = "rgba(255, 255, 200, 1.0)";
	ctx.strokeStyle = "rgba(255, 255, 255, 0)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(new ED.Point(topLeftX, topLeftY));
	this.handleArray[3].location = this.transform.transformPoint(new ED.Point(topRightX, topRightY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a String which, if not empty, determines the root descriptions of multiple instances of the doodle
 *
 * @returns {String} Group description
 */
ED.AngleRecession.prototype.groupDescription = function()
{
    // Calculate total extent in degrees
    var degrees = this.drawing.totalDegreesExtent(this.className);
    
    // Return string
    return "Angle recession over " + degrees.toString() + " degrees";
}

/**
 * The optic disc
 *
 * @class OpticDisc
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.OpticDisc = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "OpticDisc";
    
    // Private parameters
    this.numberOfHandles = 8;
    
    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.mode = "Basic";
    this.cdRatio = '0';

    this.savedParams = ['mode'];
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
    
    // Set visibility of handles
    //this.setHandleProperties();
}

/**
 * Sets superclass and constructor
 */
ED.OpticDisc.prototype = new ED.Doodle;
ED.OpticDisc.prototype.constructor = ED.OpticDisc;
ED.OpticDisc.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.OpticDisc.prototype.setHandles = function()
{
    // Array of handles for expert mode
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        this.handleArray[i] = new ED.Handle(null, true, ED.Mode.Handles, false);
    }
    
    // Apex handle for basic mode
    this.handleArray[this.numberOfHandles] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default properties
 */
ED.OpticDisc.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
	this.isRotatable = false;
    this.isDeletable = false;
    this.isUnique = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-320, -20);
    this.parameterValidationArray['radius']['range'].setMinAndMax(50, 290);
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['mode'] = {kind:'derived', type:'string', list:['Basic', 'Expert'], animate:false};
    this.parameterValidationArray['cdRatio'] = {kind:'derived', type:'string', list:['0.1','0.2','0.3','0.4','0.5','0.6','0.7','0.8','0.9','1.0','No view'], animate:true};
    
    // Create ranges to constrain handles
    this.handleVectorRangeArray = new Array();
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        // Full circle in radians
        var cir = 2 * Math.PI;
        
        // Create a range object for each handle
        var range = new Object;
        range.length = new ED.Range(+50, +290);
        range.angle = new ED.Range(((15 * cir/16) + i * cir/8) % cir, ((1 * cir/16) + i * cir/8) % cir);
        this.handleVectorRangeArray[i] = range;
    }
}

/**
 * Sets default parameters
 */
ED.OpticDisc.prototype.setParameterDefaults = function()
{
    this.apexY = -150;    
    this.setParameterFromString('mode', 'Basic');
    this.setParameterFromString('cdRatio', '0.5');

    // Create a squiggle to store the handles points
    var squiggle = new ED.Squiggle(this, new ED.Colour(100, 100, 100, 1), 4, true);

    // Add it to squiggle array
    this.squiggleArray.push(squiggle);
    
    // Populate with handles at equidistant points around circumference
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        var point = new ED.Point(0, 0);
        point.setWithPolars(-this.apexY, i * 2 * Math.PI/this.numberOfHandles);
        this.addPointToSquiggle(point);
    }
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if the 'animate' property in the parameterValidationArray is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.OpticDisc.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();
    
    switch (_parameter)
    {
        case 'mode':
//			This is commented out since it was causing recursive setting of cdRation and altering position of points in expert mode
//			Not sure what the code did in the first place anyway!
//             this.setHandleProperties();
//             if (this.apexY < -300)
//             {
//                 returnArray['cdRatio'] = "No view";
//             }
//             else
//             {
//                 returnArray['cdRatio'] = (-this.apexY/300).toFixed(1);
//             }
//             console.log("mode: Setting cdRatio to " + returnArray['cdRatio']);
            break;
                        
        case 'apexY':
            if (_value < -300)
            {
                returnArray['cdRatio'] = "No view";
            }
            else
            {
                returnArray['cdRatio'] = (-_value/300).toFixed(1);
            }
            break;
            
        case 'cdRatio':
            if (_value != "No view")
            {
                var newValue = parseFloat(_value) * 300;
                returnArray['apexY'] = -newValue;
                
                // Alter position of top and bottom points accordingly, then average the others
                if (this.mode == "Expert")
                {
                    var ti = 0;
                    var bi = this.numberOfHandles/2;
                    var meanOldValue = (this.squiggleArray[0].pointsArray[ti].length() + this.squiggleArray[0].pointsArray[bi].length())/2;
                    this.squiggleArray[0].pointsArray[ti].setWithPolars(newValue, this.squiggleArray[0].pointsArray[ti].direction());
                    this.squiggleArray[0].pointsArray[bi].setWithPolars(newValue, this.squiggleArray[0].pointsArray[bi].direction());
                    
                    // Adjust others proportionately
                    for (var i = 0; i < this.numberOfHandles; i++)
                    {
                        if (i != ti && i != bi)
                        {
                            var newLength = this.squiggleArray[0].pointsArray[i].length() * newValue/meanOldValue;
                            newLength = newLength>300?300:newLength;
                            this.squiggleArray[0].pointsArray[i].setWithPolars(newLength, this.squiggleArray[0].pointsArray[i].direction());
                        }
                    }
                }
            }
            else
            {
                returnArray['apexY'] = -320;
            }
            break;
            
        case 'handles':
            // Sum distances of (vertical) control points from centre
            var sum = 0;
            sum += this.squiggleArray[0].pointsArray[0].length();
            sum += this.squiggleArray[0].pointsArray[this.numberOfHandles/2].length();
            returnArray['apexY'] = -Math.round(sum/2);
            var ratio = Math.round(10 * sum/(300 * 2))/10;
            returnArray['cdRatio'] = ratio.toFixed(1);
            break;
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.OpticDisc.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.OpticDisc.superclass.draw.call(this, _point);
    
	// Radius of disc
	var ro = 300;
    var ri = -this.apexY;
	
	// Calculate parameters for arcs
	var arcStart = 0;
	var arcEnd = 2 * Math.PI;
    
	// Boundary path
	ctx.beginPath();
    
	// Do a 360 arc
	ctx.arc(0, 0, ro, arcStart, arcEnd, true);
	
	// Close path
	ctx.closePath();
    
    // Set attributes
	ctx.lineWidth = 2;
    var ptrn = ctx.createPattern(this.drawing.imageArray['CribriformPattern'],'repeat');
    ctx.fillStyle = ptrn;
	ctx.strokeStyle = "gray";
    
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
	// Non boundary drawing
    if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
		// Begin path
		ctx.beginPath();
        
		// Do a 360 arc
		ctx.arc(0, 0, ro, arcStart, arcEnd, true);
		
	    if (this.mode == "Basic")
	    {
	        // Move to inner circle
		    ctx.moveTo(ri, 0);
		    
			// Arc back the other way
			ctx.arc(0, 0, ri, arcEnd, arcStart, false);
	    }
	    else
	    {
	        // Bezier points
	        var fp;
	        var tp;
	        var cp1;
	        var cp2;
            
	        // Angle of control point from radius line to point (this value makes path a circle Math.PI/12 for 8 points
	        var phi = 2 * Math.PI/(3 * this.numberOfHandles);
            
	        // Start curve
	        ctx.moveTo(this.squiggleArray[0].pointsArray[0].x, this.squiggleArray[0].pointsArray[0].y);
	        
	        // Complete curve segments
	        for (var i = 0; i < this.numberOfHandles; i++)
	        {
	            // From and to points
	            fp = this.squiggleArray[0].pointsArray[i];
	            var toIndex = (i < this.numberOfHandles - 1)?i + 1:0;
	            tp = this.squiggleArray[0].pointsArray[toIndex];
	            
	            // Control points
	            cp1 = fp.tangentialControlPoint(+phi);
	            cp2 = tp.tangentialControlPoint(-phi);
	            
	            // Draw Bezier curve
	            ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, tp.x, tp.y);
	        }
	    }
        
        ctx.closePath();
        
	    // Set margin attributes
	    var colour = new ED.Colour(0,0,0,1);
	    colour.setWithHexString('FFA83C');  // Taken from disc margin of a fundus photo
	    ctx.fillStyle = colour.rgba();
        
        // Draw disc margin
        ctx.fill();
        
        // Disc vessels
        ctx.beginPath();
        
        // Vessels start on nasal side of disc
        var sign;
        if (this.drawing.eye == ED.eye.Right)
        {
            sign = -1;
        }
        else
        {
            sign = 1;
        }
        
        // Superotemporal vessel
        var startPoint = new ED.Point(0,0);
        startPoint.setWithPolars(150, - sign * Math.PI/2);
        
        var controlPoint1 = new ED.Point(0,0);
        controlPoint1.setWithPolars(400, - sign * Math.PI/8);
        var controlPoint2 = new ED.Point(0,0);
        controlPoint2.setWithPolars(450, sign * Math.PI/8);
        
        var endPoint = new ED.Point(0,0);
        endPoint.setWithPolars(500, sign * Math.PI/4);
        
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endPoint.x, endPoint.y);
        
        // Inferotemporal vessel
        var startPoint = new ED.Point(0,0);
        startPoint.setWithPolars(150, - sign * Math.PI/2);
        
        var controlPoint1 = new ED.Point(0,0);
        controlPoint1.setWithPolars(400, - sign * 7 * Math.PI/8);
        var controlPoint2 = new ED.Point(0,0);
        controlPoint2.setWithPolars(450, sign * 7 * Math.PI/8);
        
        var endPoint = new ED.Point(0,0);
        endPoint.setWithPolars(500, sign * 3 * Math.PI/4);
        
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endPoint.x, endPoint.y);
        
        // Superonasal vessel
        var startPoint = new ED.Point(0,0);
        startPoint.setWithPolars(150, - sign * Math.PI/2);
        
        var controlPoint1 = new ED.Point(0,0);
        controlPoint1.setWithPolars(300, - sign * 2 *  Math.PI/8);
        var controlPoint2 = new ED.Point(0,0);
        controlPoint2.setWithPolars(350, -sign * 5 * Math.PI/16);
        
        var endPoint = new ED.Point(0,0);
        endPoint.setWithPolars(450, - sign * 3 * Math.PI/8);
        
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endPoint.x, endPoint.y);
        
        // Inferonasal vessel
        var startPoint = new ED.Point(0,0);
        startPoint.setWithPolars(150, - sign * Math.PI/2);
        
        var controlPoint1 = new ED.Point(0,0);
        controlPoint1.setWithPolars(300, - sign * 6 *  Math.PI/8);
        var controlPoint2 = new ED.Point(0,0);
        controlPoint2.setWithPolars(350, -sign * 11 * Math.PI/16);
        
        var endPoint = new ED.Point(0,0);
        endPoint.setWithPolars(450, - sign * 5 * Math.PI/8);
        
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endPoint.x, endPoint.y);
        
        // Line attributes
        ctx.lineWidth = 48;
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        
        // Draw line
        ctx.stroke();
        
        // Obscure whole disc if no view
        if (this.cdRatio == "No view")
        {
            // disk to obscure disc
            ctx.beginPath();
            ctx.arc(0, 0, 400, 0, 2 * Math.PI, true);
            ctx.closePath();
            ctx.fillStyle = "gray";
            ctx.fill();
        }
    }
    
	// Coordinates of expert handles (in canvas plane)
    if (this.mode == "Expert")
    {
        for (var i = 0; i < this.numberOfHandles; i++)
        {
            this.handleArray[i].location = this.transform.transformPoint(this.squiggleArray[0].pointsArray[i]);
        }
    }
    
    // Location of apex handle
    this.handleArray[this.numberOfHandles].location = this.transform.transformPoint(new ED.Point(0, this.apexY));
    
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.OpticDisc.prototype.description = function()
{
    var returnString = "";
    
    // Expert mode 
    if (this.mode == "Expert")
    {        
        // Get mean
        var mean = this.getMeanRadius();
        
        // Look for notches by detecting outliers
        var notchArray = new Array();
        var inNotch = false;
        var notch;
        
        // Find a non-notch point to start with
        var s = 0;
        for (var i = 0; i < this.numberOfHandles; i++)
        {
            if (this.squiggleArray[0].pointsArray[i].length() < mean * 1.1)
            {
                s = i;
                break;
            }
        }
        
        // Iterate through points starting at a non-notch point
        for (var i = 0; i < this.numberOfHandles; i++)
        {
            var j = (i + s)%this.numberOfHandles;

            if (this.squiggleArray[0].pointsArray[j].length() > mean * 1.1)
            {
                if (!inNotch)
                {
                    notch = new Object();
                    notch.startHour = this.squiggleArray[0].pointsArray[j].clockHour();
                    notch.endHour = this.squiggleArray[0].pointsArray[j].clockHour();
                    inNotch = true;
                }
                else
                {
                    notch.endHour = this.squiggleArray[0].pointsArray[j].clockHour();
                }
            }
            else
            {
                if (inNotch)
                {
                    notchArray.push(notch);
                    inNotch = false;
                }
            }
            
            // Deal with boundary condition
            if (i == this.numberOfHandles -1)
            {
                if (inNotch)
                {
                    notch.endHour = this.squiggleArray[0].pointsArray[j].clockHour();
                    notchArray.push(notch);
                    inNotch = false;
                }
            }
        }
        
        // Turn into a sensible report
        if (notchArray.length > 0)
        {
            var many = (notchArray.length > 1);
            
            returnString = many?"Notches":"Notch";

            for (var i = 0; i < notchArray.length; i++)
            {
                if (notchArray[i].startHour == notchArray[i].endHour)
                {
                    returnString += " at " + notchArray[i].startHour;
                }
                else
                {
                    returnString += " from " + notchArray[i].startHour + " to " + notchArray[i].endHour + " o'clock";
                }
                
                if (many && i != notchArray.length - 1)
                {
                    returnString += ", and";
                }
            }
        }
        else
		{
			returnString = this.drawing.doodleArray.length == 1?"No abnormality":"";
		}
    }
    // Basic mode
    else
    {
		returnString = this.drawing.doodleArray.length == 1?"No abnormality":"";
    }

	return returnString;
}

/**
 * Defines handles visibility
 */
ED.OpticDisc.prototype.setHandleProperties = function()
{
    // Basic mode
    if (this.mode == "Basic")
    {
        // Make handles invisible, except for apex handle
        for (var i = 0; i < this.numberOfHandles; i++)
        {
            this.handleArray[i].isVisible = false;
        }
        this.handleArray[this.numberOfHandles].isVisible = true;
        
        // Set to mean of expert handles
        this.apexY = -this.getMeanRadius();
    }
    // Expert mode
    else
    { 
        // Make handles visible, except for apex handle,
        for (var i = 0; i < this.numberOfHandles; i++)
        {
            this.handleArray[i].isVisible = true;
            
        }
        this.handleArray[this.numberOfHandles].isVisible = false;
        
        // Set points to mean
        this.setMeanRadius(-this.apexY);
    }
}

/**
 * Returns minimum radius
 *
 * @returns {Float} Minimum radius regardless of mode
 */
ED.OpticDisc.prototype.minimumRadius = function()
{
    var returnValue = 500;
    
    if (this.mode == "Basic")
    {
        returnValue = Math.abs(this.apexY);
    }
    else
    {        
        // Iterate through points
        for (var i = 0; i < this.numberOfHandles; i++)
        {
            // Calculate minimum radius
            var radius = this.squiggleArray[0].pointsArray[i].length();

            if (radius < returnValue)
            {
                returnValue = radius;
            }
        }
    }
    
    return returnValue;
}

/**
 * Returns mean radius
 *
 * @returns {Float} Mean radius of handle points
 */
ED.OpticDisc.prototype.getMeanRadius = function()
{
    // Sum distances of (vertical) control points from centre
    if (typeof(this.squiggleArray[0]) != 'undefined')
    {
//        var sum = 0;
//        var ti = 0;
//        var bi = this.numberOfHandles/2;
//        sum += this.squiggleArray[0].pointsArray[ti].length();
//        sum += this.squiggleArray[0].pointsArray[bi].length();
//        return sum/2;
        
        var sum = 0;
        for (var i = 0; i < this.numberOfHandles; i++)
        {
            sum += this.squiggleArray[0].pointsArray[i].length();
        }
        return sum/this.numberOfHandles;
    }
    else
    {
        return -this.apexY;
    }
}

/**
 * Sets radius of handle points
 *
 *@param {Float} _radius Value to set
 */
ED.OpticDisc.prototype.setMeanRadius = function(_radius)
{
    // Get current mean
    var mean = this.getMeanRadius();
    
    // Go through scaling each point according to new mean
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        // Get current length and direction
        var length = this.squiggleArray[0].pointsArray[i].length();
        var direction = this.squiggleArray[0].pointsArray[i].direction();

        // Calculate new length
        var newLength = length * _radius/mean;
        newLength = newLength > 300?300:newLength;
        
        // Set point
        this.squiggleArray[0].pointsArray[i].setWithPolars(newLength, direction);
    }
}

/**
 * Peripapillary atrophy
 *
 * @class PeripapillaryAtrophy
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.PeripapillaryAtrophy = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "PeripapillaryAtrophy";
    
    // Private parameters
    this.outerRadius = 340;

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.PeripapillaryAtrophy.prototype = new ED.Doodle;
ED.PeripapillaryAtrophy.prototype.constructor = ED.PeripapillaryAtrophy;
ED.PeripapillaryAtrophy.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.PeripapillaryAtrophy.prototype.setHandles = function()
{
    this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Handles, false);
    this.handleArray[1] = new ED.Handle(null, true, ED.Mode.Handles, false);
    this.handleArray[2] = new ED.Handle(null, true, ED.Mode.Handles, false);
    this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Handles, false);
}

/**
 * Sets default dragging attributes
 */
ED.PeripapillaryAtrophy.prototype.setPropertyDefaults = function()
{
	this.isScaleable = false;
	this.isMoveable = false;
    this.addAtBack = true;
    this.isUnique = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['rotation']['range'].setMinAndMax(7 * Math.PI/4, Math.PI/4);
    
    // Create ranges to constrain handles
    this.handleCoordinateRangeArray = new Array();

    var max = this.outerRadius * 1.4;
    var min = this.outerRadius;
    this.handleCoordinateRangeArray[0] = {x:new ED.Range(-max, -min), y:new ED.Range(-0, +0)};
    this.handleCoordinateRangeArray[1] = {x:new ED.Range(-0, +0), y:new ED.Range(-max, -min)};
    this.handleCoordinateRangeArray[2] = {x:new ED.Range(min, max), y:new ED.Range(-0, +0)};
    this.handleCoordinateRangeArray[3] = {x:new ED.Range(-0, +0), y:new ED.Range(min, max)};
}

/**
 * Sets default parameters
 */
ED.PeripapillaryAtrophy.prototype.setParameterDefaults = function()
{
    // Create a squiggle to store the handles points
    var squiggle = new ED.Squiggle(this, new ED.Colour(100, 100, 100, 1), 4, true);
    
    // Add it to squiggle array
    this.squiggleArray.push(squiggle);

    // Add four points to the squiggle
    this.addPointToSquiggle(new ED.Point(-this.outerRadius - (this.drawing.eye == ED.eye.Right?100:0), 0));
    this.addPointToSquiggle(new ED.Point(0, -this.outerRadius));
    this.addPointToSquiggle(new ED.Point(this.outerRadius + (this.drawing.eye == ED.eye.Right?0:100), 0));
    this.addPointToSquiggle(new ED.Point(0, this.outerRadius));
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.PeripapillaryAtrophy.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.PeripapillaryAtrophy.superclass.draw.call(this, _point);
    
	// Boundary path
	ctx.beginPath();
	
	// PeripapillaryAtrophy
    var f = 0.55;   // Gives a circular bezier curve
    var fromX;
    var fromY;
    var toX;
    var toY;
    
    // Top left curve
    fromX = this.squiggleArray[0].pointsArray[0].x;
    fromY = this.squiggleArray[0].pointsArray[0].y;
    toX = this.squiggleArray[0].pointsArray[1].x;
    toY = this.squiggleArray[0].pointsArray[1].y;
    ctx.moveTo(fromX, fromY);
    ctx.bezierCurveTo(fromX, fromX * f, toY * f, toY, toX, toY);
    
    // Top right curve
    fromX = toX;
    fromY = toY;
    toX = this.squiggleArray[0].pointsArray[2].x;
    toY = this.squiggleArray[0].pointsArray[2].y;
    ctx.bezierCurveTo(-fromY * f, fromY, toX, -toX * f, toX, toY);
    
    // Bottom right curve
    fromX = toX;
    fromY = toY;
    toX = this.squiggleArray[0].pointsArray[3].x;
    toY = this.squiggleArray[0].pointsArray[3].y;
    ctx.bezierCurveTo(fromX, fromX * f, toY * f, toY, toX, toY);
    
    // Bottom left curve
    fromX = toX;
    fromY = toY;
    toX = this.squiggleArray[0].pointsArray[0].x;
    toY = this.squiggleArray[0].pointsArray[0].y;
    ctx.bezierCurveTo(-fromY * f, fromY, toX, -toX * f, toX, toY);
    
    // Only fill to margin, to allow cup to sit behind giving disc margin
    ctx.moveTo(280, 00);
    ctx.arc(0, 0, 280, 0, Math.PI*2, true);
    
	// Close path
	ctx.closePath();
	
	// Set attributes
	ctx.lineWidth = 2;
    var colour = new ED.Colour(0,0,0,1);
    colour.setWithHexString('DFD989');
    ctx.fillStyle = colour.rgba();
	ctx.strokeStyle = "gray";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
	// Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(this.squiggleArray[0].pointsArray[0]);
	this.handleArray[1].location = this.transform.transformPoint(this.squiggleArray[0].pointsArray[1]);
	this.handleArray[2].location = this.transform.transformPoint(this.squiggleArray[0].pointsArray[2]);
	this.handleArray[3].location = this.transform.transformPoint(this.squiggleArray[0].pointsArray[3]);
    
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.PeripapillaryAtrophy.prototype.description = function()
{
    var returnString = "";
	
    // Get distances of control points from centre
    var left = - this.squiggleArray[0].pointsArray[0].x;
    var top = - this.squiggleArray[0].pointsArray[1].y;
    var right = this.squiggleArray[0].pointsArray[2].x;
    var bottom = this.squiggleArray[0].pointsArray[3].y;
    
    // Get maximum control point, and its sector
    var sector = "";
    var max = this.radius;
    if (left > max)
    {
        max = left;
        sector = (this.drawing.eye == ED.eye.Right)?"temporally":"nasally";
    }
    if (top > max)
    {
        max = top;
        sector = "superiorly";
    }
    if (right > max)
    {
        max = right;
        sector = (this.drawing.eye == ED.eye.Right)?"nasally":"temporally";
    }
    if (bottom > max)
    {
        max = bottom;
        sector = "inferiorly";
    }
    
    // Grade degree of atrophy
    if (max > this.radius)
    {
        var degree = "Mild";
        if (max > 350) degree = "Moderate";
        if (max > 400) degree = "Signficant";
        returnString += degree;
        returnString += " peri-papillary atrophy, maximum ";
        returnString += sector;
    }
	
	return returnString;
}

/**
 * Nerve Fibre Defect
 *
 * @class NerveFibreDefect
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.NerveFibreDefect = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "NerveFibreDefect";
	
	// Call super-class constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.NerveFibreDefect.prototype = new ED.Doodle;
ED.NerveFibreDefect.prototype.constructor = ED.NerveFibreDefect;
ED.NerveFibreDefect.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.NerveFibreDefect.prototype.setHandles = function()
{
	this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.NerveFibreDefect.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-560, -400);
}

/**
 * Sets default parameters
 */
ED.NerveFibreDefect.prototype.setParameterDefaults = function()
{
    this.arc = 20 * Math.PI/180;
    this.apexY = -460;
    
    this.setRotationWithDisplacements(150,-120);
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.NerveFibreDefect.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.NerveFibreDefect.superclass.draw.call(this, _point);
    
	// Radius of outer curve
	var ro = -this.apexY;
    var ri = 360;
    var r = ri + (ro - ri)/2;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
    // Coordinates of 'corners' of NerveFibreDefect
	var topRightX = r * Math.sin(theta);
	var topRightY = - r * Math.cos(theta);
	var topLeftX = - r * Math.sin(theta);
	var topLeftY = topRightY;
    
	// Boundary path
	ctx.beginPath();
    
	// Arc across to mirror image point on the other side
	ctx.arc(0, 0, ro, arcStart, arcEnd, true);
    
	// Arc back to mirror image point on the other side
	ctx.arc(0, 0, ri, arcEnd, arcStart, false);
    
	// Close path
	ctx.closePath();
	
	// Set line attributes
	ctx.lineWidth = 4;
	ctx.fillStyle = "rgba(200, 200, 200, 0.75)";
	ctx.strokeStyle = "gray";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
	// Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(new ED.Point(topLeftX, topLeftY));
	this.handleArray[3].location = this.transform.transformPoint(new ED.Point(topRightX, topRightY));
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hit test
	return this.isClicked;
}

/**
 * Returns a String which, if not empty, determines the root descriptions of multiple instances of the doodle
 *
 * @returns {String} Group description
 */
ED.NerveFibreDefect.prototype.groupDescription = function()
{
	return  "Nerve fibre layer defect at ";
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.NerveFibreDefect.prototype.description = function()
{
    return this.clockHour() + " o'clock";
}

/**
 * Disc Haemorrhage
 *
 * @class DiscHaemorrhage
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.DiscHaemorrhage = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "DiscHaemorrhage";
	
	// Call super-class constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.DiscHaemorrhage.prototype = new ED.Doodle;
ED.DiscHaemorrhage.prototype.constructor = ED.DiscHaemorrhage;
ED.DiscHaemorrhage.superclass = ED.Doodle.prototype;

/**
 * Sets default dragging attributes
 */
ED.DiscHaemorrhage.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;

    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-490, -400);
}

/**
 * Sets default parameters
 */
ED.DiscHaemorrhage.prototype.setParameterDefaults = function()
{
    this.arc = 10 * Math.PI/180;
    this.apexY = -350;

    this.setRotationWithDisplacements(150,-120);
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.DiscHaemorrhage.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.DiscHaemorrhage.superclass.draw.call(this, _point);
    
	// Radius of outer curve just inside ora on right and left fundus diagrams
	var ro = -this.apexY;
    var ri = 250;
    var r = ri + (ro - ri)/2;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
    // Coordinates of 'corners' of DiscHaemorrhage
	var topRightX = r * Math.sin(theta);
	var topRightY = - r * Math.cos(theta);
	var topLeftX = - r * Math.sin(theta);
	var topLeftY = topRightY;
    
	// Boundary path
	ctx.beginPath();
    
	// Arc across to mirror image point on the other side
	ctx.arc(0, 0, ro, arcStart, arcEnd, true);
    
	// Arc back to mirror image point on the other side
	ctx.arc(0, 0, ri, arcEnd, arcStart, false);
    
	// Close path
	ctx.closePath();
	
	// Set line attributes
	ctx.lineWidth = 4;
	ctx.fillStyle = "red";
	ctx.strokeStyle = "red";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hit test
	return this.isClicked;
}

/**
 * Returns a String which, if not empty, determines the root descriptions of multiple instances of the doodle
 *
 * @returns {String} Group description
 */
ED.DiscHaemorrhage.prototype.groupDescription = function()
{
	return  "Disc haemorrhage at ";
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.DiscHaemorrhage.prototype.description = function()
{
	return this.clockHour() + " o'clock";
}

/**
 * OpticDiscPit Acquired Pit of Optic Nerve (APON)
 *
 * @class OpticDiscPit
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.OpticDiscPit = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "OpticDiscPit";

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.OpticDiscPit.prototype = new ED.Doodle;
ED.OpticDiscPit.prototype.constructor = ED.OpticDiscPit;
ED.OpticDiscPit.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.OpticDiscPit.prototype.setHandles = function()
{
    this.handleArray[2] = new ED.Handle(null, true, ED.Mode.Scale, false);
}

/**
 * Sets default dragging attributes
 */
ED.OpticDiscPit.prototype.setPropertyDefaults = function()
{
	this.isSqueezable = true;
    this.isUnique = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['originX']['range'].setMinAndMax(-150, +150);
    this.parameterValidationArray['originY']['range'].setMinAndMax(-150, +150);
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.5, +3);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+0.5, +3);
}

/**
 * Sets default parameters
 */
ED.OpticDiscPit.prototype.setParameterDefaults = function()
{
    this.originY = 130;
    this.apexY = 0;
    this.scaleX = 1.5;
    
    // Pits are usually STQ
    if(this.drawing.eye == ED.eye.Right)
    {
        this.originX = -50;
    }
    else
    {
        this.originX = 50;
    }
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.OpticDiscPit.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
    
	// Call draw method in superclass
	ED.OpticDiscPit.superclass.draw.call(this, _point);
    
	// Boundary path
	ctx.beginPath();
	
	// Round hole
    var r = 80;
	ctx.arc(0, 0, r, 0, Math.PI*2, true);
    
	// Close path
	ctx.closePath();
    
    // Radial gradient
    var lightGray = "rgba(200, 200, 200, 0.75)";
    var darkGray = "rgba(100, 100, 100, 0.75)";
    var gradient = ctx.createRadialGradient(0, 0, r, 0, 0, 10);
    gradient.addColorStop(0, darkGray);
    gradient.addColorStop(1, lightGray);
    
	ctx.fillStyle = gradient;
	ctx.lineWidth = 2;
	ctx.strokeStyle = "gray";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
    // Coordinates of handles (in canvas plane)
	this.handleArray[2].location = this.transform.transformPoint(new ED.Point(55, -55));
    
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
 	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.OpticDiscPit.prototype.description = function()
{
    return "Acquired pit of optic nerve";
}

/**
 * Disc Haemorrhage
 *
 * @class DiscPallor
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.DiscPallor = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "DiscPallor";

    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.grade = 'Sectorial';
	
	// Call super-class constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.DiscPallor.prototype = new ED.Doodle;
ED.DiscPallor.prototype.constructor = ED.DiscPallor;
ED.DiscPallor.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.DiscPallor.prototype.setHandles = function()
{
	this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Arc, false);
}

/**
 * Sets default dragging attributes
 */
ED.DiscPallor.prototype.setPropertyDefaults = function()
{
    this.isArcSymmetrical = true;
	this.isMoveable = false;
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['grade'] = {kind:'derived', type:'string', list:['Sectorial', 'Diffuse'], animate:true};
    
    // Speed up animation for arc
    this.parameterValidationArray['arc']['delta'] = 0.2;
}

/**
 * Sets default parameters
 */
ED.DiscPallor.prototype.setParameterDefaults = function()
{
    this.arc = 60 * Math.PI/180;
    this.setRotationWithDisplacements(45,-120);
    this.setParameterFromString('grade', 'Sectorial');
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if their 'animate' property is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.DiscPallor.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();
    
    switch (_parameter)
    {
        case 'arc':
            if (_value < 2 * Math.PI) returnArray['grade'] = 'Sectorial';
            else returnArray['grade'] = 'Diffuse';
            break;
            
        case 'grade':
            switch (_value)
            {
                case 'Sectorial':
                    if (this.arc < 2 * Math.PI) returnArray['arc'] = this.arc;
                    else returnArray['arc'] = Math.PI/2;
                    break;
                case 'Diffuse':
                    returnArray['arc'] = 2 * Math.PI;
                    break;
            }
            break;
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.DiscPallor.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.DiscPallor.superclass.draw.call(this, _point);
    
	// Radius of disc
	var ro = 300;
    
    // Get inner radius from OpticDisk doodle
    var opticDisc = this.drawing.firstDoodleOfClass('OpticDisc');
    if (opticDisc)
    {
        var ri = opticDisc.minimumRadius();
    }
    else
    {
        var ri = 150;
    }
    var r = ri + (ro - ri)/2;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
    // Coordinates of 'corners' of DiscPallor
	var topRightX = r * Math.sin(theta);
	var topRightY = - r * Math.cos(theta);
	var topLeftX = - r * Math.sin(theta);
	var topLeftY = topRightY;
    
	// Boundary path
	ctx.beginPath();
    
	// Arc across to mirror image point on the other side
	ctx.arc(0, 0, ro, arcStart, arcEnd, true);
    
	// Arc back to mirror image point on the other side
	ctx.arc(0, 0, ri, arcEnd, arcStart, false);
    
	// Close path
	ctx.closePath();
	
	// Set line attributes
	ctx.lineWidth = 1;
	ctx.fillStyle = "rgba(255,255,255,0.5)";
	ctx.strokeStyle = "rgba(255,255,255,0)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);

    // Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(new ED.Point(topLeftX, topLeftY));
	this.handleArray[3].location = this.transform.transformPoint(new ED.Point(topRightX, topRightY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hit test
	return this.isClicked;
}

/**
 * Returns a String which, if not empty, determines the root descriptions of multiple instances of the doodle
 *
 * @returns {String} Group description
 */
ED.DiscPallor.prototype.groupDescription = function()
{
    if (this.grade == 'Diffuse')
    {
        return "Diffuse disc pallor";
    }
    else
    {
        return  "Disc pallor at ";
    }
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.DiscPallor.prototype.description = function()
{
    if (this.grade == 'Diffuse')
    {
        return "";
    }
    else
    {
        return this.clockHour() + " o'clock";
    }
}

/**
 * Papilloedema
 *
 * @class Papilloedema
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.Papilloedema = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "Papilloedema";

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.Papilloedema.prototype = new ED.Doodle;
ED.Papilloedema.prototype.constructor = ED.Papilloedema;
ED.Papilloedema.superclass = ED.Doodle.prototype;

/**
 * Sets default dragging attributes
 */
ED.Papilloedema.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
	this.isRotatable = false;
    this.isUnique = true;
    this.addAtBack = true;
}

/**
 * Sets default parameters
 */
ED.Papilloedema.prototype.setParameterDefaults = function()
{
    this.radius = 375;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.Papilloedema.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.Papilloedema.superclass.draw.call(this, _point);
    
    var ro = this.radius + 75;
    var ri = this.radius - 75;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
	// Boundary path
	ctx.beginPath();
    
	// Arc across to mirror image point on the other side
	ctx.arc(0, 0, ro, 0, Math.PI * 2, true);
    
	// Arc back to mirror image point on the other side
	ctx.arc(0, 0, ri, Math.PI * 2, 0, false);
    
	// Close path
	ctx.closePath();
	
	// Set line attributes
	ctx.lineWidth = 0;
    
    // Colors for gradient
    yellowColour = "rgba(255, 255, 0, 0.75)";
    var brownColour = "rgba(240, 140, 40, 0.75)";
    
    // Radial gradient
    var gradient = ctx.createRadialGradient(0, 0, this.radius + 75, 0, 0, this.radius - 75);
    gradient.addColorStop(0, yellowColour);
    gradient.addColorStop(1, brownColour);
    
	ctx.fillStyle = gradient;
	ctx.strokeStyle = "rgba(0,0,0,0)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.Papilloedema.prototype.description = function()
{
	return "Papilloedema";
}

/**
 * Transillumination defect
 *
 * @class TransilluminationDefect
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.TransilluminationDefect = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "TransilluminationDefect";
    
	// Call super-class constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.TransilluminationDefect.prototype = new ED.Doodle;
ED.TransilluminationDefect.prototype.constructor = ED.TransilluminationDefect;
ED.TransilluminationDefect.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.TransilluminationDefect.prototype.setHandles = function()
{
	this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Arc, false);
}

/**
 * Set default properties
 */
ED.TransilluminationDefect.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['arc']['range'].setMinAndMax(Math.PI/8, Math.PI * 2);
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-400, -100);
}

/**
 * Sets default parameters (Only called for new doodles)
 * Use the setParameter function for derived parameters, as this will also update dependent variables
 */
ED.TransilluminationDefect.prototype.setParameterDefaults = function()
{
    this.arc = 360 * Math.PI/180;
    
    var doodle = this.drawing.lastDoodleOfClass(this.className);
    if (doodle)
    {
        this.rotation = doodle.rotation + (this.drawing.eye == ED.eye.Right?-1:1) * (doodle.arc/2 + this.arc/2 + Math.PI/12);
    }
    else
    {
        this.rotation = (this.drawing.eye == ED.eye.Right?-1:1) * this.arc/2;
    }
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.TransilluminationDefect.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.TransilluminationDefect.superclass.draw.call(this, _point);
    
	// Radius of outer curve just inside ora on right and left fundus diagrams
	var ro = 380;
    var ri = 280;
    var r = ri + (ro - ri)/2;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
    // Coordinates of 'corners' of TransilluminationDefect
	var topRightX = r * Math.sin(theta);
	var topRightY = - r * Math.cos(theta);
	var topLeftX = - r * Math.sin(theta);
	var topLeftY = topRightY;
    
	// Boundary path
	ctx.beginPath();
    
	// Arc across to mirror image point on the other side
	ctx.arc(0, 0, ro, arcStart, arcEnd, true);
    
	// Arc back to mirror image point on the other side
	ctx.arc(0, 0, ri, arcEnd, arcStart, false);
    
	// Close path
	ctx.closePath();
	
	// Set line attributes
	ctx.lineWidth = 4;
	ctx.fillStyle = "rgba(255,255,255,0)";
	ctx.strokeStyle = "rgba(255,255,255,0)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Non boundary drawing
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Spot data
        var sr = 30;
        var inc = Math.PI/8;
        
        // Iterate through radius and angle to draw spots
        for (var a = -Math.PI/2 - arcStart + inc/2; a < this.arc - Math.PI/2 - arcStart; a += inc )
        {
            var p = new ED.Point(0,0);
            p.setWithPolars(r, a);
            this.drawCircle(ctx, p.x, p.y, sr, "rgba(255,255,255,1)", 4, "rgba(255,255,255,1)");
        }
	}
    
	// Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(new ED.Point(topLeftX, topLeftY));
	this.handleArray[3].location = this.transform.transformPoint(new ED.Point(topRightX, topRightY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hit test
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.TransilluminationDefect.prototype.description = function()
{
	return "Transillumination defects of iris";
}

/**
 * Krukenberg's spindle
 *
 * @class KrukenbergSpindle
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.KrukenbergSpindle = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "KrukenbergSpindle";
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.KrukenbergSpindle.prototype = new ED.Doodle;
ED.KrukenbergSpindle.prototype.constructor = ED.KrukenbergSpindle;
ED.KrukenbergSpindle.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.KrukenbergSpindle.prototype.setHandles = function()
{
    this.handleArray[2] = new ED.Handle(null, true, ED.Mode.Scale, false);
}

/**
 * Sets default dragging attributes
 */
ED.KrukenbergSpindle.prototype.setPropertyDefaults = function()
{
	this.isSqueezable = true;
	this.isRotatable = false;
    this.isUnique = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.3, +0.6);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+1, +3);
}

/**
 * Sets default parameters
 */
ED.KrukenbergSpindle.prototype.setParameterDefaults = function()
{
    this.originY = 100;
    this.scaleX = 0.5;
    this.scaleY = 2;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.KrukenbergSpindle.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.KrukenbergSpindle.superclass.draw.call(this, _point);
	
	// Boundary path
	ctx.beginPath();
    
	// Krukenberg Spindle
    var r = 100;
	ctx.arc(0, 0, r, 0, Math.PI * 2, false);
    
	// Close path
	ctx.closePath();
    
    // Create fill
    ctx.fillStyle = "rgba(255,128,0,0.5)";
    
    // Stroke
	ctx.strokeStyle = "rgba(255,128,0,0.5)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Coordinates of handles (in canvas plane)
    var point = new ED.Point(0, 0);
    point.setWithPolars(r, Math.PI/4);
	this.handleArray[2].location = this.transform.transformPoint(point);

	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.KrukenbergSpindle.prototype.description = function()
{
    return "Krukenberg spindle";
}

/**
 * Posterior embryotoxon
 *
 * @class PosteriorEmbryotoxon
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.PosteriorEmbryotoxon = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "PosteriorEmbryotoxon";
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.PosteriorEmbryotoxon.prototype = new ED.Doodle;
ED.PosteriorEmbryotoxon.prototype.constructor = ED.PosteriorEmbryotoxon;
ED.PosteriorEmbryotoxon.superclass = ED.Doodle.prototype;

/**
 * Set default properties
 */
ED.PosteriorEmbryotoxon.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
	this.isRotatable = false;
    this.isUnique = true;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.PosteriorEmbryotoxon.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.PosteriorEmbryotoxon.superclass.draw.call(this, _point);
    
	// Radius of outer curve just inside pupil edge
	var ro = 370;
    var ri = 340;
	
	// Calculate parameters for arcs
	var arcStart = 0;
	var arcEnd = 2 * Math.PI;
    
	// Boundary path
	ctx.beginPath();
    
	// Arc across to mirror image point on the other side
	ctx.arc(0, 0, ro, arcStart, arcEnd, true);
    
	// Arc back to mirror image point on the other side
	ctx.arc(0, 0, ri, arcEnd, arcStart, false);
    
	// Close path
	ctx.closePath();
	
	// Set line attributes
	ctx.lineWidth = 0;
	ctx.fillStyle = "rgba(255,255,255,0.6)";
	ctx.strokeStyle = "rgba(255,255,255,0)";

	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
	// Return value indicating successful hit test
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.PosteriorEmbryotoxon.prototype.description = function()
{
    return "Posterior Embryotoxon";
}

/**
 * Keratic precipitates
 *
 * @class KeraticPrecipitates
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.KeraticPrecipitates = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "KeraticPrecipitates";
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.KeraticPrecipitates.prototype = new ED.Doodle;
ED.KeraticPrecipitates.prototype.constructor = ED.KeraticPrecipitates;
ED.KeraticPrecipitates.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.KeraticPrecipitates.prototype.setHandles = function()
{
	this.handleArray[2] = new ED.Handle(null, true, ED.Mode.Scale, false);
	this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.KeraticPrecipitates.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
	this.isRotatable = false;
    this.isUnique = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +40);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-160, +0);
    this.parameterValidationArray['arc']['range'].setMinAndMax(Math.PI/6, Math.PI*2);
    this.parameterValidationArray['scaleX']['range'].setMinAndMax(+0.5, +1.5);
    this.parameterValidationArray['scaleY']['range'].setMinAndMax(+0.5, +1.5);
}

/**
 * Sets default parameters (Only called for new doodles)
 * Use the setParameter function for derived parameters, as this will also update dependent variables
 */
ED.KeraticPrecipitates.prototype.setParameterDefaults = function()
{
    // Hard drusen is displaced for Fundus, central for others
    if (this.drawing.hasDoodleOfClass('Fundus'))
    {
        this.originX = this.drawing.eye == ED.eye.Right?-100:100;
        this.scaleX = 0.5;
        this.scaleY = 0.5;
    }
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.KeraticPrecipitates.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.KeraticPrecipitates.superclass.draw.call(this, _point);
	
	// Boundary path
	ctx.beginPath();
	
	// Invisible boundary
    var r = 200;
	ctx.arc(0,0,r,0,Math.PI*2,true);
    
	// Close path
	ctx.closePath();
	
	// Set line attributes
	ctx.lineWidth = 0;
	ctx.fillStyle = "rgba(0, 0, 0, 0)";
	ctx.strokeStyle = "rgba(0, 0, 0, 0)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
	// Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Colours
        var fill = "rgba(110, 110, 110, 0.5)";
        //var fill = "rgba(210, 210, 210, 0.5)";
        
        var dr = 10 * ((this.apexX + 20)/20)/this.scaleX;
        
        var p = new ED.Point(0,0);
        var n = 40 + Math.abs(Math.floor(this.apexY/2));
        for (var i = 0; i < n; i++)
        {
            p.setWithPolars(r * ED.randomArray[i], 2 * Math.PI * ED.randomArray[i + 100]);
            this.drawSpot(ctx, p.x, p.y, dr, fill);
        }
	}
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[2].location = this.transform.transformPoint(new ED.Point(r * 0.7, -r * 0.7));
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.KeraticPrecipitates.prototype.description = function()
{
    return this.apexX > 20?"Mutton fat keratic precipitates":"Keratic precipitates";
}

/**
 * A Visual field
 *
 * @class VisualField
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.VisualField = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "VisualField";
    
    // Private parameters
    this.numberOfHandles = 8;
    
    // Blind spot x coordinate
    this.blindSpotX = 0;
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.VisualField.prototype = new ED.Doodle;
ED.VisualField.prototype.constructor = ED.VisualField;
ED.VisualField.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.VisualField.prototype.setHandles = function()
{
    // Array of handles for expert mode
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        this.handleArray[i] = new ED.Handle(null, true, ED.Mode.Handles, false);
    }
    
    // Apex handle for basic mode
    this.handleArray[this.numberOfHandles] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default properties
 */
ED.VisualField.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
	this.isRotatable = false;
    this.isDeletable = false;
    this.isUnique = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-320, -20);
    
    // Create ranges to constrain handles
    this.handleVectorRangeArray = new Array();
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        // Full circle in radians
        var cir = 2 * Math.PI;
        
        // Create a range object for each handle
        var range = new Object;
        range.length = new ED.Range(+0, +400);
        range.angle = new ED.Range(((15 * cir/16) + i * cir/8) % cir, ((1 * cir/16) + i * cir/8) % cir);
        this.handleVectorRangeArray[i] = range;
    }
}

/**
 * Sets default parameters
 */
ED.VisualField.prototype.setParameterDefaults = function()
{
    this.apexY = -40;
    
    // Create a squiggle to store the handles points
    var squiggle = new ED.Squiggle(this, new ED.Colour(100, 100, 100, 1), 4, true);
    
    // Add it to squiggle array
    this.squiggleArray.push(squiggle);
    
    // Populate with points around circumference
    var defaultPointsArray = [[0,-370],[300,-260],[400,0],[300,260],[0,370],[-300,260],[-400,0],[-300,-260]];
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        var coordArray = defaultPointsArray[i];
        var point = new ED.Point(coordArray[0], coordArray[1]);
        this.addPointToSquiggle(point);
    }
    
    // Adjust for eye
    if (this.drawing.eye == ED.eye.Right)
    {
        this.squiggleArray[0].pointsArray[3].x = 220;
        this.squiggleArray[0].pointsArray[3].y = 170;
        this.blindSpotX = -120;
    }
    else
    {
        this.squiggleArray[0].pointsArray[5].x = -220;
        this.squiggleArray[0].pointsArray[5].y = 170;
        this.blindSpotX = +120;
    }
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.VisualField.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.VisualField.superclass.draw.call(this, _point);
    
	// Boundary path
    ctx.beginPath();

    // Bezier points
    var fp;
    var tp;
    var cp1;
    var cp2;

    // Angle of control point from radius line to point (this value makes path a circle Math.PI/12 for 8 points
    var phi = 2 * Math.PI/(3 * this.numberOfHandles);

    // Start curve
    ctx.moveTo(this.squiggleArray[0].pointsArray[0].x, this.squiggleArray[0].pointsArray[0].y);

    // Complete curve segments
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        // From and to points
        fp = this.squiggleArray[0].pointsArray[i];
        var toIndex = (i < this.numberOfHandles - 1)?i + 1:0;
        tp = this.squiggleArray[0].pointsArray[toIndex];

        // Bezier or straight depending on distance from centre
        if (fp.length() < 100 || tp.length() < 100)
        {
            ctx.lineTo(tp.x, tp.y);
        }
        else
        {
            // Control points
            cp1 = fp.tangentialControlPoint(+phi);
            cp2 = tp.tangentialControlPoint(-phi);

            // Draw Bezier curve
            ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, tp.x, tp.y);
        }
    }

    
    // Blind spot
    ctx.moveTo(this.blindSpotX - this.apexY, 0);
    ctx.arc(this.blindSpotX, 0, -this.apexY, 0, Math.PI*2, true);
    
    ctx.closePath();

    // Set attributes
	ctx.lineWidth = 2;
    ctx.fillStyle = "lightGray";
	ctx.strokeStyle = "black";
    
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
	// Non boundary drawing
    if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Axis lines
        ctx.beginPath();
        ctx.moveTo(0, -450);
        ctx.lineTo(0, 450);
        ctx.moveTo(-450, 0);
        ctx.lineTo(450, 0);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
    
	// Coordinates of expert handles (in canvas plane)
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        this.handleArray[i].location = this.transform.transformPoint(this.squiggleArray[0].pointsArray[i]);
    }
    
    // Location of apex handle
    this.handleArray[this.numberOfHandles].location = this.transform.transformPoint(new ED.Point(this.blindSpotX, this.apexY));
    
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.VisualField.prototype.description = function()
{
    return "";
}

/**
 * A Visual field chart
 *
 * @class VisualFieldChart
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.VisualFieldChart = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "VisualFieldChart";
    
    // Private parameters
    this.numberOfHandles = 8;
    
    // Blind spot x coordinate
    this.blindSpotX = 0;
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.VisualFieldChart.prototype = new ED.Doodle;
ED.VisualFieldChart.prototype.constructor = ED.VisualFieldChart;
ED.VisualFieldChart.superclass = ED.Doodle.prototype;

/**
 * Sets default properties
 */
ED.VisualFieldChart.prototype.setPropertyDefaults = function()
{
	this.isSelectable = false;
}

/**
 * Sets default parameters
 */
ED.VisualFieldChart.prototype.setParameterDefaults = function()
{
    // Create a squiggle to store the handles points
    var squiggle = new ED.Squiggle(this, new ED.Colour(100, 100, 100, 1), 4, true);
    
    // Add it to squiggle array
    this.squiggleArray.push(squiggle);
    
    // Populate with points around circumference
    var defaultPointsArray = [[0,-370],[300,-260],[400,0],[300,260],[0,370],[-300,260],[-400,0],[-300,-260]];
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        var coordArray = defaultPointsArray[i];
        var point = new ED.Point(coordArray[0], coordArray[1]);
        this.addPointToSquiggle(point);
    }
    
    // Adjust for eye
    if (this.drawing.eye == ED.eye.Right)
    {
        this.squiggleArray[0].pointsArray[3].x = 220;
        this.squiggleArray[0].pointsArray[3].y = 170;
        this.blindSpotX = -120;
    }
    else
    {
        this.squiggleArray[0].pointsArray[5].x = -220;
        this.squiggleArray[0].pointsArray[5].y = 170;
        this.blindSpotX = +120;
    }
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.VisualFieldChart.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.VisualFieldChart.superclass.draw.call(this, _point);
    
	// Boundary path
    ctx.beginPath();
    
    // Bezier points
    var fp;
    var tp;
    var cp1;
    var cp2;
    
    // Angle of control point from radius line to point (this value makes path a circle Math.PI/12 for 8 points
    var phi = 2 * Math.PI/(3 * this.numberOfHandles);
    
    // Start curve
    ctx.moveTo(this.squiggleArray[0].pointsArray[0].x, this.squiggleArray[0].pointsArray[0].y);
    
    // Complete curve segments
    for (var i = 0; i < this.numberOfHandles; i++)
    {
        // From and to points
        fp = this.squiggleArray[0].pointsArray[i];
        var toIndex = (i < this.numberOfHandles - 1)?i + 1:0;
        tp = this.squiggleArray[0].pointsArray[toIndex];
        
        // Control points
        cp1 = fp.tangentialControlPoint(+phi);
        cp2 = tp.tangentialControlPoint(-phi);
        
        // Draw Bezier curve
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, tp.x, tp.y);
    }
    
    ctx.closePath();
    
    // Set attributes
	ctx.lineWidth = 2;
    ctx.fillStyle = "gray";
	ctx.strokeStyle = "black";
    
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Conjunctival flap
 *
 * @class ConjunctivalFlap
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.ConjunctivalFlap = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "ConjunctivalFlap";
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.ConjunctivalFlap.prototype = new ED.Doodle;
ED.ConjunctivalFlap.prototype.constructor = ED.ConjunctivalFlap;
ED.ConjunctivalFlap.superclass = ED.Doodle.prototype;


/**
 * Sets handle attributes
 */
ED.ConjunctivalFlap.prototype.setHandles = function()
{
	this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default properties
 */
ED.ConjunctivalFlap.prototype.setPropertyDefaults = function()
{
	this.isScaleable = false;
	this.isMoveable = false;
    this.isArcSymmetrical = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-640, -100);
    this.parameterValidationArray['arc']['range'].setMinAndMax(60 * Math.PI/180, 160 * Math.PI/180);
}

/**
 * Sets default parameters
 */
ED.ConjunctivalFlap.prototype.setParameterDefaults = function()
{
    this.arc = 120 * Math.PI/180;
    this.apexY = -620;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.ConjunctivalFlap.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.NerveFibreDefect.superclass.draw.call(this, _point);

    // Radius of limbus
    var r = 380;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
    // Offset angle for control points
    var phi = this.arc/6;
    
    // Apex point
    var apex = new ED.Point(this.apexX, this.apexY);
    
    // Coordinates of corners of flap
    var right = new ED.Point(r * Math.sin(theta), - r * Math.cos(theta));
    var left = new ED.Point(- r * Math.sin(theta), - r * Math.cos(theta));
	
	// Boundary path
	ctx.beginPath();
    
	// Arc across to mirror image point on the other side
	ctx.arc(0, 0, r, arcStart, arcEnd, true);

    // Curved flap, bp bezier proportion is adjustment factor
    var bp = 0.8;
    ctx.bezierCurveTo(left.x, left.y, bp * left.x, apex.y, apex.x, apex.y);
    ctx.bezierCurveTo(bp * right.x, apex.y, right.x, right.y, right.x, right.y);
    
    // Colour of fill
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    
	// Set line attributes
	ctx.lineWidth = 4;
    
    // Colour of outer line is dark gray
    ctx.strokeStyle = "rgba(120,120,120,0.75)";;
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);

	// Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(left);
	this.handleArray[3].location = this.transform.transformPoint(right);
	this.handleArray[4].location = this.transform.transformPoint(apex);
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.ConjunctivalFlap.prototype.description = function()
{
    return (this.apexY < -280?"Fornix based ":"Limbus based ") + "flap";
}

/**
 * PartialThicknessScleralFlap
 *
 * @class PartialThicknessScleralFlap
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.PartialThicknessScleralFlap = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "PartialThicknessScleralFlap";
	
	// Doodle specific parameters
	this.r = 380;
	this.right = new ED.Point(0,0);
	this.left = new ED.Point(0,0);
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.PartialThicknessScleralFlap.prototype = new ED.Doodle;
ED.PartialThicknessScleralFlap.prototype.constructor = ED.PartialThicknessScleralFlap;
ED.PartialThicknessScleralFlap.superclass = ED.Doodle.prototype;


/**
 * Sets handle attributes
 */
ED.PartialThicknessScleralFlap.prototype.setHandles = function()
{
	this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default properties
 */
ED.PartialThicknessScleralFlap.prototype.setPropertyDefaults = function()
{
	this.isScaleable = false;
	this.isMoveable = false;
    this.isArcSymmetrical = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-580, -520);
    this.parameterValidationArray['arc']['range'].setMinAndMax(20 * Math.PI/180, 80 * Math.PI/180);
}

/**
 * Sets default parameters
 */
ED.PartialThicknessScleralFlap.prototype.setParameterDefaults = function()
{
    this.arc = 50 * Math.PI/180;
    this.apexY = -540;
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if their 'animate' property is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.PartialThicknessScleralFlap.prototype.dependentParameterValues = function(_parameter, _value)
{

    var returnArray = new Array();

    switch (_parameter)
    {
        case 'rotation':
			//console.log(_parameter);
// Coordinates of corners of flap
// 			this.right.x = this.r * Math.sin(theta);
// 			this.right.y = - this.r * Math.cos(theta);
// 			this.left.x = - this.r * Math.sin(theta);
// 			this.left.y = - this.r * Math.cos(theta);
    		
            break;
//         
//         case 'overallGauge':
//             returnArray['gauge'] = _value;
//             break;
//             
//         case 'gauge':
//             if (_value == "20g") returnArray['apexY'] = -650;
//             else if (_value == "23g") returnArray['apexY'] = -600;
//             else if (_value == "25g") returnArray['apexY'] = -550;
//             else returnArray['apexY'] = -500;
//             break;
//             
//         case 'arc':
//             if (_value < 2) returnArray['isSutured'] = false;
//             else returnArray['isSutured'] = true;
//             break;
//             
//         case 'isSutured':
//             if (_value) returnArray['arc'] = 3;
//             else returnArray['arc'] = 1;
//             break;
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.PartialThicknessScleralFlap.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.PartialThicknessScleralFlap.superclass.draw.call(this, _point);
    
    // Radius of limbus
    //var r = this.r;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
    // Offset angle for control points
    var phi = this.arc/6;
    
    // Apex point
    var apex = new ED.Point(this.apexX, this.apexY);
    
	this.right.x = this.r * Math.sin(theta);
	this.right.y = - this.r * Math.cos(theta);
	this.left.x = - this.r * Math.sin(theta);
	this.left.y = - this.r * Math.cos(theta);
	
	// Boundary path
	ctx.beginPath();
    
	// Arc across to mirror image point on the other side
	ctx.arc(0, 0, this.r, arcStart, arcEnd, true);
    
    // Rectangular flap
    ctx.lineTo(this.left.x, this.apexY);
    ctx.lineTo(this.right.x, this.apexY);
    ctx.closePath();
    
    // Colour of fill
    ctx.fillStyle = "rgba(220,220,150,0.5)";

	// Set line attributes
	ctx.lineWidth = 4;
    
    // Colour of outer line is dark gray
    ctx.strokeStyle = "rgba(120,120,120,0.75)";;
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
    // Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Draw sclerotomy at half width and height    
        var angle = theta/2;
        arcStart = - Math.PI/2 + angle;
        arcEnd = - Math.PI/2 - angle;
        var top = new ED.Point(this.apexX, -this.r + (this.apexY + this.r)/2);
        
        ctx.beginPath();
        ctx.arc(0, 0, this.r, arcStart, arcEnd, true);
        ctx.lineTo(- this.r * Math.sin(angle), top.y);
        ctx.lineTo(this.r * Math.sin(angle), top.y);
        ctx.closePath();
        
        // Colour of fill
        ctx.fillStyle = "gray";
        ctx.fill();
        
//         ctx.beginPath();
// 		ctx.moveTo(-400, 0);
// 		ctx.lineTo(+400, 0);
// 		ctx.moveTo(0, -400);
// 		ctx.lineTo(0, +400);
// 		ctx.stroke();
	}
    
	// Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(this.left);
	this.handleArray[3].location = this.transform.transformPoint(this.right);
	this.handleArray[4].location = this.transform.transformPoint(apex);
	
	// Draw handles if selected
	//if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.PartialThicknessScleralFlap.prototype.description = function()
{
    return (this.apexY < -280?"Fornix based ":"Limbus based ") + "flap";
}

/**
 * ArcuateScotoma
 *
 * @class ArcuateScotoma
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.ArcuateScotoma = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "ArcuateScotoma";
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.ArcuateScotoma.prototype = new ED.Doodle;
ED.ArcuateScotoma.prototype.constructor = ED.ArcuateScotoma;
ED.ArcuateScotoma.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.ArcuateScotoma.prototype.setHandles = function()
{
	this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.ArcuateScotoma.prototype.setPropertyDefaults = function()
{
	this.isScaleable = false;
	this.isMoveable = false;
    this.isRotatable = false;
    this.isArcSymmetrical = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(140, +300);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-0, +0);
}

/**
 * Sets default parameters
 */
ED.ArcuateScotoma.prototype.setParameterDefaults = function()
{
    // Default arc
    this.arc = 60 * Math.PI/180;
    this.apexX = 200;
    
    // Eye
    if (this.drawing.eye == ED.eye.Left) this.scaleX = this.scaleX * -1;
    
    // Make a second one opposite to the first
    var doodle = this.drawing.lastDoodleOfClass(this.className);
    if (doodle)
    {
        this.scaleY = doodle.scaleY * -1;
    }
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.ArcuateScotoma.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;

	// Call draw method in superclass
	ED.ArcuateScotoma.superclass.draw.call(this, _point);

    // Dimensions
    var bs = -100;
    var be = 100;
    var ts = -140;
    
    var r = (be - bs)/2;
    var x = bs + r;
    
    // Boundary path
	ctx.beginPath();
    
    // Arcuate scotoma base
    ctx.arc(x, 0, r, - Math.PI, 0, false);
    ctx.lineTo(this.apexX, 0);
    
    // Arcuate scotoma top
    r = (this.apexX - ts)/2;
    x = ts + r;
    ctx.arc(x, 0, r, 0, - Math.PI, true);
	ctx.closePath();
    
    // Set attributes
	ctx.lineWidth = 6;
    ctx.fillStyle = "gray";
	ctx.strokeStyle = "black";
    
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
    // Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
    
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);

	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.ArcuateScotoma.prototype.description = function()
{
    return this.scaleY > 0?"Superior":"Inferior" +  " arcuate scotoma";
}

/**
 * Trabectome
 *
 * @class Trabectome
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.Trabectome = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "Trabectome";
    
	// Call super-class constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.Trabectome.prototype = new ED.Doodle;
ED.Trabectome.prototype.constructor = ED.Trabectome;
ED.Trabectome.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.Trabectome.prototype.setHandles = function()
{
	this.handleArray[0] = new ED.Handle(null, true, ED.Mode.Arc, false);
	this.handleArray[3] = new ED.Handle(null, true, ED.Mode.Arc, false);
}

/**
 * Sets default properties
 */
ED.Trabectome.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
    this.isArcSymmetrical = true;
    this.isUnique = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['arc']['range'].setMinAndMax(Math.PI/16, Math.PI);
}

/**
 * Sets default parameters (Only called for new doodles)
 * Use the setParameter function for derived parameters, as this will also update dependent variables
 */
ED.Trabectome.prototype.setParameterDefaults = function()
{
    this.arc = Math.PI/4;
    this.setRotationWithDisplacements(-90, -120);
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.Trabectome.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.Trabectome.superclass.draw.call(this, _point);
    
	// Radius of outer curve and inner curve
	var ro = 440;
    var ri = 400;
    
    // Dimensions of instrument
    var vo = 500;
    var sw = 10;
    var sl = 760;
    var cl = 100;
    var hw = 150;
    var hl = 170;
	
	// Calculate parameters for arcs
	var theta = this.arc/2;
	var arcStart = - Math.PI/2 + theta;
	var arcEnd = - Math.PI/2 - theta;
    
    // Coordinates of 'corners' of Trabectome
    var rm = (ro + ri)/2;
	var topRightX = rm * Math.sin(theta);
	var topRightY = - rm * Math.cos(theta);
	var topLeftX = - rm * Math.sin(theta);
	var topLeftY = topRightY;
    
	// Boundary path
	ctx.beginPath();
    
	// Arc across to mirror image point on the other side
	ctx.arc(0, 0, ro, arcStart, arcEnd, true);
    
	// arc back again
    ctx.arc(0, 0, ri, arcEnd, arcStart, false);
    
    ctx.moveTo(-sw, vo -(cl + sl));
    ctx.lineTo(0, vo -(cl + sl) - sw);
    ctx.lineTo(sw, vo -(cl + sl));
    ctx.lineTo(sw, vo - cl);
    ctx.lineTo(hw, vo);
    ctx.lineTo(hw, vo + hl);
    ctx.lineTo(-hw, vo + hl);
    ctx.lineTo(-hw, vo);
    ctx.lineTo(-sw, vo - cl);
    ctx.lineTo(-sw, vo -(cl + sl));
    
	// Set line attributes
	ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(200, 200, 200, 0.5)";
    ctx.strokeStyle = "rgba(200, 200, 200, 0.8)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
    
    // Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Re-do ablation area
        ctx.beginPath();
        ctx.arc(0, 0, ro, arcStart, arcEnd, true);
        ctx.arc(0, 0, ri, arcEnd, arcStart, false);
        ctx.fillStyle = "rgba(200, 100, 100, 0.8)";
        ctx.strokeStyle = "red";
        ctx.fill();
        ctx.stroke();
        
        // Put in corneal incision
        var cr =  334;
        var cd = 30;
        var cro = cr + cd;
        var cri = cr - cd;
        ctx.beginPath();
        var ctheta = 0.125;
        ctx.arc(0, 0, cro, Math.PI/2 + ctheta, Math.PI/2 - ctheta, true);
        ctx.arc(0, 0, cri, Math.PI/2 - ctheta, Math.PI/2 + ctheta, false);
        ctx.fillStyle = "rgba(200,200,200,0.75)";
        ctx.strokeStyle = "rgba(120,120,120,0.75)";
        ctx.fill();
        ctx.stroke();
    }
    
	// Coordinates of handles (in canvas plane)
	this.handleArray[0].location = this.transform.transformPoint(new ED.Point(topLeftX, topLeftY));
	this.handleArray[3].location = this.transform.transformPoint(new ED.Point(topRightX, topRightY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hit test
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.Trabectome.prototype.description = function()
{
    return "Trabecular meshwork ablation of " + this.degreesExtent() + " degrees centred around " + this.clockHour() + " o'clock";
}

/**
 * Baerveldt tube
 *
 * @class Baerveldt
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.Baerveldt = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "Baerveldt";
    
    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.platePosition = 'STQ';

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.Baerveldt.prototype = new ED.Doodle;
ED.Baerveldt.prototype.constructor = ED.Baerveldt;
ED.Baerveldt.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.Baerveldt.prototype.setHandles = function()
{
	this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.Baerveldt.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
	this.isRotatable = true;
    this.snapToAngles = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-600, -100);
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['platePosition'] = {kind:'derived', type:'string', list:['STQ', 'SNQ', 'INQ', 'ITQ'], animate:true};
    
    // Array of angles to snap to
    var phi = Math.PI/4;
    this.anglesArray = [phi, 3 * phi, 5 * phi, 7 * phi];
}

/**
 * Sets default parameters
 */
ED.Baerveldt.prototype.setParameterDefaults = function()
{
    this.apexY = -300;
    this.setParameterFromString('platePosition', 'STQ');
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if the 'animate' property in the parameterValidationArray is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.Baerveldt.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();

    var isRE = (this.drawing.eye == ED.eye.Right);
    var phi = Math.PI/4;
    
    switch (_parameter)
    {
        case 'rotation':
            if (this.rotation > 0 && this.rotation <= 2 * phi)
            {
                returnArray['platePosition'] = isRE?'SNQ':'STQ';
            }
            else if (this.rotation > 2 * phi && this.rotation <= 4 * phi)
            {
                returnArray['platePosition'] = isRE?'INQ':'ITQ';
            }
            else if (this.rotation > 4 * phi && this.rotation <= 6 * phi)
            {
                returnArray['platePosition'] = isRE?'ITQ':'INQ';
            }
            else
            {
                returnArray['platePosition'] = isRE?'STQ':'SNQ';
            }
            break;
            
        case 'platePosition':
            switch (_value)
            {
                case 'STQ':
                    if (isRE)
                    {
                        returnArray['rotation'] = 7 * phi;
                    }
                    else
                    {
                        returnArray['rotation'] = phi;
                    }
                    break;
                case 'SNQ':
                    if (isRE)
                    {
                        returnArray['rotation'] = phi;
                    }
                    else
                    {
                        returnArray['rotation'] = 7 * phi;
                    }
                    break;
                case 'INQ':
                    if (isRE)
                    {
                        returnArray['rotation'] = 3 * phi;
                    }
                    else
                    {
                        returnArray['rotation'] = 5 * phi;
                    }
                    break;
                case 'ITQ':
                    if (isRE)
                    {
                        returnArray['rotation'] = 5 * phi;
                    }
                    else
                    {
                        returnArray['rotation'] = 3 * phi;
                    }
                    break;
            }
            break;
    }

    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.Baerveldt.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.Baerveldt.superclass.draw.call(this, _point);
	
	// Boundary path
	ctx.beginPath();
    
    // Scaling factor
    var s = 0.41666667;
    
    // Vertical shift
    var d = -740;
    
    // Plate
    ctx.moveTo(-400	* s, 0 * s + d);
    ctx.bezierCurveTo(-400 * s, -100 * s + d, -300 * s, -200 * s + d, -200 * s, -200 * s + d);
    ctx.bezierCurveTo(-100 * s, -200 * s + d, -58 * s, -136 * s + d, 0 * s, -135 * s + d);
    ctx.bezierCurveTo(54 * s, -136 * s + d, 100 * s, -200 * s + d, 200 * s, -200 * s + d);
    ctx.bezierCurveTo(300 * s, -200 * s + d, 400 * s, -100 * s + d, 400 * s, 0 * s + d);
    ctx.bezierCurveTo(400 * s, 140 * s + d, 200 * s, 250 * s + d, 0 * s, 250 * s + d);
    ctx.bezierCurveTo(-200 * s, 250 * s + d, -400 * s, 140 * s + d, -400 * s, 0 * s + d);
    
    // Connection flange
    ctx.moveTo(-160 * s, 230 * s + d);
    ctx.lineTo(-120 * s, 290 * s + d);
    ctx.lineTo(120 * s, 290 * s + d);
    ctx.lineTo(160 * s, 230 * s + d);
    ctx.bezierCurveTo(120 * s, 250 * s + d, -120 * s, 250 * s + d, -160 * s, 230 * s + d);
    
    // Set Attributes
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(120,120,120,0.75)";
    ctx.fillStyle = "rgba(220,220,220,0.5)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Spots
        this.drawSpot(ctx, -240 * s, -40 * s + d, 10, "rgba(150,150,150,0.5)");
        this.drawSpot(ctx, -120 * s, 40 * s + d, 10, "rgba(150,150,150,0.5)");
        this.drawSpot(ctx, 120 * s, 40 * s + d, 10, "rgba(150,150,150,0.5)");
        this.drawSpot(ctx, 240 * s, -40 * s + d, 10, "rgba(150,150,150,0.5)");
        this.drawSpot(ctx, -100 * s, 260 * s + d, 5, "rgba(150,150,150,0.5)");
        this.drawSpot(ctx, 100 * s, 260 * s + d, 5, "rgba(150,150,150,0.5)");
        
        // Ridge on flange
        ctx.beginPath()
        ctx.moveTo(-30 * s, 250 * s + d);
        ctx.lineTo(-30 * s, 290 * s + d);
        ctx.moveTo(30 * s, 250 * s + d);
        ctx.lineTo(30 * s, 290 * s + d);
        
        // Tube
        ctx.moveTo(-20 * s, 290 * s + d);
        ctx.lineTo(-20 * s, this.apexY);
        ctx.lineTo(20 * s, this.apexY);
        ctx.lineTo(20 * s, 290 * s + d);
        
        ctx.strokeStyle = "rgba(150,150,150,0.5)";
        ctx.stroke();
	}
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.Baerveldt.prototype.description = function()
{
    var descArray = {STQ:'superotemporal', SNQ:'superonasal', INQ:'inferonasal', ITQ:'inferotemporal'};
    
    return "Baerveldt tube in the "+ descArray[this.platePosition] + " quadrant";
}

/**
 * Ahmed tube
 *
 * @class Ahmed
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.Ahmed = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "Ahmed";
    
    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.platePosition = 'STQ';
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.Ahmed.prototype = new ED.Doodle;
ED.Ahmed.prototype.constructor = ED.Ahmed;
ED.Ahmed.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.Ahmed.prototype.setHandles = function()
{
	this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.Ahmed.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
	this.isRotatable = true;
    this.snapToAngles = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-600, -100);
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['platePosition'] = {kind:'derived', type:'string', list:['STQ', 'SNQ', 'INQ', 'ITQ'], animate:true};
    
    // Array of angles to snap to
    var phi = Math.PI/4;
    this.anglesArray = [phi, 3 * phi, 5 * phi, 7 * phi];
}

/**
 * Sets default parameters
 */
ED.Ahmed.prototype.setParameterDefaults = function()
{
    this.apexY = -300;
    this.setParameterFromString('platePosition', 'STQ');
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if the 'animate' property in the parameterValidationArray is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.Ahmed.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();
    
    var isRE = (this.drawing.eye == ED.eye.Right);
    var phi = Math.PI/4;
    
    switch (_parameter)
    {
        case 'rotation':
            if (this.rotation > 0 && this.rotation <= 2 * phi)
            {
                returnArray['platePosition'] = isRE?'SNQ':'STQ';
            }
            else if (this.rotation > 2 * phi && this.rotation <= 4 * phi)
            {
                returnArray['platePosition'] = isRE?'INQ':'ITQ';
            }
            else if (this.rotation > 4 * phi && this.rotation <= 6 * phi)
            {
                returnArray['platePosition'] = isRE?'ITQ':'INQ';
            }
            else
            {
                returnArray['platePosition'] = isRE?'STQ':'SNQ';
            }
            break;
            
        case 'platePosition':
            switch (_value)
        {
            case 'STQ':
                if (isRE)
                {
                    returnArray['rotation'] = 7 * phi;
                }
                else
                {
                    returnArray['rotation'] = phi;
                }
                break;
            case 'SNQ':
                if (isRE)
                {
                    returnArray['rotation'] = phi;
                }
                else
                {
                    returnArray['rotation'] = 7 * phi;
                }
                break;
            case 'INQ':
                if (isRE)
                {
                    returnArray['rotation'] = 3 * phi;
                }
                else
                {
                    returnArray['rotation'] = 5 * phi;
                }
                break;
            case 'ITQ':
                if (isRE)
                {
                    returnArray['rotation'] = 5 * phi;
                }
                else
                {
                    returnArray['rotation'] = 3 * phi;
                }
                break;
        }
            break;
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.Ahmed.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.Ahmed.superclass.draw.call(this, _point);
	
	// Boundary path
	ctx.beginPath();
    
    // Scaling factor
    var s = 0.41666667;
    
    // Vertical shift
    var d = -740;
    
    // Plate
    ctx.moveTo(-300	* s, 0 * s + d);
    ctx.bezierCurveTo(-300 * s, -100 * s + d, -200 * s, -400 * s + d, 0 * s, -400 * s + d);
    ctx.bezierCurveTo(200 * s, -400 * s + d, 300 * s, -100 * s + d, 300 * s, 0 * s + d);
    ctx.bezierCurveTo(300 * s, 140 * s + d, 200 * s, 250 * s + d, 0 * s, 250 * s + d);
    ctx.bezierCurveTo(-200 * s, 250 * s + d, -300 * s, 140 * s + d, -300 * s, 0 * s + d);
    
    // Connection flange
    ctx.moveTo(-160 * s, 230 * s + d);
    ctx.lineTo(-120 * s, 290 * s + d);
    ctx.lineTo(120 * s, 290 * s + d);
    ctx.lineTo(160 * s, 230 * s + d);
    ctx.bezierCurveTo(120 * s, 250 * s + d, -120 * s, 250 * s + d, -160 * s, 230 * s + d);
    
    // Set Attributes
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(120,120,120,0.75)";
    ctx.fillStyle = "rgba(220,220,220,0.5)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Spots
        this.drawSpot(ctx, 0 * s, -230 * s + d, 20 * s, "white");
        this.drawSpot(ctx, -180 * s, -180 * s + d, 20 * s, "white");
        this.drawSpot(ctx, 180 * s, -180 * s + d, 20 * s, "white");
        
        // Trapezoid mechanism
        ctx.beginPath()
        ctx.moveTo(-100 * s, 230 * s + d);
        ctx.lineTo(100 * s, 230 * s + d);
        ctx.lineTo(200 * s, 0 * s + d);
        ctx.lineTo(40 * s, 0 * s + d);
        ctx.arcTo(0, -540 * s + d, -40 * s, 0 * s + d, 15);
        ctx.lineTo(-40 * s, 0 * s + d);
        ctx.lineTo(-200 * s, 0 * s + d);
        ctx.closePath();
        
        ctx.fillStyle = "rgba(250,250,250,0.7)";
        ctx.fill();
        
        // Lines
        ctx.moveTo(-80 * s, -40 * s + d);
        ctx.lineTo(-160 * s, -280 * s + d);
        ctx.moveTo(80 * s, -40 * s + d);
        ctx.lineTo(160 * s, -280 * s + d);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "rgba(250,250,250,0.7)";
        ctx.stroke();

        // Ridge on flange
        ctx.beginPath()
        ctx.moveTo(-30 * s, 250 * s + d);
        ctx.lineTo(-30 * s, 290 * s + d);
        ctx.moveTo(30 * s, 250 * s + d);
        ctx.lineTo(30 * s, 290 * s + d);
        
        // Tube
        ctx.moveTo(-20 * s, 290 * s + d);
        ctx.lineTo(-20 * s, this.apexY);
        ctx.lineTo(20 * s, this.apexY);
        ctx.lineTo(20 * s, 290 * s + d);
        
        ctx.strokeStyle = "rgba(150,150,150,0.5)";
        ctx.stroke();
	}
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.Ahmed.prototype.description = function()
{
    var descArray = {STQ:'superotemporal', SNQ:'superonasal', INQ:'inferonasal', ITQ:'inferotemporal'};
    
    return "Ahmed tube in the "+ descArray[this.platePosition] + " quadrant";
}

/**
 * Molteno tube
 *
 * @class Molteno
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.Molteno = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "Molteno";
    
    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.platePosition = 'STQ';
    
	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.Molteno.prototype = new ED.Doodle;
ED.Molteno.prototype.constructor = ED.Molteno;
ED.Molteno.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.Molteno.prototype.setHandles = function()
{
	this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.Molteno.prototype.setPropertyDefaults = function()
{
	this.isMoveable = false;
	this.isRotatable = true;
    this.snapToAngles = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-600, -100);
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['platePosition'] = {kind:'derived', type:'string', list:['STQ', 'SNQ', 'INQ', 'ITQ'], animate:true};
    
    // Array of angles to snap to
    var phi = Math.PI/4;
    this.anglesArray = [phi, 3 * phi, 5 * phi, 7 * phi];
}

/**
 * Sets default parameters
 */
ED.Molteno.prototype.setParameterDefaults = function()
{
    this.apexY = -300;
    this.setParameterFromString('platePosition', 'STQ');
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if the 'animate' property in the parameterValidationArray is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.Molteno.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();
    
    var isRE = (this.drawing.eye == ED.eye.Right);
    var phi = Math.PI/4;
    
    switch (_parameter)
    {
        case 'rotation':
            if (this.rotation > 0 && this.rotation <= 2 * phi)
            {
                returnArray['platePosition'] = isRE?'SNQ':'STQ';
            }
            else if (this.rotation > 2 * phi && this.rotation <= 4 * phi)
            {
                returnArray['platePosition'] = isRE?'INQ':'ITQ';
            }
            else if (this.rotation > 4 * phi && this.rotation <= 6 * phi)
            {
                returnArray['platePosition'] = isRE?'ITQ':'INQ';
            }
            else
            {
                returnArray['platePosition'] = isRE?'STQ':'SNQ';
            }
            break;
            
        case 'platePosition':
            switch (_value)
        {
            case 'STQ':
                if (isRE)
                {
                    returnArray['rotation'] = 7 * phi;
                }
                else
                {
                    returnArray['rotation'] = phi;
                }
                break;
            case 'SNQ':
                if (isRE)
                {
                    returnArray['rotation'] = phi;
                }
                else
                {
                    returnArray['rotation'] = 7 * phi;
                }
                break;
            case 'INQ':
                if (isRE)
                {
                    returnArray['rotation'] = 3 * phi;
                }
                else
                {
                    returnArray['rotation'] = 5 * phi;
                }
                break;
            case 'ITQ':
                if (isRE)
                {
                    returnArray['rotation'] = 5 * phi;
                }
                else
                {
                    returnArray['rotation'] = 3 * phi;
                }
                break;
        }
            break;
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.Molteno.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.Molteno.superclass.draw.call(this, _point);
	
	// Boundary path
	ctx.beginPath();
    
    // Scaling factor
    var s = 0.41666667;
    
    // Vertical shift
    var d = -740;
    
    // Plate
    ctx.arc(0, d, 310 * s, 0, Math.PI * 2, true);
    
    // Set Attributes
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(120,120,120,0.75)";
    ctx.fillStyle = "rgba(220,220,220,0.5)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Inner ring
        ctx.beginPath();
        ctx.arc(0, d, 250 * s, 0, Math.PI * 2, true);
        ctx.stroke();
        
        // Suture holes
        this.drawSpot(ctx, -200 * s, 200 * s + d, 5, "rgba(255,255,255,1)");
        this.drawSpot(ctx, -200 * s, -200 * s + d, 5, "rgba(255,255,255,1)");
        this.drawSpot(ctx, 200 * s, -200 * s + d, 5, "rgba(255,255,255,1)");
        this.drawSpot(ctx, 200 * s, 200 * s + d, 5, "rgba(255,255,255,1)");
        
        // Tube
        ctx.moveTo(-20 * s, 290 * s + d);
        ctx.lineTo(-20 * s, this.apexY);
        ctx.lineTo(20 * s, this.apexY);
        ctx.lineTo(20 * s, 290 * s + d);
        
        ctx.strokeStyle = "rgba(150,150,150,0.5)";
        ctx.stroke();
	}
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
    
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.Molteno.prototype.description = function()
{
    var descArray = {STQ:'superotemporal', SNQ:'superonasal', INQ:'inferonasal', ITQ:'inferotemporal'};
    
    return "Molteno tube in the "+ descArray[this.platePosition] + " quadrant";
}

/**
 * Scleral Patch
 *
 * @class ScleralPatch
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.ScleralPatch = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{
	// Set classname
	this.className = "Patch";

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.ScleralPatch.prototype = new ED.Doodle;
ED.ScleralPatch.prototype.constructor = ED.ScleralPatch;
ED.ScleralPatch.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.ScleralPatch.prototype.setHandles = function()
{
    this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.ScleralPatch.prototype.setPropertyDefaults = function()
{
	this.isOrientated = true;
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-20, +200);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-200, -20);
}

/**
 * Sets default parameters
 */
ED.ScleralPatch.prototype.setParameterDefaults = function()
{
    this.apexX = 50;
    this.apexY = -70;
    this.originY = -260;
    
    
    // Patchs are usually temporal
//    if(this.drawing.eye == ED.eye.Right)
//    {
//        this.originX = -260;
//        this.rotation = -Math.PI/4;
//    }
//    else
//    {
//        this.originX = 260;
//        this.rotation = Math.PI/4;
//    }
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.ScleralPatch.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.ScleralPatch.superclass.draw.call(this, _point);
    
    // Boundary path
	ctx.beginPath();
    
    ctx.rect(-this.apexX, this.apexY, Math.abs(2 * this.apexX), Math.abs(2 * this.apexY));
    
	// Close path
	ctx.closePath();
    
    // Colour of fill
    ctx.fillStyle = "rgba(200,200,50,0.5)";
    ctx.strokeStyle = "rgba(120,120,120,0)";
    
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
    {
//        // Suture knots
//        this.drawSpot(ctx, -50, -50, 5, "blue");
//        this.drawSpot(ctx, -50, 50, 5, "blue");
//        this.drawSpot(ctx, 50, -50, 5, "blue");
//        this.drawSpot(ctx, 50, 50, 5, "blue");
//        
//        // Suture thread ends
//        this.drawLine(ctx, -60, -60, -50, -50, 2, "blue");
//        this.drawLine(ctx, -50, -50, -60, -40, 2, "blue");
//        this.drawLine(ctx, -60, 60, -50, 50, 2, "blue");
//        this.drawLine(ctx, -50, 50, -60, 40, 2, "blue");
//        this.drawLine(ctx, 60, -60, 50, -50, 2, "blue");
//        this.drawLine(ctx, 50, -50, 60, -40, 2, "blue");
//        this.drawLine(ctx, 60, 60, 50, 50, 2, "blue");
//        this.drawLine(ctx, 50, 50, 60, 40, 2, "blue");
	}
    
    // Coordinates of handles (in canvas plane)
    this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
    
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.ScleralPatch.prototype.description = function()
{
    return "Scleral patch";
}
<<<<<<< HEAD

/**
 * Supramid suture
 *
 * @class Supramid
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.Supramid = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{	
	// Set classname
	this.className = "Supramid";

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.Supramid.prototype = new ED.Doodle;
ED.Supramid.prototype.constructor = ED.Supramid;
ED.Supramid.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.Supramid.prototype.setHandles = function()
{
	this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.Supramid.prototype.setPropertyDefaults = function()
{
	this.isOrientated = true;
	this.isRotatable = false;
    this.snapToQuadrant = true;
    this.quadrantPoint = new ED.Point(10, 10);
    
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-0, +0);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(-420, -200);
}

/**
 * Sets default parameters
 */
ED.Supramid.prototype.setParameterDefaults = function()
{
    this.apexX = 0;
    this.apexY = -350;
    this.originY = -10;
    
    // Tubes are usually STQ
    if(this.drawing.eye == ED.eye.Right)
    {
        this.originX = -10;        
        this.rotation = -Math.PI/4;
    }
    else
    {
        this.originX = 10;
        this.rotation = Math.PI/4;
    }
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.Supramid.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;
	
	// Call draw method in superclass
	ED.Supramid.superclass.draw.call(this, _point);

    // Calculate key points for supramid bezier
    var startPoint = new ED.Point(0, this.apexY);
    var tubePoint = new ED.Point(0, -450);    
    var controlPoint1 = new ED.Point(0, -600);
    
    // Calculate mid point x coordinate
    var midPointX = -450;
    var controlPoint2 = new ED.Point(midPointX, -300);
    var midPoint = new ED.Point(midPointX, 0);
    var controlPoint3 = new ED.Point(midPointX, 300);
    var controlPoint4 = new ED.Point(midPointX * 0.5, 450);
    var endPoint = new ED.Point(midPointX * 0.2, 450);

	// Boundary path
	ctx.beginPath();
    
    // Rectangle around suture
    ctx.moveTo(this.apexX, tubePoint.y);
    ctx.lineTo(midPointX, tubePoint.y);
    ctx.lineTo(midPointX, endPoint.y);
    ctx.lineTo(this.apexX, endPoint.y);            
    
	// Close path
	ctx.closePath();
	
	// Set line attributes
	ctx.lineWidth = 1;
	ctx.fillStyle = "rgba(0, 0, 0, 0)";
	ctx.strokeStyle = "rgba(0, 0, 0, 0)";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{        
        // Suture
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(tubePoint.x, tubePoint.y);
        ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, midPoint.x, midPoint.y);
        ctx.bezierCurveTo(controlPoint3.x, controlPoint3.y, controlPoint4.x, controlPoint4.y, endPoint.x, endPoint.y);
        
        ctx.lineWidth = 4;
        ctx.strokeStyle = "purple";
        ctx.stroke();
	}
	
	// Coordinates of handles (in canvas plane)
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(0, this.apexY));
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
 	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns parameters
 *
 * @returns {String} value of parameter
 */
// ED.Supramid.prototype.getParameter = function(_parameter)
// {
//     var returnValue;
//     
//     switch (_parameter)
//     {
//         // Position of end of suture
//         case 'endPosition':
//             var r = Math.sqrt(this.apexX * this.apexX + this.apexY * this.apexY);
//             
//             if (r < 280 ) returnValue = 'in the AC';
//             else returnValue = ((r - 280)/14).toFixed(0) + 'mm from limbus';
//             break;
// 
//         default:
//             returnValue = "";
//             break;
//     }
//     
//     return returnValue;
// }

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.Supramid.prototype.description = function()
{
    var returnString = "Supramid suture ";
    
    returnString += this.getParameter('endPosition');
    
	return returnString;
}

/**
 * Vicryl suture
 *
 * @class Vicryl
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.Vicryl = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{	
	// Set classname
	this.className = "Vicryl";

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.Vicryl.prototype = new ED.Doodle;
ED.Vicryl.prototype.constructor = ED.Vicryl;
ED.Vicryl.superclass = ED.Doodle.prototype;

/**
 * Sets default dragging attributes
 */
ED.Vicryl.prototype.setPropertyDefaults = function()
{
	this.isOrientated = true;
	this.isRotatable = false;
}

/**
 * Sets default parameters
 */
ED.Vicryl.prototype.setParameterDefaults = function()
{
    this.originY = -240;
    this.apexY = 400;
    
    // Tubes are usually STQ
    if(this.drawing.eye == ED.eye.Right)
    {
        this.originX = -240;        
        this.rotation = -Math.PI/4;
    }
    else
    {
        this.originX = 240;
        this.rotation = Math.PI/4;
    }
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.Vicryl.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;

	// Call draw method in superclass
	ED.Vicryl.superclass.draw.call(this, _point);
    
	// Boundary path
	ctx.beginPath();
    
    // Use arcTo to create an ellipsoid
    ctx.moveTo(-20, 0);
    ctx.arcTo(0, -20, 20, 0, 30); 
    ctx.arcTo(0, 20, -20, 0, 30);
    
	// Set line attributes
	ctx.lineWidth = 4;
	ctx.fillStyle = "rgba(0, 0, 0, 0)";
	ctx.strokeStyle = "purple";
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
        // Ends of suture
        ctx.beginPath();
        ctx.moveTo(35, -10);
        ctx.lineTo(20, 0);
        ctx.lineTo(35, 10); 
        ctx.stroke();
        
        // Knot
        this.drawSpot(ctx, 20, 0, 4, "purple");
 	}
	
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
 	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Returns a string containing a text description of the doodle
 *
 * @returns {String} Description of doodle
 */
ED.Vicryl.prototype.description = function()
{
	return "Vicryl suture";
}

/**
 * TrabySuture suture
 *
 * @class TrabySuture
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Int} _originX
 * @param {Int} _originY
 * @param {Float} _radius
 * @param {Int} _apexX
 * @param {Int} _apexY
 * @param {Float} _scaleX
 * @param {Float} _scaleY
 * @param {Float} _arc
 * @param {Float} _rotation
 * @param {Int} _order
 */
ED.TrabySuture = function(_drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order)
{	
	// Set classname
	this.className = "TrabySuture";
	
    // Derived parameters (NB must set a value here to define parameter as a property of the object, even though value set later)
    this.type = 'Fixed';

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _originX, _originY, _radius, _apexX, _apexY, _scaleX, _scaleY, _arc, _rotation, _order);
}

/**
 * Sets superclass and constructor
 */
ED.TrabySuture.prototype = new ED.Doodle;
ED.TrabySuture.prototype.constructor = ED.TrabySuture;
ED.TrabySuture.superclass = ED.Doodle.prototype;

/**
 * Sets handle attributes
 */
ED.TrabySuture.prototype.setHandles = function()
{
    this.handleArray[2] = new ED.Handle(null, true, ED.Mode.Rotate, false);
    this.handleArray[4] = new ED.Handle(null, true, ED.Mode.Apex, false);
}

/**
 * Sets default dragging attributes
 */
ED.TrabySuture.prototype.setPropertyDefaults = function()
{
	//this.isMoveable = false;
	//this.isRotatable = false;
	
    // Update component of validation array for simple parameters
    this.parameterValidationArray['apexX']['range'].setMinAndMax(-50, +50);
    this.parameterValidationArray['apexY']['range'].setMinAndMax(+70, +70);
    
    // Add complete validation arrays for derived parameters
    this.parameterValidationArray['type'] = {kind:'derived', type:'string', list:['Fixed', 'Adjustable', 'Releasable'], animate:false};
}

/**
 * Sets default parameters
 */
ED.TrabySuture.prototype.setParameterDefaults = function()
{
	this.apexX = +50;
	this.apexY = +70;
    this.type = 'Fixed';
}

/**
 * Calculates values of dependent parameters. This function embodies the relationship between simple and derived parameters
 * The returned parameters are animated if their 'animate' property is set to true
 *
 * @param {String} _parameter Name of parameter that has changed
 * @value {Undefined} _value Value of parameter to calculate
 * @returns {Array} Associative array of values of dependent parameters
 */
ED.TrabySuture.prototype.dependentParameterValues = function(_parameter, _value)
{
    var returnArray = new Array();
    
    switch (_parameter)
    {
        case 'apexX':
            if (_value > 17) returnArray['type'] = "Releasable";
            else if (_value > -17) returnArray['type'] = "Adjustable";
            else returnArray['type'] = "Fixed";
            break;
        
        case 'type':
            switch (_value)
        	{
            	case 'Fixed':
            		returnArray['apexX'] = -50;
            		break;
            	case 'Adjustable':
            		returnArray['apexX'] = 0;
            		break;
            	case 'Releasable':
            		returnArray['apexX'] = +50;
            		break;
            }
    }
    
    return returnArray;
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.TrabySuture.prototype.draw = function(_point)
{
	// Get context
	var ctx = this.drawing.context;

	// Call draw method in superclass
	ED.TrabySuture.superclass.draw.call(this, _point);
    
	// Boundary path
	ctx.beginPath();
    
    // Outline
	ctx.rect(-40, -70, 80, 100);

	// Set line attributes
	ctx.lineWidth = 4;
	ctx.fillStyle = "rgba(255,255,255,0)";
	if (this.isSelected)
	{
		ctx.strokeStyle = "gray";
	}
	else
	{
		ctx.strokeStyle = "rgba(255,255,255,0)";
	}
	
	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);
	
	// Other stuff here
	if (this.drawFunctionMode == ED.drawFunctionMode.Draw)
	{
		// Suture path
		ctx.beginPath();
		
		// Type of suture
		switch (this.type)
		{
			case 'Releasable':
				ctx.moveTo(-2, 64);
				ctx.bezierCurveTo(20, 36, -15, 16, -16, -7);
				ctx.bezierCurveTo(-18, -30, -12, -43, -4, -43);
				ctx.bezierCurveTo(6, -43, 12, -28, 12, -9);
				ctx.bezierCurveTo(12, 11, 0, 23, -2, 30);
				ctx.bezierCurveTo(-3, 36, 3, 37, 2, 30);
				ctx.bezierCurveTo(2, 20, -4, 24, -3, 29);
				ctx.bezierCurveTo(-3, 36, 14, 37, 23, 56);
				ctx.bezierCurveTo(32, 74, 34, 100, 34, 100);
				ctx.bezierCurveTo(34, 150, -34, 150, -34, 100);
				break;

			case 'Adjustable':
				ctx.moveTo(-2, 64);
				ctx.bezierCurveTo(20, 36, -15, 16, -16, -7);
				ctx.bezierCurveTo(-18, -30, -12, -43, -4, -43);
				ctx.bezierCurveTo(6, -43, 12, -28, 12, -9);
				ctx.bezierCurveTo(12, 11, 0, 23, -2, 30);
				ctx.bezierCurveTo(-3, 36, 3, 37, 2, 30);
				ctx.bezierCurveTo(2, 20, -4, 24, -3, 29);
				ctx.bezierCurveTo(-3, 36, 14, 37, 23, 56);
				ctx.bezierCurveTo(32, 74, 34, 100, 34, 100);
				break;

			case 'Fixed':
				ctx.moveTo(0, -30);
				ctx.bezierCurveTo(5, -10, 5, 10, 0, 30);
				ctx.bezierCurveTo(-5, 10, -5, -10, 0, -30);
				ctx.moveTo(-5, 50);
				ctx.lineTo(0, 30);
				ctx.lineTo(5, 50);
				break;	
		}
	
		// Set line attributes
		ctx.lineWidth = 8;
		ctx.fillStyle = "rgba(0, 0, 0, 0)";
		ctx.strokeStyle = "purple";
		
		// Draw line
		ctx.stroke();
 	}
 	
	// Coordinates of handles (in canvas plane)
	this.handleArray[2].location = this.transform.transformPoint(new ED.Point(+40, -70));
	this.handleArray[4].location = this.transform.transformPoint(new ED.Point(this.apexX, this.apexY));
		
	// Draw handles if selected
	if (this.isSelected && !this.isForDrawing) this.drawHandles(_point);
 	
	// Return value indicating successful hittest
	return this.isClicked;
}

/**
 * Draws extra items if the doodle is highlighted
 */
ED.TrabySuture.prototype.drawHighlightExtras = function()
{
    // Get context
	var ctx = this.drawing.context;
    
    // Draw text description of gauge
    ctx.lineWidth=1;
    ctx.fillStyle="gray";
    ctx.font="64px sans-serif";
    ctx.fillText(this.type, 80, 0 + 20);
}

=======
>>>>>>> 7d2450df2945a909c0fbc38e2eecf7f90b4eb921
