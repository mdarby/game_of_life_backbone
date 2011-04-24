var Cells = Backbone.Collection.extend({ model: Cell });

var Cell = Backbone.Model.extend({

  initialize: function(options){
    this.set({
      x: options.x,
      y: options.y,
      id: options.x + "x" + options.y,
      alive: options.alive
    });

    this.view = new CellView({model: this});

    if(options.alive == 1){ this.live(); }
  },
  die: function(){
    this.alive = 0;
    this.view.death();
  },
  live: function(){
    this.alive = 1;
    this.view.birth();
  }

});


var CellView = Backbone.View.extend({
  className: "cell",

  events: {
    "mouseover": "toggle"
  },

  initialize: function(){
    _.bindAll(this, "render");
    this.render();
  },
  render: function(){
    $('#board').append(this.el);
    return this;
  },
  birth: function(){
    $(this.el).css('background', '#0AF');
  },
  death: function(){
    $(this.el).css('background', '#DDD');
  },
  toggle: function(){
    if(this.model.alive == 0){
      this.model.live();
    } else {
      this.model.die();
    }
  }

});


var Board = Backbone.Model.extend({

  initialize: function(options){
    this.size = options.size;
    this.cells = new Cells();

    for(var x=0; x < this.size; x++){
      for(var y=0; y < this.size; y++){

        var alive = 0;
        var rand = Math.floor((Math.random() * 10));
        if(rand % 2 === 0){ alive = 1; }

        this.cells.add(new Cell({x: x, y: y, alive: alive}));
      }
    }
  },
  step: function(){
    for(var x=0; x < this.size; x++){
      for(var y=0; y < this.size; y++){
        var id = x + "x" + y;
        var cell = this.cells.get(id);
        this.judge(cell);
      }
    }
  },
  judge: function(cell){
    var crowd = this.neighborhood(cell);

    if(cell.alive === 1){
      if(crowd <= 1){ cell.die(); }
      if(crowd >= 4){ cell.die(); }
    } else {
      if(crowd === 3){ cell.live(); }
    }
  },
  neighborhood: function(cell){
    var c = this.coordinates(cell);
    var count = 0;

    count += this.topLeft(c);
    count += this.top(c);
    count += this.topRight(c);
    count += this.left(c);
    count += this.right(c);
    count += this.bottomLeft(c);
    count += this.bottom(c);
    count += this.bottomRight(c);

    return count;
  },
  topLeft: function(c){
    return this.cellValue((c.x - 1) + "x" + (c.y - 1));
  },
  top: function(c){
    return this.cellValue((c.x - 1) + "x" + c.y);
  },
  topRight: function(c){
    return this.cellValue((c.x - 1) + "x" + (c.y + 1));
  },
  left: function(c){
    return this.cellValue(c.x + "x" + (c.y - 1));
  },
  right: function(c){
    return this.cellValue(c.x + "x" + (c.y + 1));
  },
  bottomLeft: function(c){
    return this.cellValue((c.x + 1) + "x" + (c.y - 1));
  },
  bottom: function(c){
    return this.cellValue((c.x + 1) + "x" + c.y);
  },
  bottomRight: function(c){
    return this.cellValue((c.x + 1) + "x" + (c.y + 1));
  },
  cellValue: function(id){
    var num = 0;
    var cell = this.cells.get(id);

    if(cell != undefined){
      if(cell.alive === 1){
        num = 1;
      } else {
        num = 0;
      }
    }

    return num;
  },
  coordinates: function(cell){
    var bits = cell.id.split('x');
    return {x: parseInt(bits[0]), y: parseInt(bits[1])};
  }

});


var Game = Backbone.Model.extend({

  initialize: function(options){
    this.board = new Board(options);
  },
  run: function(count){
    for(var x=0; x < count; x++){
      this.board.step();
    }
  }

});
