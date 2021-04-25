// Author: ???
// CSC 385 Computer Graphics
// Version: Winter 2020

import {debugWrite} from './DebugConsole.js';

var filledPixel = {};

// All points are integer pixel coordinates

// Takes a point given as vec2 in pixel coordinates and a color given
// as vec3.  Changes the pixel that the point lies in to the color.
export function rasterizePoint(board, point, color){
    board.writePixel(point[0], point[1], color);
    filledPixel[pointKey(point)] = point;
    debugWrite("writePixel(" + point[0].toString() + ", " + point[1].toString() + ")");
}

// reset filledPixel to empty after finish the filling
function reset(){
  filledPixel = {};
}

// convert a point to string, used for dict key of markedPixel
function pointKey(point1){
  var x = point1[0];
  var y = point1[1];
  return "(" + x.toString() + "," + y.toString() + ")"
}

// copied from http://www.endmemo.com/js/pause.php
function wait(ms){
  var d = new Date();
  var d2 = null;
  do { d2 = new Date(); }
  while(d2-d < ms);
}

// Takes two points given as vec2 in pixel coordinates and a color
// given as vec3.  Draws line between the points of the color.
// Implemented using Bresenham's Algorithm.
export function rasterizeLine(board, point1, point2, color){
  var ptToFill = [0,0];
  // assumption 1
  var startX = Math.round(point1[0]),
  startY = Math.round(point1[1]),
  endX = Math.round(point2[0]),
  endY = Math.round(point2[1]);
  if (startX > endX){
    var tempX = startX, tempY = startY;
    startX = endX;
    startY = endY;
    endX = tempX;
    endY = tempY;
  }
  var dx = Math.abs(endX - startX);
  var dy = Math.abs(endY - startY);
  // assumption 2: when |m| > 1 scan y-coord instead of x-coords
  if (isAbsSlopeMoreThanOne(point1, point2)){
    if (startY > endY){
      var tempX = startX, tempY = startY;
      startX = endX;
      startY = endY;
      endX = tempX;
      endY = tempY;
    }
    var p = 2*dx - dy;
    var y;
    for (y = startY; y <= endY; y++){
      ptToFill[0] = startX;
      ptToFill[1] = y;
      rasterizePoint(board, ptToFill, color);
      //wait(1000)
      if (p >= 0){
        if(startX < endX){
          startX ++;
        }
        else{
          startX --;
        }
        p = p + 2*dx - 2*dy;
      }
      else{
        p = p + 2*dx;
      }
    }
  }
  else{ // when |m| <= 1
    var p = 2*dy - dx;
    var x;
    for (x = startX; x <= endX; x ++){
      ptToFill[0] = x;
      ptToFill[1] = startY;
      rasterizePoint(board,ptToFill,color);
      //wait(1000);
      if (p >= 0){
        if (startY < endY){
          startY ++;
        }
        else{
          startY --;
        }
        p = p + 2*dy - 2*dx;
      }
      else{
        p = p + 2*dy;
      }
    }
  }
}

//check the slope of a line and return true if its slope in absoute value
// is greater than 1
function isAbsSlopeMoreThanOne(point1, point2){
  var dy = point2[1]-point1[1];
  var dx = point2[0]-point1[0];
  return Math.abs(dy/dx)>1;
}

// Takes three points given as vec2 in pixel coordinates and a color
// given as vec3.  Draws triangle between the points of the color.
export function rasterizeTriangle(board, point1, point2, point3, color){
  rasterizeLine(board, point1, point2, color);
  rasterizeLine(board, point1, point3, color);
  rasterizeLine(board, point2, point3, color);
}

