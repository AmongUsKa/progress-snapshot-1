


// clean up time
var beanColors = [
  color(255, 0, 0),
  color(4, 0, 255),
  color(0, 230, 255),
  color(60, 255, 0),
  color(255),
  color(0)
];

/** PJS Setup **/
rectMode(CENTER);
textAlign(CENTER, CENTER);
noStroke();

var debugMode = !true;
var debugX, debugY;
var scene = "menu";
var pregameCountup = 0;
var rooms = [];
var colliders = [];
var players = [];
var me;
var objs = [];// Interactive components

var mouseWasPressed = false;
var keys = [];
var cam = {// Camera variables
    ht : 1,// ht = height, the number of pixels high the camera is from the ground
    gotoHt: 0.5,// Used for the smooth effect when zooming with the mouse scroll
    x: 10,
    y: 10,
    hw: width/2,// hw = half width of canvas
    hh: height/2// hh = half height of canvas
};
var X = function(cor){
  return (cor-cam.x)/cam.ht+cam.hw;
};
var Y = function(cor){
  return (cor-cam.y)/cam.ht+cam.hh;
};
var S = function(size){
  return size/cam.ht;
};
var RevX = function(pos){
  return (pos-cam.hw)*cam.ht+cam.x;
};
var RevY = function(pos){
  return (pos-cam.hh)*cam.ht+cam.y;
};
var RevS = function(size){
  return size*cam.ht;
};

var updateCamera = function() {
  cam.ht += (cam.gotoHt-cam.ht)*0.5;
  
  if (debugMode) {
    var panSpeed = 10*cam.ht;
    if (keys[UP]|| keys[87]) {
      cam.y -= panSpeed;
    }else if (keys[DOWN]|| keys[83]) {
      cam.y += panSpeed;
    }
    if (keys[LEFT]|| keys[65]) {
      cam.x -= panSpeed;
    } else if (keys[RIGHT]|| keys[68]) {
      cam.x += panSpeed;
    }
    if (mouseIsPressed) {
      _clearLogs();
      debugX = round(RevX(mouseX));
      debugY = round(RevY(mouseY));
      println(debugX+","+debugY);
    }

  } else {
    cam.x += (me.x-cam.x)*0.1;
    cam.y += (me.y-cam.y)*0.1;
  }
};


/** Fonts **/
var button_font_family = "Arial";
var font_title = loadFont("Comic Sans MS", 50);
var font_howto = loadFont("Arial Bold", 20);
var font_game = loadFont("monospace Bold", 20);


/** Button object **/
{
var printlnTxt = "";
var printlnI = 0;
var printlny = function(txt) {
  printlnTxt = txt;
  printlnI = 0;
};
var buttons = [];
var Button = function(on_scene, name, x_position, y_position, button_width, button_height, action) {
    
    /* Directly assigned properties */
    this.on_scene = on_scene;
    this.name = name;
    this.x = x_position;
    this.y = y_position;
    this.width = button_width;
    this.height = button_height;
    this.action = action;
    
    
    /* Generated properties */
    this.is_hover = false;
    this.corner_size = min(button_width, button_height)*0.2;
    this.font = loadFont(button_font_family, this.corner_size*3.4);
    this.edge_l = x_position - button_width/2;// Left edge x-position
    this.edge_r = x_position + button_width/2;// Right edge x-position
    this.edge_t = y_position - button_height/2;// Top edge y-position
    this.edge_b = y_position + button_height/2;// Button edge y-position
    
    
    /* Push to buttons array */
    buttons.push(this);
    
};
Button.prototype.on_mouse_click = function() {
    /* Clicking the button */
    if (this.is_hover) {
        this.is_hover = false;
        this.action();
    }
};
Button.prototype.update = function() {
    if (scene === this.on_scene) {
        
        /* Check if mouse hovers over button */
        if (mouseY > this.edge_t && mouseY < this.edge_b && mouseX > this.edge_l && mouseX < this.edge_r) {
            this.is_hover = true;
            cursor(HAND);
        } else {
            this.is_hover = false;
        }
        

        /* Draw the button */
        if (this.is_hover) {
            fill(255, 100);
        } else {
            fill(0, 0);
        }
        strokeWeight(3);
        stroke(255);
        rect(this.x, this.y, this.width, this.height, this.corner_size);
        fill(255, 255, 255);
        textFont(this.font);
        text(this.name, this.x, this.y);
        
    }
};
var update_buttons = function() {
    for (var i = 0; i < buttons.length; i ++) {
        buttons[i].update();
    }
    if (printlnI < printlnTxt.length) {
      printlnI ++;
      _clearLogs();
      println(printlnTxt.slice(0, printlnI));
    }
};
}
new Button("menu", // Shown on this scene
           "Singleplayer", // Button name
           165,    // Middle X-coordinate
           250,    // Middle Y-coordinate
           250,    // Button width
           60,     // Button height
           function(){scene = "pregame";pregameCountup=0;} // Call this when button is pressed
          );
