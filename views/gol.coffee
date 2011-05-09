class Cells extends Backbone.Collection
  model: Cell

class Cell extends Backbone.Model
  initialize: (options) ->
    this.set({
      x: options.x,
      y: options.y,
      id: options.x + "x" + options.y,
      alive: options.alive
    })

  die: ->
    this.set({alive: 0})

  live: ->
    this.set({alive: 1})

  toggle: ->
    if this.get("alive") is 0 then this.live() else this.die()

class CellView extends Backbone.View
  model: Cell,
  className: "cell",

  events:
    "mouseover": "toggle"

  initialize: ->
    _.bindAll(this, "changeState")
    this.model.bind("change:alive", this.changeState)
    this.render()

  render: ->
    $('#board').append(@el)
    return this

  birth: ->
    $(@el).css('background', 'crimson')

  death: ->
    $(@el).css('background', '#FFF')

  toggle: ->
    this.model.toggle()

  changeState: ->
    if this.model.get("alive") is 1 then this.birth() else this.death()

class Board extends Backbone.Model
  initialize: (options) ->
    @size = options.size
    @cells = new Cells()

    for x in [1..(@size)]
      for y in [1..(@size)]
        @cells.add(new Cell({x: x, y: y, alive: 0}))

    @view = new BoardView({collection: this.cells})

  clear: ->
    @cells.each((cell)->
      cell.die()
    )

  random: ->
    this.clear()

    @cells.each((cell) ->
      rand = Math.floor((Math.random() * 10))

      if rand % 3 is 0
        cell.live()
    )

  step: ->
    @nextGen = new Cells()

    for x in [1..(@size)]
      for y in [1..(@size)]
        id = x + "x" + y
        cell = @cells.get(id)
        alive = @check(cell)
        @nextGen.add(new Cell({x: x, y: y, alive: alive}))

    for x in [1..(@size)]
      for y in [1..(@size)]
        id = x + "x" + y
        cell = @cells.get(id)
        nextGen = @nextGen.get(id)
        state = nextGen.get("alive")

        if state is 1 then cell.live() else cell.die()

  check: (cell) ->
    crowd = @neighborhood(cell)
    alive = cell.get("alive")

    if alive is 1
      alive = 0 if crowd <= 1
      alive = 0 if crowd >= 4
    else
      alive = 1 if crowd is 3

    return alive

  neighborhood: (cell) ->
    c = @coordinates(cell)
    count = 0

    count += @topLeft(c)
    count += @top(c)
    count += @topRight(c)
    count += @left(c)
    count += @right(c)
    count += @bottomLeft(c)
    count += @bottom(c)
    count += @bottomRight(c)

    return count

  topLeft: (c) ->
    return @cellValue((c.x - 1) + "x" + (c.y - 1))

  top: (c) ->
    return @cellValue((c.x - 1) + "x" + c.y)

  topRight: (c) ->
    return @cellValue((c.x - 1) + "x" + (c.y + 1))

  left: (c) ->
    return @cellValue(c.x + "x" + (c.y - 1))

  right: (c) ->
    return @cellValue(c.x + "x" + (c.y + 1))

  bottomLeft: (c) ->
    return @cellValue((c.x + 1) + "x" + (c.y - 1))

  bottom: (c) ->
    return @cellValue((c.x + 1) + "x" + c.y)

  bottomRight: (c) ->
    return @cellValue((c.x + 1) + "x" + (c.y + 1))

  cellValue: (id) ->
    num = 0
    cell = @cells.get(id)

    if cell isnt undefined
      if cell.get("alive") is 1 then num = 1 else num = 0

    return num

  coordinates: (cell) ->
    return {x: cell.get("x"), y: cell.get("y")}

class BoardView extends Backbone.View
  el: $('#board'),
  collection: Cells,

  initialize: ->
    this.render()

  render: ->
    @el.html('')

    @collection.each((cell) ->
      new CellView({model: cell})
    )

    return this

class Game extends Backbone.Model
  initialize: (options) ->
    @size     = options.size
    @board    = new Board({size: @size})
    @controls = new Controls({model: this, el: "body"})
    @counter  = new GenerationCount({model: this})

    this.set({"gen": 0, "speed": 200})

  start: ->
    return if @int

    @int = setInterval( (_this) ->
      _this.step()
    , this.get("speed"), this)

  stop: ->
    return unless @int
    clearInterval(@int)
    @int = undefined

  clear: ->
    this.stop()
    @board.clear()
    this.set({"gen": 0})

  random: ->
    @board.random()

  step: ->
    @board.step()
    this.incrementGen()

  incrementGen: ->
    g = this.get("gen")
    this.set({"gen": g+1})

class GenerationCount extends Backbone.View
  el: "#generations",

  initialize: ->
    _.bindAll(this, "updateCount")
    this.model.bind("change:gen", this.updateCount)

  updateCount: ->
    $(@el).html("Generation: #{this.model.get("gen")}")

class Controls extends Backbone.View
  events:
    "click #random" : "random",
    "click #start"  : "start",
    "click #stop"   : "stop",
    "click #clear"  : "clear",
    "keyup"         : "step",
    "change #speed" : "changeSpeed"

  random: ->
    this.model.random()

  start: ->
    this.model.start()

  stop: ->
    this.model.stop()

  clear: ->
    this.model.clear()

  step: (e) ->
    this.model.step() if e.keyCode is 32

  changeSpeed: ->
    speed = $("#speed").val()
    this.model.stop()
    this.model.set({"speed", speed})

