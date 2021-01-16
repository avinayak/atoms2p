let WIDTH;
let HEIGHT;
let CRITICAL_MASS;
let cellSpacing;
let turn;
let colors;
let robotRadius;
let marginX;
let marginY;
let height;
let subSpacing;
let easing;
let grid = [];

let initGrid = () => {
  for (var i = 0; i < HEIGHT; i++) {
    grid[i] = new Array(WIDTH);
    for (var j = 0; j < WIDTH; j++) {
      grid[i][j] = [];
    }
  }
};

let drawLines = () => {
  for (let i = 0; i < WIDTH + 1; i++) {
    if (i == 0 || i == WIDTH) strokeWeight(3);
    else strokeWeight(1);
    line(
      marginX + i * cellSpacing,
      marginY,
      marginX + i * cellSpacing,
      marginY + HEIGHT * cellSpacing
    );
  }
  for (let i = 0; i < HEIGHT + 1; i++) {
    if (i == 0 || i == HEIGHT) strokeWeight(3);
    else strokeWeight(1);
    line(
      marginX,
      marginY + i * cellSpacing,
      marginX + WIDTH * cellSpacing,
      marginY + i * cellSpacing
    );
  }
};
let switchTurn = () => {
  turn = (turn + 1) % 2;
};
let criticalMass = cell => {
  if (
    (cell.x == 0 || cell.x == WIDTH - 1) &&
    (cell.y == 0 || cell.y == HEIGHT - 1)
  )
    return CRITICAL_MASS - 2;
  else if (
    cell.x == 0 ||
    cell.x == WIDTH - 1 ||
    (cell.y == 0 || cell.y == HEIGHT - 1)
  )
    return CRITICAL_MASS - 1;
  else return CRITICAL_MASS;
};

let pixelToGrid = (x, y) => {
  return {
    x: Math.floor((x - marginX) / cellSpacing),
    y: Math.floor((y - marginY) / cellSpacing)
  };
};

let gridToPixel = cell => {
  let subOffset = {
    x: 10,
    y: 10
  };
  let mass = grid[cell.y][cell.x].length;
  if (mass == 0) {
    subOffset = {
      x: -subSpacing,
      y: subSpacing
    };
  } else if (mass == 1) {
    subOffset = {
      x: -subSpacing,
      y: -subSpacing
    };
  } else if (mass == 2) {
    subOffset = {
      x: subSpacing,
      y: -subSpacing
    };
  } else if (mass == 3) {
    subOffset = {
      x: subSpacing,
      y: subSpacing
    };
  }
  return {
    x: cell.x * cellSpacing + cellSpacing / 2 + marginX + subOffset.x,
    y: cell.y * cellSpacing + cellSpacing / 2 + marginY + subOffset.y
  };
};

let getUnstableCells = () => {
  let criticals = [];
  let cell = null;
  for (var i = 0; i < HEIGHT; i++) {
    for (var j = 0; j < WIDTH; j++) {
      cell = {
        x: j,
        y: i
      };
      if (grid[i][j].length == criticalMass(cell)) {
        criticals.push(cell);
      }
    }
  }
  return criticals;
};

let isInside = cell => {
  return cell.x >= 0 && cell.x < WIDTH && (cell.y >= 0 && cell.y < HEIGHT);
};

let isLegalCell = cell => {
  if (!isInside(cell)) return false;
  else {
    return (
      grid[cell.y][cell.x].length == 0 || grid[cell.y][cell.x][0].color == turn
    );
  }

};

let createRobot = (x, y, color) => {
  let self = {};
  self.inMovment = false;
  self.x = x;
  self.y = y;
  self.robotId = Math.random()
    .toString(36)
    .substring(7);
  self.destinationX = x;
  self.destinationY = y;
  self.color = color;
  self.show = () => {
    //noStroke();
    strokeWeight(1);
    fill(colors[self.color]);
    ellipse(self.x, self.y, robotRadius);
  };
  self.move = (x, y) => {
    if (!self.inMovment) {
      self.destinationX = x;
      self.destinationY = y;
    }
  };
  self.update = (x, y) => {
    self.x += (self.destinationX - self.x) * easing;
    self.y += (self.destinationY - self.y) * easing;
    self.inMovment = !(
      self.x - self.destinationX < 0.1 && self.y - self.destinationY < 0.1
    );
  };
  return self;
};