new Button("menu", "Multiplayer", 435, 249, 250, 60, function(){printlny("This game mode is not available yet.");});
new Button("menu", "How to play", 165, 334, 250, 50, function(){scene = "howto";});
new Button("menu", "Credits", 435, 334, 250, 50, function(){scene = "credits";});
new Button("howto", "Return", 300, 550, 200, 50, function(){scene = "menu";});
new Button("credits", "Return", 300, 550, 200, 50, function(){scene = "menu";});

//new Button("game", "Back", 300, 50, 200, 50, function(){scene = "menu";});

// Credit to @BobLyon https://www.khanacademy.org/cs/i/5567955982876672
var isBetween = function (c, a, b) {
    return (a - c) * (b - c) <= 0;
};
var isInCircle = function (x, y, cx, cy, diam) {
    var dx = x - cx;
    var dy = y - cy;
    return dx * dx + dy * dy <= diam * diam / 4;
};
var lineCircleCollide = function (x1, y1, x2, y2, cx, cy, diam) {
    var m = (y2 - y1) / (x2 - x1);
    if (abs(m) > 1024) {
        return lineCircleCollide(y1, x1, y2, x2, cy, cx, diam);
    }
    if (isInCircle(x2, y2, cx, cy, diam)) {
        return true;
    }
    x1 -= cx;
    x2 -= cx;
    y1 -= cy;
    y2 -= cy;
    var r = diam * diam / 4;
    var k = y1 - m * x1;
    var a = (1 + m * m) / r;
    var b = 2 * m * k / r;
    var c = k * k / r - 1;
    var discrim = b * b - 4 * a * c;
    if (discrim < 0) {
        return false;
    }
    discrim = sqrt(discrim);
    a *= 2;
    return isBetween((-b - discrim) / a, x1, x2) || isBetween((-b + discrim) / a, x1, x2);
};
var isLineLineIntersect = function(x1, y1, x2, y2, x3, y3, x4, y4) {/** Credit to Jent@ /// **/
  // x1 must be less than x2, x3 must be less than x4
  var o = (x3 - x1 - (x2 - x1) / (y2 - y1) * y3 + (x2 - x1) / (y2 - y1) * y1)/((x2 - x1) / (y2 - y1) * (y4 - y3) - (x4 - x3));
  var x = x3 + (x4 - x3) * o;
  var y = y3 + (y4 - y3) * o;
  return x >= min(x1, x2) && x <= max(x1, x2)  && x >= min(x3, x4) && x <= max(x3, x4) && y >= min(y1, y2) && y <= max(y1, y2) && y >= min(y3, y4) && y <= max(y3, y4);
};

var LCollider = function(x1, y1, x2, y2) {
  y2 += 0.01;
  colliders.push(this);
  this.slack = 15;
  this.x0 = min(x1,x2)-this.slack;
  this.x3 = max(x1,x2)+this.slack;
  this.y0 = min(y1,y2)-this.slack;
  this.y3 = max(y1,y2)+this.slack;
  this.drawX1 = x1;
  this.drawY1 = y1;
  this.drawX2 = x2;
  this.drawY2 = y2;
  var chX = x2-x1;
  var chY = y2-y1;
  var mag = Math.sqrt(sq(chX)+sq(chY));
  var shorten = 0.5;
  chX *= shorten/mag;
  chY *= shorten/mag;
  this.x1 = x1 + chX;
  this.y1 = y1 + chY;
  this.x2 = x2 - chX;
  this.y2 = y2 - chY;
  
  this.update = function() {
  stroke(255, 255, 255);
  
  
  for (var i = 0; i < players.length; i ++) {
    var p = players[i];
    if (p.x-p.wasX === 0 && p.y-p.wasY === 0) {
      continue;// Ignore because player is not moving
    }
    if (p.x > this.x0 && p.x < this.x3 && p.y > this.y0 && p.y < this.y3) {
      // In range
      if (lineCircleCollide(this.x1, this.y1, this.x2, this.y2, p.x, p.y, p.s)) {
        if (p.alreadyCollided) {
          p.x = p.wasX;
          p.y = p.wasY;
          continue;// Check next player
        }
        p.alreadyCollided = true;// To prevent double collisions/out of bounds glitches

        // Player motion
        var pX =  p.x - p.wasX;
        var pY =  p.y - p.wasY;
        var angle = atan2(pY, pX);
        var pMag = Math.sqrt(sq(pX)+sq(pY));
        
        // Normalized player motion rotated 90 degrees
        var pnX = pY / pMag;
        var pnY = -pX / pMag;
        
        // Slope of wall
        var sX = this.x2 - this.x1;
        var sY = this.y2 - this.y1;
        var sMag = Math.sqrt(sq(sX)+sq(sY));
        sX /= sMag;
        sY /= sMag;
        
        // Normalized normal of wall
        var snX = sY;
        var snY = -sX;
        
        var dotProduct = snX*pnX + snY*pnY;
        var speed = p.ySpeed;
        
        // Sliding physics here
        ///_clearLogs();
        ///println("Player velocity: "+pX.toFixed(2)+" "+pY.toFixed(2)+"\nPlayer slide:    "+pnX.toFixed(2)+" "+pnY.toFixed(2)+"\nWall direction:  "+sX.toFixed(2)+" "+sY.toFixed(2)+"\nWall normal:     "+snX.toFixed(2)+" "+snY.toFixed(2));
        p.x = p.wasX + sX*dotProduct*speed;
        p.y = p.wasY + sY*dotProduct*speed;
        
        if (lineCircleCollide(this.x1, this.y1, this.x2, this.y2, p.x, p.y, p.s)) {



          // Push player away from point 1 if near it
          var chX = p.x - x1;
          var chY = p.y - y1;
          if (sq(chX)+sq(chY) < sq(p.s)) {
            p.x += chX/2;
            p.y += chY/2;
            continue;
          }
          
          // Push player away from point 2 if near it
          var chX = p.x - x2;
          var chY = p.y - y2;
          if (sq(chX)+sq(chY) < sq(p.s)) {
            p.x += chX/2;
            p.y += chY/2;
            continue;
          }
          
          // If nothing works, just revert to old position
          p.x = p.wasX;
          p.y = p.wasY;
         
        }
        
        }
      }
    }

  };
};

