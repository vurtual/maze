const canvas = document.querySelector('canvas')
const cellSize = 20
canvas.width = window.innerWidth - (window.innerWidth % cellSize) // - 3 * cellSize
canvas.height = window.innerHeight - (window.innerHeight % cellSize) // - 3 * cellSize
canvas.style.width = canvas.width
canvas.style.height = canvas.height
const ctx = canvas.getContext('2d')

const MOVEMENT_INTERVAL = 20
const MODE = { RUN_FORWARD: 0, BACKTRACK: 1, COMPLETE: 2 }

let lastTime = 0
let timeElapsedSinceLastMove = 0
const animate = timestamp => {
  const deltaTime = timestamp - lastTime
  lastTime = timestamp
  timeElapsedSinceLastMove += timestamp
  if (timeElapsedSinceLastMove > MOVEMENT_INTERVAL) {
    Grid.update()
    timeElapsedSinceLastMove -= MOVEMENT_INTERVAL
  }
  Grid.layout.flat().forEach(cell => cell.draw())
  window.requestAnimationFrame(animate)
}

const start = () => {
  while (mode !== MODE.COMPLETE) {
    if (mode === MODE.RUN_FORWARD) Cell.moveToUnvisitedNeighbour()
    if (mode === MODE.BACKTRACK) Cell.backtrack()
  }
  Grid.layout.flat().forEach(cell => cell.draw())
}

class Cell {
  static size = cellSize

  static init() {
    for (let row = 0; row < canvas.height / Cell.size; row++) {
      for (let col = 0; col < canvas.width / Cell.size; col++) {
        new Cell(col, row)
      }
    }
    Grid.layout.flat().forEach(cell => (cell.neighbour = cell.getNeighbours()))
    animate(0)
  }

  moveToUnvisitedNeighbour(route) {
    route.route.push(this)
    if (this.neighbours.length == 0) this.neighbours = this.getNeighbours()
    const unvisitedNeighbours = this.neighbours.filter(
      neighbour => !neighbour.visited && !neighbour.current
    )
    if (unvisitedNeighbours.length > 0) {
      const next =
        unvisitedNeighbours[
          Math.floor(Math.random() * unvisitedNeighbours.length)
        ]
      next.current = true
      this.current = false
      this.visited = true
      if (next.row === this.row + 1) {
        next.walls.n = false
        this.walls.s = false
      }
      if (next.row === this.row - 1) {
        next.walls.s = false
        this.walls.n = false
      }
      if (next.col === this.col + 1) {
        next.walls.w = false
        this.walls.e = false
      }
      if (next.col === this.col - 1) {
        next.walls.e = false
        this.walls.w = false
      }
      next.color = route.color
      route.current = next
      if (!next.visited) {
        route.count++
      }
    } else {
      route.mode = MODE.BACKTRACK
    }
  }

  backtrack(route) {
    route.route.pop()
    if (route.route.length > 0) {
      const previous = route.route.pop()
      this.current = false
      this.visited = true
      previous.current = true
      route.mode = MODE.RUN_FORWARD
      route.current = previous
    } else {
      route.mode = MODE.COMPLETE
      if (
        Grid.routes.filter(route => route.mode === MODE.COMPLETE).length ===
        Grid.routes.length
      ) {
        Grid.routes.forEach(route => console.log(route.color.name, route.count))
      }
    }
  }

  constructor(col, row) {
    this.col = col
    this.row = row
    this.x = col * Cell.size
    this.y = row * Cell.size
    this.wallColor = '#ddd'
    this.walls = { n: true, s: true, e: true, w: true }
    if (row === 0) {
      Grid.layout.push([this])
    } else {
      Grid.layout[col].push(this)
    }
    this.neighbours = []
    this.visited = false
    this.current = false
    if (col === 0 && row === 0) {
      this.current = true
      this.color = {
        visited: 'hsl(0, 100%, 25%)',
        current: 'hsl(0, 100%, 60%)',
      }
      Grid.routes.push({
        route: [],
        count: 1,
        mode: MODE.RUN_FORWARD,
        current: this,
        color: {
          name: 'red',
          visited: 'hsl(0, 100%, 25%)',
          current: 'hsl(0, 100%, 60%)',
        },
      })
    }
    if (
      col === canvas.width / Cell.size - 1 &&
      row === canvas.height / Cell.size - 1
    ) {
      this.current = true
      this.color = {
        visited: 'hsl(60, 100%, 25%)',
        current: 'hsl(60, 100%, 60%)',
      }
      Grid.routes.push({
        route: [],
        count: 1,
        mode: MODE.RUN_FORWARD,
        current: this,
        color: {
          name: 'yellow',
          visited: 'hsl(60, 100%, 25%)',
          current: 'hsl(60, 100%, 60%)',
        },
      })
    }
    if (col === canvas.width / Cell.size - 1 && row === 0) {
      this.current = true
      this.color = {
        visited: 'hsl(120, 100%, 25%)',
        current: 'hsl(120, 100%, 60%)',
      }
      Grid.routes.push({
        route: [],
        count: 1,
        mode: MODE.RUN_FORWARD,
        current: this,
        color: {
          name: 'green',
          visited: 'hsl(120, 100%, 25%)',
          current: 'hsl(120, 100%, 60%)',
        },
      })
    }
    if (col === 0 && row === canvas.height / Cell.size - 1) {
      this.current = true
      this.color = {
        visited: 'hsl(180, 100%, 70%)',
        current: 'hsl(180, 100%, 50%)',
      }
      Grid.routes.push({
        route: [],
        count: 1,
        mode: MODE.RUN_FORWARD,
        current: this,
        color: {
          color: 'cyan',
          visited: 'hsl(180, 100%, 25%)',
          current: 'hsl(180, 100%, 60%)',
        },
      })
    }
  }

  draw() {
    if (this.current || this.visited) {
      ctx.fillStyle = this.current ? this.color.visited : this.color.current
      ctx.fillRect(this.x, this.y, Cell.size, Cell.size)
    }
    ctx.strokeStyle = this.wallColor
    if (this.walls.n) {
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x + Cell.size, this.y)
      ctx.stroke()
    }
    if (this.walls.s) {
      ctx.beginPath()
      ctx.moveTo(this.x, this.y + Cell.size)
      ctx.lineTo(this.x + Cell.size, this.y + Cell.size)
      ctx.stroke()
    }
    if (this.walls.w) {
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x, this.y + Cell.size)
      ctx.stroke()
    }
    if (this.walls.e) {
      ctx.beginPath()
      ctx.moveTo(this.x + Cell.size, this.y)
      ctx.lineTo(this.x + Cell.size, this.y + Cell.size)
      ctx.stroke()
    }
  }

  getNeighbours() {
    const neighbours = []
    if (this.row > 0) {
      neighbours.push(Grid.layout[this.col][this.row - 1])
    }
    if (this.row < Grid.layout[0].length - 1) {
      neighbours.push(Grid.layout[this.col][this.row + 1])
    }
    if (this.col > 0) {
      neighbours.push(Grid.layout[this.col - 1][this.row])
    }
    if (this.col < Grid.layout.length - 1) {
      neighbours.push(Grid.layout[this.col + 1][this.row])
    }
    return neighbours
  }
}
class Grid {
  static layout = []
  static routes = []
  static update() {
    Grid.routes.forEach(route => {
      switch (route.mode) {
        case MODE.RUN_FORWARD:
          route.current.moveToUnvisitedNeighbour(route)
          break
        case MODE.BACKTRACK:
          route.current.backtrack(route)
          break
      }
    })
  }
}

Cell.init()