setup = function() {
  if (window.location.hash) {
    let wh = window.location.hash
      .slice(1)
      .split("x")
      .map(x => parseInt(x));

    WIDTH = wh[0];
    HEIGHT = wh[1];
  } else {
    WIDTH = 6;
    HEIGHT = 10;
  }
  CRITICAL_MASS = 4;
  cellSpacing = 50;
  turn = 0;
  colors = ["#fff", "#000"];
  robotRadius = cellSpacing * 0.3;
  marginX = 10;
  marginY = 30;
  //height = cellSpacing * HEIGHT + 2 * marginY;
  subSpacing = cellSpacing * 0.2;
  easing = 0.4;
  grid = [];
  createCanvas(
    marginX * 2 + cellSpacing * WIDTH,
    marginY * 2 + cellSpacing * HEIGHT
  );
  initGrid();
};

let pushToAdjacent = (targetCell, explodedRobot) => {
  let targetStack = grid[targetCell.y][targetCell.x];
  for (let i = 0; i < targetStack.length; i++) {
    if (targetStack[i].robotId != explodedRobot.robotId) {
      targetStack[i].robotId = explodedRobot.robotId;
      targetStack[i].color = explodedRobot.color;
    }
  }
  targetStack.push(explodedRobot);
  while (criticalMass(targetCell) < targetStack.length) {
    targetStack.pop();
  }
};

let isExploding = () => {
  for (var i = 0; i < HEIGHT; i++) {
    for (var j = 0; j < WIDTH; j++) {
      for (var k = 0; k < grid[i][j].length; k++) {
        if (grid[i][j][k].inMovment) return true;
      }
    }
  }
  return false;
};

let boardToArray = () => {
  let array = [];
  for (var i = 0; i < HEIGHT; i++) {
    array.push([]);
    for (var j = 0; j < WIDTH; j++) {
      if (grid[i][j].length > 0) {
        array[i][j] = grid[i][j][0].color == 1 ? 1 : -1;
        array[i][j] *= grid[i][j].length
      } else {
        array[i][j] = 0;
      }
    }
  }
  return array;
};

let explode = unstableCell => {
  let adjacents = [{
      x: unstableCell.x - 1,
      y: unstableCell.y
    },
    {
      x: unstableCell.x + 1,
      y: unstableCell.y
    },
    {
      x: unstableCell.x,
      y: unstableCell.y - 1
    },
    {
      x: unstableCell.x,
      y: unstableCell.y + 1
    }
  ];
  adjacents.forEach(adjacentCell => {
    if (
      isInside(adjacentCell) &&
      grid[unstableCell.y][unstableCell.x].length > 0
    ) {
      let explodedRobot = grid[unstableCell.y][unstableCell.x].pop();
      let targetCoordinates = gridToPixel(adjacentCell);
      explodedRobot.move(targetCoordinates.x, targetCoordinates.y);
      pushToAdjacent(adjacentCell, explodedRobot);
    }
  });
};

let checkUnstablesAndExplode = () => {
  getUnstableCells().forEach(unstableCell => {
    explode(unstableCell);
  });
};

let play = cell => {
  console.log(isLegalCell(cell), !isExploding())
  if (isLegalCell(cell) && !isExploding()) {
    let pos = gridToPixel(cell);
    grid[cell.y][cell.x].push(createRobot(pos.x, pos.y, turn));
    switchTurn();
    checkUnstablesAndExplode();
  }
};

mouseClicked = () => {
  let cell = pixelToGrid(mouseX, mouseY);
  if (isLegalCell(cell) && !isExploding() && getUnstableCells().length == 0) {
    let pos = gridToPixel(cell);
    grid[cell.y][cell.x].push(createRobot(pos.x, pos.y, turn));
    switchTurn();
    checkUnstablesAndExplode();
  }

  //console.log(boardToArray(grid));
};
let waiting = false;
draw = function() {
  smooth();
  background("#ffffff");
  stroke(0, 0, 0, 255);
  drawLines();
  for (var i = 0; i < HEIGHT; i++) {
    for (var j = 0; j < WIDTH; j++) {
      if (grid[i][j])
        grid[i][j].forEach(element => {
          element.update();
          element.show();
        });
    }
  }
  boardToArray();
  if (!isExploding()) {
    checkUnstablesAndExplode();
  }


};