var ECollider = function(room, x, y, r) {
  
};

var Task = function(room, type, x, y) {
  this.room = room;
  this.type = type;
  this.x = x;
  this.y = y;
  
  this.update = function() {
    ellipse(X(this.x), Y(this.y), S(1), S(1));
  };
};

var Vent = function(id, x, y, connections) {
  objs.push(this);
  this.id = id;
  this.x = x;
  this.y = y;
  this.s = 1.4;
  this.connections = connections;
  this.maxDist = 2;
  this.maxDistSq = sq(this.maxDist);
  
  this.update = function() {
    var distSq = sq(me.x-this.x)+sq(me.y-this.y);
    if (distSq > this.maxDistSq) {
      fill(255, 0, 0);
    } else {
      fill(255, 255, 255);
    }
    rect(X(this.x), Y(this.y), S(this.s), S(this.s/2));
  };
};

var Room = function(type, x, y, w, h) {
  rooms.push(this);
  this.names = [];
  if (type.includes("-")) {
    var types = type.split("-");
    this.type = types[0];
    this.subtype = types[1];
  } else {
    this.type = type;
    this.subtype = "none";
  }
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.vertices = [];
  
  var x1, y1, x2, y2;
  x1 = this.x;
  y1 = this.y;
  x2 = this.x+this.w;
  y2 = this.y+this.h;
  
  switch(this.type) {
    case "cafeteria":
      var lastX, lastY;
      var angle = 0;
      for (var i = 0; i < 14; i ++) {
        angle += 30;
        if (i%3 === 2) {
          continue;
        }
        var x = this.x + this.w/2 * (0.95+cos(angle)) * 1.1;
        var y = this.y + this.h/2 * (0.95+sin(angle))* 1.1;
        if (i > 1) {
          if (i%3 === 1) {
            new LCollider(x, y, lastX, lastY);
          } else {
            if (i < 7 || i > 10) {
              new LCollider((x+lastX*2)/3, (y+lastY*2)/3, lastX, lastY);
              new LCollider((x*2+lastX)/3, (y*2+lastY)/3, x, y);
            } else {
              new LCollider(x, y, lastX, lastY);
            }
          }
            this.vertices.push({x: x, y: y});
        }
        lastX = x;
        lastY = y;
      }
      break;
      
    case "junction":
      this.vertices = [
        {x: x2, y: y1},
        {x: x1, y: y1},
        {x: x1, y: y2},
        {x: x2, y: y2},
      ];
      if (this.subtype === "hor") {
        new LCollider(x1, y1, x2, y1);
        new LCollider(x1, y2, x2, y2);
      } else if (this.subtype === "ver") {
        new LCollider(x1, y1, x1, y2);
        new LCollider(x2, y1, x2, y2);
      } else if (this.subtype === "TL") {
        new LCollider(x1, y1, x1, y2);
        new LCollider(x1, y1, x2, y1);
      } else if (this.subtype === "BR") {
        new LCollider(x2, y1, x2, y2);
        new LCollider(x1, y2, x2, y2);
      } else if (this.subtype === "TR") {
        new LCollider(x1, y1, x1, y2);
        new LCollider(x1, y2, x2, y2);
      } else if (this.subtype === "BL") {
        new LCollider(x2, y1, x2, y2);
        new LCollider(x1, y1, x2, y1);
      } else if (this.subtype === "L") {
        new LCollider(x1, y1, x1, y2);
      } else if (this.subtype === "B") {
        new LCollider(x1, y2, x2, y2);
      } else if (this.subtype === "T") {
        new LCollider(x1, y1, x2, y1);
      }
      break;
      
    case "corner":
      
      var vs = [
        {x: x2, y: y1},
        {x: x1, y: y1},
        {x: x1, y: y2},
        {x: x2, y: y2},
      ];
      var vsInd = function(index) {
        return vs[(index+vs.length)%vs.length];
      };
      var clipCorner = {"TL":1, "TR":0, "BL":2, "BR":3}[this.subtype];

      var v = vs.splice(clipCorner, 1)[0];
      var vUp = vsInd(clipCorner);
      var vDown = vsInd(clipCorner-1);
      
      var vMidUp = {x: (v.x+vUp.x)/2, y: (v.y+vUp.y)/2};
      var vMidDown = {x: (v.x+vDown.x)/2, y: (v.y+vDown.y)/2};
      vs.splice(clipCorner, 0, vMidUp);// Insert new edges
      vs.splice(clipCorner, 0, vMidDown);
      
      // Corner and 2 edges surounding corner
      new LCollider(vUp.x, vUp.y, vMidUp.x, vMidUp.y);
      new LCollider(vMidUp.x, vMidUp.y, vMidDown.x, vMidDown.y);
      new LCollider(vMidDown.x, vMidDown.y, vDown.x, vDown.y);
      
      // Opposite side 1
      var oppoV = vsInd(clipCorner-2);
      new LCollider(vDown.x, vDown.y, (vDown.x*3+oppoV.x)/4, (vDown.y*3+oppoV.y)/4);
      new LCollider(oppoV.x, oppoV.y, (vDown.x+oppoV.x*3)/4, (vDown.y+oppoV.y*3)/4);
      
      // Opposite side 2
      new LCollider(vUp.x, vUp.y, (vUp.x*3+oppoV.x)/4, (vUp.y*3+oppoV.y)/4);
      new LCollider(oppoV.x, oppoV.y, (vUp.x+oppoV.x*3)/4, (vUp.y+oppoV.y*3)/4);
      
      // Apply
      this.vertices = vs;
      break;
      
    case "square":
      this.vertices = [
        {x: x2, y: y1},
        {x: x1, y: y1},
        {x: x1, y: y2},
        {x: x2, y: y2},
      ];      
      if (this.subtype === "admin") {
        new LCollider(x1, y1, x2, y1);
        new LCollider(x1, (y1*4+y2*3)/7, x1, y2);
        new LCollider(x2, y2, x1, y2);
      } else if (this.subtype === "coms") {
        
        new LCollider(x1, y1, (x1+x2)/2, y1);
        new LCollider(x1, y1, x1, y2);
        new LCollider(x2, y2, x1, y2);
      } else if (this.subtype === "electrical") {
        new LCollider(x1, y1, x2, y1);
        new LCollider(x1, y1, x1, y2);
        new LCollider((x1*2+x2)/3, y2, x2, y2);        
      }
      new LCollider(x2, y2, x2, y1);
      break;
      
    case "storage":
      this.vertices = [
        {x: x2, y: y1},// TR
        {x: (x1*2+x2)/3, y: y1},//TL top
        {x: x1, y: (y1*3+y2)/4},//TL left
        {x: x1, y: (y1+y2*3)/4},//BL left
        {x: (x1*2+x2)/3, y: y2},//BL bottom
        {x: x2, y: y2},// BR
      ];
      var v = this.vertices;
      var TR = v[0];
      var TLT = v[1];
      var TLL = v[2];
      var BLL = v[3];
      var BLB = v[4];
      var BR = v[5];
      new LCollider(TR.x, TR.y, (TLL.x+TR.x*7)/8, TR.y);
      new LCollider(TLT.x, TLT.y, (TLL.x*3.56+TR.x*6.2)/10, TR.y);
      new LCollider(TLT.x, TLT.y, TLL.x, TLL.y);
      new LCollider(TLL.x, TLL.y, BLL.x, (TLL.y+BLL.y)/2);
      
      new LCollider(BLL.x, BLL.y, BLB.x, BLB.y);
      new LCollider(BLB.x, BLB.y, BR.x, BR.y);
      new LCollider(BR.x, BR.y, BR.x, (BR.y*4+TR.y*3)/7);
      new LCollider(BR.x, (BR.y*2.9+TR.y*7.1)/10, TR.x, TR.y);
      break;
      
    case "sudoku":
      var vs = [
        {x: x2, y: y1},
        {x: x1, y: y1},
        {x: x1, y: y2},
        {x: x2, y: y2},
      ];
      var vsInd = function(index) {
        return vs[(index+vs.length)%vs.length];
      };
      var clipEdges = {"L":[1,2], "R":[3,0], "T":[0,1], "B":[2,3]}[this.subtype];
      var c1 = clipEdges[0];
      var c2 = clipEdges[1];
      
      // Default edges
      new LCollider(vsInd(c2).x, vsInd(c2).y, vsInd(c2+1).x, vsInd(c2+1).y);
      new LCollider(vsInd(c2+2).x, vsInd(c2+2).y, vsInd(c2+1).x, vsInd(c2+1).y);
      new LCollider(vsInd(c2+2).x, vsInd(c2+2).y, vsInd(c2+3).x, vsInd(c2+3).y);
      
      // Clipped edge
      var cMidLX = (vs[c1].x*2+vs[c2].x)/3;
      var cMidLY = (vs[c1].y*2+vs[c2].y)/3;
      var cMidRX = (vs[c1].x+vs[c2].x*2)/3;
      var cMidRY = (vs[c1].y+vs[c2].y*2)/3;
      new LCollider(vs[c1].x, vs[c1].y, cMidLX, cMidLY);
      new LCollider(vs[c2].x, vs[c2].y, cMidRX, cMidRY);
      this.vertices = vs;
      break;

      
  }
  
  this.addTask = function(type, x, y) {
    new Task(this, type, x, y);
    return this;
  };
  
  this.addNames = function(names) {
    this.names.concat(names);
    return this;
  };
  
  this.addVent = function(id, x, y, connections) {
    new Vent(id, x, y, connections);
  };
  
  this.update = function() {
    switch(this.type) {
      case "cafeteria":

        break;
    }
    fill(100);
    if (me.x>this.x&&me.x<this.x+this.w&&me.y>this.y&&me.y<this.y+this.h) {
      /// In room
    }
            
        stroke(100);
        strokeWeight(S(3));
    beginShape();
    for (var i = 0; i < this.vertices.length; i ++) {
      var v = this.vertices[i];
      vertex(X(v.x), Y(v.y));
    }
    endShape(CLOSE);
  };
};

