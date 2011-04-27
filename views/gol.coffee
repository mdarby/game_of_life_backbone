class Cells extends Backbone.Collection
  model: Cell

class Cell extends Backbone.Model
  initialize: (options) ->
    this.set({
      x: options.x,
      y: options.y,
      id: options.x + "x" + options.y,
      alive: 0
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
    # 'this' == CellView
    $('#board').append(@el)
    return this

  birth: ->
    $(@el).css('background', '#0AF')

  death: ->
    $(@el).css('background', '#DDD')

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
        nextState = @nextGen.get(id)

        if nextState is 1 then cell.live() else cell.die()

  check: (cell) ->
    crowd = @neighborhood(cell)

    if cell.get("alive") is 1
      return 0 if crowd <= 1
      return 0 if crowd >= 4
    else
      return 1 if crowd is 3

    return cell.alive

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
      if cell.alive is 1 then num = 1 else num = 0

    return num

  coordinates: (cell) ->
    bits = cell.id.split('x')
    return {x: parseInt(bits[0]), y: parseInt(bits[1])}

class BoardView extends Backbone.View
  el: $('#board'),
  collection: Cells,

  initialize: ->
    this.render()

  render: ->
    @el.html('')

    @collection.each((cell) ->
      new CellView({model: cell})

      # rand = Math.floor((Math.random() * 10))
      # if(rand % 2 is 0){ cell.live() }
    )

    return this

class Game extends Backbone.Model
  initialize: (options) ->
    @board = new Board(options)

  run: (count) ->
    for x in [0..count]
      @step()

  step: ->
    @board.step()
