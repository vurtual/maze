const canvas = document.querySelector('canvas')
const cellSize = 30
canvas.width = window.innerWidth - (window.innerWidth % cellSize) // - 3 * cellSize
canvas.height = window.innerHeight - (window.innerHeight % cellSize) // - 3 * cellSize
canvas.style.width = canvas.width
canvas.style.height = canvas.height
const ctx = canvas.getContext('2d')

// const MOVEMENT_INTERVAL = 10
const MODE = { RUN_FORWARD: 0, BACKTRACK: 1, COMPLETE: 2 }
let mode = MODE.RUN_FORWARD

let lastTime = 0
let timeElapsedSinceLastMove = 0
const animate = timestamp => {
  const deltaTime = timestamp - lastTime
  lastTime = timestamp
  // timeElapsedSinceLastMove += timestamp
  // if (timeElapsedSinceLastMove > MOVEMENT_INTERVAL) {
  if (mode === MODE.RUN_FORWARD) Cell.moveToUnvisitedNeighbour()
  if (mode === MODE.BACKTRACK) Cell.backtrack()
  // timeElapsedSinceLastMove -= MOVEMENT_INTERVAL
  // }
  Grid.layout.flat().forEach(cell => cell.draw())
  window.requestAnimationFrame(animate)
}

class Cell {
  static size = cellSize

  static init() {
    for (let row = 0; row < canvas.height / Cell.size; row++) {
      for (let col = 0; col < canvas.width / Cell.size; col++) {
        new Cell(col, row)
      }
    }
    Grid.layout.flat().forEach(cell => cell.getNeighbours())
    animate(0)
  }

  static moveToUnvisitedNeighbour() {
    const current = Grid.layout.flat().find(cell => cell.current)
    Grid.route.push(current)
    // console.log(current)
    // console.log(current.neighbours)
    const unvisitedNeighbours = current.neighbours.filter(
      neighbour => !neighbour.visited
    )
    if (unvisitedNeighbours.length > 0) {
      const next =
        unvisitedNeighbours[
          Math.floor(Math.random() * unvisitedNeighbours.length)
        ]
      // console.log(next)
      next.current = true
      current.current = false
      current.visited = true
      if (next.row === current.row + 1) {
        next.walls.n = false
        current.walls.s = false
      }
      if (next.row === current.row - 1) {
        next.walls.s = false
        current.walls.n = false
      }
      if (next.col === current.col + 1) {
        next.walls.w = false
        current.walls.e = false
      }
      if (next.col === current.col - 1) {
        next.walls.e = false
        current.walls.w = false
      }
    } else {
      mode = MODE.BACKTRACK
    }
  }

  static backtrack() {
    const current = Grid.route.pop()
    if (Grid.route.length > 0) {
      const previous = Grid.route.pop()
      current.current = false
      current.visited = true
      previous.current = true
      mode = MODE.RUN_FORWARD
    } else {
      mode = MODE.COMPLETE
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
    }
  }

  draw() {
    if (this.current || this.visited) {
      ctx.fillStyle = this.current ? 'rgb(241, 150, 35)' : 'rgb(127, 100, 80)'
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
    if (this.row > 0) {
      this.neighbours.push(Grid.layout[this.col][this.row - 1])
    }
    if (this.row < Grid.layout[0].length - 1) {
      this.neighbours.push(Grid.layout[this.col][this.row + 1])
    }
    if (this.col > 0) {
      this.neighbours.push(Grid.layout[this.col - 1][this.row])
    }
    if (this.col < Grid.layout.length - 1) {
      this.neighbours.push(Grid.layout[this.col + 1][this.row])
    }
  }
}
class Grid {
  static layout = []
  static route = []
}

Cell.init()