// Cafeteria and connecting junctions
new Room("cafeteria", 543, 2, 352, 352).addTask("wires", 45, 5).addTask("wires", 55, 6).addNames("in cafeteria", "at spawn", "near spawn");
//new LCollider();
new Room("junction-T", 318, 155, 241, 62).addNames("between spawn and upper engine", "between spawn and medbay", "coming out of medbay", "left of cafeteria");
new LCollider(318, 217, 458, 217);
new LCollider(501, 217, 558, 217);
new Room("junction-hor", 895, 156,57, 60).addNames("by weapons", "near weapons");
new Room("junction-L", 698, 355, 60, 114).addNames("near admin", "above storage", "below cafeteria");
new LCollider(698+60, 355, 698+60, 394);
new LCollider(698+60, 458, 698+60, 468);

// admin and connecting room
new Room("junction-hor", 759, 396, 35, 60);
new Room("square-admin", 795, 396, 146, 143);

// TR of map
new Room("corner-TR", 953,118,138,134);
new Room("junction-ver", 990, 253, 64, 30).addNames("a", "b");
new Room("junction-hor", 972, 310, 18, 47).addNames("a", "b");
new Room("junction-L", 990, 283, 63, 25).addNames("a", "b");
new Room("junction-BL", 1055, 284, 62, 38).addNames("a", "b");
new Room("junction-L", 1052, 360, 65, 11).addNames("a", "b");
new Room("junction-BR", 1056, 386, 62, 45).addNames("a", "b");
new Room("junction-TL", 992, 373, 62, 60).addNames("a", "b").addVent();
new Room("junction-ver", 992, 432, 62, 75).addNames("a", "b");