// Takes three points given as vec2 in pixel coordinates and a color
// as a vec3.  Draws a filled triangle between the points of the
// color. Implemented using flood fill.
export function rasterizeFilledTriangle(board, point1, point2, point3, color){
  var xMax = Math.max(point1[0], point2[0], point3[0]);
  var xMin = Math.min(point1[0], point2[0], point3[0]);
  var yMax = Math.max(point1[1], point2[1], point3[1]);
  var yMin = Math.min(point1[1], point2[1], point3[1]);
  var startPoint = [Math.round((xMax+xMin)/2), Math.round((yMax+yMin)/2)];
  floodFill(startPoint, board, point1, point2, point3, color);
  rasterizeTriangle(board, point1, point2, point3, color);
  reset();
}


function floodFill(pixel, board, point1, point2, point3, color){
  if(isFilled(pixel)){
    return;
  }
  else if (!withinTriangle(pixel, point1, point2, point3)){
    return;
  }
  else{
    rasterizePoint(board, pixel, color);
  }
  floodFill([pixel[0]+1,pixel[1]], board, point1, point2, point3, color);
  floodFill([pixel[0]-1,pixel[1]], board, point1, point2, point3, color);
  floodFill([pixel[0],pixel[1]-1], board, point1, point2, point3, color);
  floodFill([pixel[0],pixel[1]+1], board, point1, point2, point3, color);
  return;
}


function isFilled(point){
  return pointKey(point) in filledPixel;
}

// using odd-even test to check if a pixel is inside the shape
// point1, point2, point3 are the 3 vertices of the triangle
function withinTriangle(pointToCheck, point1, point2, point3){
  var numSidesIntersected = 0;
  if (isIntersected(point1, point2, pointToCheck)){
    numSidesIntersected++;
  }if (isIntersected(point1, point3, pointToCheck)){
    numSidesIntersected++;
  }if (isIntersected(point2, point3, pointToCheck)){
    numSidesIntersected++;
  }
  return (numSidesIntersected%2 == 1);
}

// test if two lines are interescted
// point1 & point2: two points on a boundary of a shape
// point 3: point to check if it's within the shape
function isIntersected(point1, point2, point3){
  var point4 = [-1,-1];
  var x1 = point1[0], x2 = point2[0], x3 = point3[0], x4 = point4[0];
  var y1 = point1[1], y2 = point2[1], y3 = point3[1], y4 = point4[1];
  var a1 = y2 - y1,
  a2 = y4 - y3,
  b1 = x2 - x1,
  b2 = x4 - x3,
  c1 = b1*y1 - a1*x1,
  c2 = b2*y3 - a2*x3;
  if ((a2*b1-a1*b2) == 0){
    // if parallel, pick another point outside the board
    point4 = [-4,-1];
    x4 = point4[0];
    y4 = point4[1];
    a2 = y4 - y3;
    b2 = x4 - x3;
    c2 = b2*y3 - a2*x3;
  }
  else{
    var intersectX = (c1*b2 - c2*b1) / (a2*b1 - a1*b2);
    var intersectY = (c1*a2 - c2*a1) / (a2*b1 - a1*b2);
  }
  return (Math.min(x1,x2) <= intersectX) && (intersectX <= Math.max(x1,x2)) &&
  (Math.min(y1,y2) <= intersectY) && (intersectY<= Math.max(y1,y2)) &&
  (Math.min(x3,x4) <= intersectX) && (intersectX <= Math.max(x3,x4)) &&
  (Math.min(y3,y4) <= intersectY) && (intersectY <= Math.max(y3,y4));
}

// Takes an array of seven points given as vec2 in pixel coordinates
// and a color given as a vec3.  Draws a filled 7-gon between from the
// point of the color.  Implemented using inside-outside test.
export function rasterizeFilledSevengon(board, points, color){

    // Extra Credit: Implement me!

}


// Takes two points given as vec2 in pixel coordinates and a color
// given as vec3.  Draws an antialiased line between them of the
// color.
export function rasterizeAntialiasLine(board, point1, point2, color){

    // Extra Credit: Implement me!
    // Remember to cite any sources you reference.

}