new Room("junction-B", 990, 310, 61, 47).addNames("a", "b");
new Room("junction", 1053, 310, 63, 75).addNames("a", "b");

//oxygen
new Room("corner-TL", 861, 284, 110, 100).addNames("a", "b");
new LCollider(890, 384, 943, 384);

// shields, coms
new Room("corner-BR", 953, 508, 140, 160).addNames("a", "b");
new Room("junction-T", 781, 552, 173, 71).addNames("a", "b");
new LCollider(781, 552+71, 781+87, 552+71);
new LCollider(939, 552+71, 866+87, 552+71);
new Room("junction-ver", 870, 625, 68, 16).addNames("a", "b");
new Room("square-coms", 793, 642, 145, 115);

// storage
new Room("storage", 600, 470, 180, 275);

// electrical and surrounding junctions
new Room("square-electrical", 445, 427, 140, 166);
new Room("junction-ver", 445, 594, 46, 14);
new Room("junction-B", 417, 610, 182, 64);
new LCollider(423, 610, 444, 610);
new LCollider(492, 610, 599, 610);

new Room("junction-TR", 370, 610, 50, 64);
new Room("junction-BL", 370, 526, 50, 84);
new Room("junction-hor", 317, 526, 52, 60);
new LCollider(315, 588, 315, 600);
new LCollider(370, 588, 370, 606);

// medbay and surrounding junctions
new Room("sudoku-T", 413, 236, 132, 167);
new Room("junction-ver", 459, 217, 41, 17);

// engines junctions in between
new Room("corner-BL", 175, 483, 140, 160);
new Room("corner-TL", 176, 114, 140, 160);
new LCollider(210, 274,224, 274);
new LCollider(210, 483,227, 483);
new Room("junction-ver", 228, 404, 50, 77);
new Room("junction-hor", 278, 347, 40, 53);
new Room("junction-hor", 192, 348, 33, 53);
new Room("junction-ver", 226, 274, 52, 70).addNames("a", "b");
new Room("junction", 225, 344, 53, 62).addNames("a", "b");
new LCollider(316, 217, 316, 235);

// security
new Room("sudoku-L", 319, 292, 80, 164);

// reactor
new Room("sudoku-R", 57, 294, 133, 163);

// navigation
new Room("sudoku-L", 1199, 265, 92, 175);
new Room("junction-hor", 1118, 323, 80, 60);

var drawCharacter = function(x, y, size, facingLeft, col){/** Credit to VEXCESS @VXS **/
    rectMode(LEFT);
    pushMatrix();
        translate(x-200*size, y-200*size);
        scale(size);
        if (facingLeft) {
            scale(-1, 1);
            translate(-400, 0);
        }
        noStroke();
        
        fill(0, 0, 0);
        ellipse(203, 173, 39, 26);
        rect(181, 166, 45, 57, 13);
        rect(170, 181, 14, 43, 10);
        rect(182, 211, 21, 27, 10);
        rect(206, 211, 18, 24, 10);
        
        fill(col);
        //245, 245, 85
        rect(174, 186, 7, 33, 63);
        rect(177, 186, 4, 33);
        rect(187, 165, 31, 34, 63);
        rect(190, 180, 32, 34, 63);
        rect(188, 175, 32, 34, 63);
        
        fill(lerpColor(color(0, 0, 0), col, 0.5));
        //fill(194, 139, 0);
        rect(174, 192, 7, 27, 55);
        rect(177, 192, 4, 27);
        rect(185, 210, 14, 24, 63);
        rect(210, 221, 10, 11, 23);
        triangle(192, 221, 186, 179, 185, 221);
        triangle(201, 219, 187, 198, 185, 221);
        triangle(220, 219, 222, 202, 208, 219);
        rect(189, 212, 27, 7);
        triangle(220, 216, 220, 228, 210, 215);
        
        fill(0, 0, 0);
        rect(194, 173, 36, 22, 63);
        
        fill(75, 100, 110);
        rect(198, 176, 29, 16, 63);
        
        fill(150, 200, 220);
        rect(201, 176, 24, 10, 63);
        
        fill(255, 255, 255);
        rect(207, 176, 15, 7, 63);
        
    popMatrix();
    rectMode(CENTER);
};

var Bean = function(name, isHuman, isImposter, x, y) {
  this.isDead = false;
  players.push(this);
  this.name = name;
  this.isHuman = isHuman;
  this.isImposter = isImposter;
  this.x = this.wasX = this.seekX = x;
  this.y = this.wasY = this.seekY = y;
  this.s = 22;// Size
  this.col = beanColors[players.length-1];
  this.avatars = {
    "happy": getImage("creatures/OhNoes-Happy"),
    "hmm": getImage("creatures/OhNoes-Hmm"),
    "ohno": getImage("creatures/OhNoes"),
  };
  this.face = "happy";
  this.facingEast = true;
  this.xSpeed = 3;///
  this.ySpeed = this.xSpeed*0.88;
  this.mouseRangeSlowdown = 50;
  this.speedMultiplier = 1;// For player control
  this.isMoving = false;// Read-only
  this.alreadyCollided = false;// For collision physics
  this.sees = [];// For partial visibility for humans and voting logic for AI
  this.notSees = [];
  this.nearbyColliders = [];// For optimization
  
  this.humanControls = function() {
    // Key controls
    this.speedMultiplier = 0;
    if (keys[LEFT] || keys[65]) { 
      this.speedMultiplier = 1;
      this.seekX = this.x - 1;
    } else if (keys[RIGHT] || keys[68]) { 
      this.speedMultiplier = 1;
      this.seekX = this.x + 1;
    }
    if (keys[UP] || keys[87]) {
      this.speedMultiplier = 1;
      this.seekY = this.y - 1;
    } else if (keys[DOWN] || keys[83]) { 
      this.speedMultiplier = 1;
      this.seekY = this.y + 1;
    }
    
    // Mouse controls
    if (mouseIsPressed && mouseButton === LEFT) {
      this.speedMultiplier = 1;
      this.seekX = RevX(mouseX);
      this.seekY = RevY(mouseY);
      var mouseMag = Math.sqrt(sq(mouseX-X(this.x))+sq(mouseY-Y(this.y)));
      if (mouseMag < this.mouseRangeSlowdown) {
        this.speedMultiplier = mouseMag / this.mouseRangeSlowdown;
      }
    }
    
  };
  
  this.ai = function() {
    this.seekX = this.x+cos(frameCount/3);
    this.seekY = this.y+sin(frameCount/7);
  };

  this.update = function() {
    // Movement
    this.speedMultiplier = 1;
    this.alreadyCollided = false;
    this.wasX = this.x;
    this.wasY = this.y;
    this.seekX = this.x;
    this.seekY = this.y;
    
    // Change velX and velY
    if (this.isHuman) {
      this.humanControls();
    } else {
      this.ai();
    }
    
    
    
    // More movement code
    this.isMoving = (this.seekX !== this.x || this.seekY !== this.y);
    var velX = this.seekX - this.x;
    var velY = this.seekY - this.y;
    if (velX || velY) {
      if (velX < 0) {
        this.facingEast = false;
      }
      if (velX > 0) {
        this.facingEast = true;
      }
      var mag = Math.sqrt(sq(velX)+sq(velY));
      velX *= this.xSpeed / mag;
      velY *= this.ySpeed / mag;
      this.x += velX * this.speedMultiplier;
      this.y += velY * this.speedMultiplier;
    }
    if (this !== me){return;}
    this.nearbyColliders = [];
    var seeWallDistance = 80;
    for(var i = 0; i < colliders.length; i += 1) {
      var w = colliders[i];
      if (
        (abs(w.x1 - this.x) < seeWallDistance && abs(w.y1 - this.y) < seeWallDistance) || 
        (abs(w.x2 - this.x) < seeWallDistance && abs(w.y2 - this.y) < seeWallDistance)) {
        this.nearbyColliders.push(w);
      }
    }
    ///println(this.nearbyColliders.length);
    
    /* Update other beans that are visible to this bean */
    this.sees = [];
    this.notSees = [];
    for (var i = 0; i < players.length; i ++) {
      var isIntersection = false;
      var p = players[i];
      if (p === this) {// You can't "see" yourself
        continue;
      }
      for (var j = 0; j < this.nearbyColliders.length; j ++) {
        /* Thanks to everyone in the KACC discord server for helping me figure this out */
        var w = this.nearbyColliders[j];// w for collider (wall)
        
                //
          strokeWeight(40);
          stroke(0,255,0);
          //line(X(w.x1),Y(w.y1),X(w.x2),Y(w.y2));
          //
        isIntersection = isLineLineIntersect(w.x1, w.y1, w.x2, w.y2, this.x, this.y, p.x, p.y);
        
        if (isIntersection) {// If wall blocks line of sight
                   //
          strokeWeight(20);
          stroke(217, 112, 255);
          line(X(w.x1),Y(w.y1),X(w.x2),Y(w.y2));
          line(X(this.x),Y(this.y),X(p.x),Y(p.y));
          //
        
          this.notSees.push(p);
          break;
        }
      }
      if (!isIntersection) {
        this.sees.push(p);
      }
    }
    //debug(this.sees,this.notSees);;
    
  };
  this.draw = function() {
    // Drawing
    var walkY = 0;
    if (this.isMoving) {
      walkY = sin(frameCount*24)*this.s/20;
    }
    drawCharacter(X(this.x), Y(this.y-this.s/4+walkY), S(this.s/60), !this.facingEast, this.col);
  };
  
  this.lineOfSight = function() {/** Credit to Jent @iforgothisusername /// **/
    if (true){return;}
    fill(5, 5, 10);
    noStroke();

    
    for (var i = 0; i < this.nearbyColliders.length; i ++) {
      var w = this.nearbyColliders[i];
      quad(
        X(w.drawX1), Y(w.drawY1),
        X(w.drawX2), Y(w.drawY2),
        X(this.x + (w.drawX2 - this.x) * 100), Y(this.y + (w.drawY2 - this.y) * 100),
        X(this.x + (w.drawX1 - this.x) * 100), Y(this.y + (w.drawY1 - this.y) * 100)
      );
    }
  };
};
me = new Bean("Me", true, true, 736,248);

new Bean("CPU 2", false, false, 736, 248);
new Bean("CPU 3", false, false, 345, 440);
new Bean("CPU 3", false, false, 144, 440);

var menuBalls = [];
for (var i = 0; i < 25; i ++) {
  menuBalls.push({
    x: random(0, width),
    y: random(0, height),
    s: random(0.5, 5)
  });
}
var menuIn, menuWasIn;
menuIn = menuWasIn = false;
var menuFc = 0;
var sceneMenu = function() {

  background(0);
  
  // Title
  textFont(font_title);
  text("Among Khan", 300, 100);
  menuWasIn = menuIn;
  menuIn = mouseX > 160 && mouseX < 440 && mouseY > 80 && mouseY < 120;
  if (menuIn || (12*menuFc)%1200 < 800) {
    if (menuIn && !menuWasIn) {
      menuFc = -20;
    } else {
      menuFc++;
    }
    stroke(0, 0, 0);
    strokeWeight(2);
    for (var i = 0; i < 50; i ++) {
      var x = (12*(i+menuFc))%1200;
      line(x-600, 0, x, 200);
    }
  }
  
  // Snowballs
  fill(255);
  stroke(255);
  strokeWeight(1);
  for (var i = 0; i < menuBalls.length; i ++) {
    var ms = menuBalls[i];
    ms.x += ms.s/4;
    ellipse(ms.x, ms.y, ms.s, ms.s);
  }
  if (frameCount%20 === 0) {
    menuBalls.push({
      x: 0,
      y: random(0, height),
      s: random(0.5, 7)
    });
  }
  
  
  
  image(getImage("avatars/starky-ultimate"), 487, 424);
  image(getImage("avatars/mr-pants-purple"), -1, 401);
  image(getImage("creatures/OhNoes"), 86, 478);
  image(getImage("creatures/Hopper-Cool"), 429, 478);
};

var sceneHowto = function() {
  background(0);
  textFont(font_title);
  text("How to Play", 300, 50);
  
};
var sceneCredits = function() {
  
  background(0);
  textFont(font_title);
  text("Among Khan", 300, 50);
};

var initGame;
var scenePregame = function() {
  background(31, 30, 43);
  
  textFont(font_title);
  text("fake loading screen...", 300, 50);
  
  if (++pregameCountup > 120 || (pregameCountup > 5 && mouseWasPressed)) {
    initGame();
  }
};

var initGame = function() {
  cam.x = me.x;
  cam.y = me.y;
  scene = "game";
};
initGame();

var sceneGame = function() {
  
  background(0);
  updateCamera();
  
  /* Draw rooms */
  for (var i = 0; i < rooms.length; i ++) {
    rooms[i].update();
  }
  
  /* Draw room decor */
  
  /* Update player movement and AI */
  for (var i = players.length-1; i >= 0; i --) {
    var player = players[i];
    player.update();
    if (player.isDead) {
      player.splice(i, 1);
    }
  }
  
  /* Draw players that are NOT visible to me so they can appear in the shadows */
  for (var i = 0; i < me.notSees.length; i ++) {
    var player = me.notSees[i];
    player.draw();
  }
  
  /* Restrict player vision */
  me.lineOfSight();
  
  /* Update collisions */
  for (var i = 0; i < colliders.length; i ++) {
    colliders[i].update();
  }
  
  /* Draw collisions as walls */ 
  for (var i = 0; i < me.nearbyColliders.length; i ++) {
    var w = me.nearbyColliders[i];
    strokeWeight(S(5));
    line(X(w.drawX1), Y(w.drawY1), X(w.drawX2), Y(w.drawY2));
  }
  
  for (var i = objs.length-1; i >= 0; i --) {
    var obj = objs[i];
    obj.update();
    if (obj.isDead) {
      objs.splice(i, 1);
    }
  }
  
  /* Draw players that are visible to me */
  for (var i = me.sees.length-1; i >= 0; i --) {
    var player = me.sees[i];
    player.draw();
  }
  me.draw();// Cannot see yourself
  
  if (debugMode) {cam.x=me.x;cam.y=me.y;///
    noStroke();
    fill(0, 255, 247);
    ellipse(X(debugX), Y(debugY), 10, 10);
  }
  
};

if (debugMode) {
(function(w){return this[w];})("window").Processing.instances[0].externals.canvas.onwheel=function(e){e.preventDefault();};/*Source: www.khanacademy.org/cs/i/3452477363 */
mouseScrolled = function (){cam.gotoHt *= (1-mouseScroll/5);};
}

mousePressed = function() {
  mouseWasPressed = true;
    for (var i = 0; i < buttons.length; i ++) {
        buttons[i].on_mouse_click();// Check every button if clicked
    }

};
keyPressed = function() {
  keys[keyCode] = true;
};

keyReleased = function() {
  keys[keyCode] = false;
};

draw = function() {
  cursor(ARROW); 
  
  switch (scene) {
    case "game":
      sceneGame();
      break;
    case "pregame":
      scenePregame();
      break;
    case "menu":
      sceneMenu();
      break;
    case "howto":
      sceneHowto();
      break;
    case "credits":
      sceneCredits();
      break;        

        
    // Add scene here
        
    default:
        println("Scene '"+scene+"' does not exist.");
  }
  
  update_buttons();  
  

  
  
  mouseWasPressed = false;
  
  //background(0);
};
