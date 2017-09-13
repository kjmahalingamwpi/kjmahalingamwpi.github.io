// The play state
var playState = {
  // Automatically called
  preload: function() {
    // Set up key input
    ready = true;
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(moveNorth, this);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downKey.onDown.add(moveSouth, this);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    leftKey.onDown.add(moveWest, this);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    rightKey.onDown.add(moveEast, this);
    resetKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    resetKey.onDown.add(resetProcess, this);
  },
  // Automatically called
  create: function() {
    loadLevel();
  },
  // Called every frame
  update: function() {
  }
}

function moveNorth() {
  if (ready) {
    ready = false;
    setTimeout(setReady, 300);
    replicaList.sort(function(a, b){return b.row-a.row});
    for (i = replicaList.length - 1; i >= 0; i--) {
      var row = replicaList[i].row;
      var col = replicaList[i].col;
      if (row - 1 >= 0) {
        if (floorList[levelIndex][row][col].includes('N') && floorList[levelIndex][row-1][col].includes('S')) {
          var occupied = false;
          for (j = replicaList.length - 1; j >= 0; j--) {
            if (replicaList[j] !== replicaList[i]) {
              if ((replicaList[j].row === row - 1) && (replicaList[j].col === col)) {
                occupied = true;
                break;
              }
            }
          }
          for (j = blockedList.length - 1; j >= 0; j--) {
            if ((blockedList[j].row === row - 1) && (blockedList[j].col === col)) {
              occupied = true;
              break;
            }
          }
          if (!occupied) {
            replicaList[i].move('N');
            if (replicaList[i]) {
              for (j = zapOnList.length - 1; j >= 0; j--) {
                if ((zapOnList[j].row === replicaList[i].row) && (zapOnList[j].col === replicaList[i].col)) {
                  game.add.tween(replicaList[i].sprite).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 300);
                  game.add.tween(replicaList[i].sprite).to({width: 0, height: 0}, 500, Phaser.Easing.Exponential.In, true, 800);
                  replicaList.splice(i, 1);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = portalList.length - 1; j >= 0; j--) {
                if ((portalList[j].row === replicaList[i].row) && (portalList[j].col === replicaList[i].col)) {
                  teleport(replicaList, portalList, i, j);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = zapOffList.length - 1; j >= 0; j--) {
                if ((zapOffList[j].row === replicaList[i].row) && (zapOffList[j].col === replicaList[i].col)) {
                  // Create new zapOn and remove zapOff
                  var zapOn = new Item(zapOffList[j].x, zapOffList[j].y, zapOffList[j].col, zapOffList[j].row, zapOffList[j].width, zapOffList[j].height, 'Z');
                  zapOnList.push(zapOn);
                  game.add.tween(zapOffList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 300);
                  zapOffList.splice(j, 1);
                  setTimeout(function() {
                    zapOn.show();
                  }, 300);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = goalList.length - 1; j >= 0; j--) {
                if ((goalList[j].row === replicaList[i].row) && (goalList[j].col === replicaList[i].col)) {
                  blockedList.push({row: goalList[j].row, col: goalList[j].col});
                  game.add.tween(goalList[j].sprite).to({width: goalList[j].width * 1.5, height: goalList[j].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 300);
                  goalList.splice(j, 1);
                  game.add.tween(replicaList[i].sprite).to({width: replicaList[i].width * 1.5, height: replicaList[i].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 300);
                  replicaList.splice(i, 1);
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
}

function moveSouth() {
  if (ready) {
    ready = false;
    setTimeout(setReady, 300);
    replicaList.sort(function(a, b){return a.row-b.row});
    for (i = replicaList.length - 1; i >= 0; i--) {
      var row = replicaList[i].row;
      var col = replicaList[i].col;
      if (row + 1 < floorList[levelIndex].length) {
        if (floorList[levelIndex][row][col].includes('S') && floorList[levelIndex][row+1][col].includes('N')) {
          var occupied = false;
          for (j = replicaList.length - 1; j >= 0; j--) {
            if (replicaList[j] !== replicaList[i]) {
              if ((replicaList[j].row === row + 1) && (replicaList[j].col === col)) {
                occupied = true;
                break;
              }
            }
          }
          for (j = blockedList.length - 1; j >= 0; j--) {
            if ((blockedList[j].row === row + 1) && (blockedList[j].col === col)) {
              occupied = true;
              break;
            }
          }
          if (!occupied) {
            replicaList[i].move('S');
            if (replicaList[i]) {
              for (j = zapOnList.length - 1; j >= 0; j--) {
                if ((zapOnList[j].row === replicaList[i].row) && (zapOnList[j].col === replicaList[i].col)) {
                  game.add.tween(replicaList[i].sprite).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 300);
                  game.add.tween(replicaList[i].sprite).to({width: 0, height: 0}, 500, Phaser.Easing.Exponential.In, true, 800);
                  replicaList.splice(i, 1);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = portalList.length - 1; j >= 0; j--) {
                if ((portalList[j].row === replicaList[i].row) && (portalList[j].col === replicaList[i].col)) {
                  teleport(replicaList, portalList, i, j);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = zapOffList.length - 1; j >= 0; j--) {
                if ((zapOffList[j].row === replicaList[i].row) && (zapOffList[j].col === replicaList[i].col)) {
                  // Create new zapOn and remove zapOff
                  var zapOn = new Item(zapOffList[j].x, zapOffList[j].y, zapOffList[j].col, zapOffList[j].row, zapOffList[j].width, zapOffList[j].height, 'Z');
                  zapOnList.push(zapOn);
                  game.add.tween(zapOffList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 300);
                  zapOffList.splice(j, 1);
                  setTimeout(function() {
                    zapOn.show();
                  }, 300);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = goalList.length - 1; j >= 0; j--) {
                if ((goalList[j].row === replicaList[i].row) && (goalList[j].col === replicaList[i].col)) {
                  blockedList.push({row: goalList[j].row, col: goalList[j].col});
                  game.add.tween(goalList[j].sprite).to({width: goalList[j].width * 1.5, height: goalList[j].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 300);
                  goalList.splice(j, 1);
                  game.add.tween(replicaList[i].sprite).to({width: replicaList[i].width * 1.5, height: replicaList[i].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 300);
                  replicaList.splice(i, 1);
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
}

function moveWest() {
  if (ready) {
    ready = false;
    setTimeout(setReady, 300);
    replicaList.sort(function(a, b){return b.col-a.col});
    for (i = replicaList.length - 1; i >= 0; i--) {
      var row = replicaList[i].row;
      var col = replicaList[i].col;
      if (col - 1 >= 0) {
        if (floorList[levelIndex][row][col].includes('W') && floorList[levelIndex][row][col-1].includes('E')) {
          var occupied = false;
          for (j = replicaList.length - 1; j >= 0; j--) {
            if (replicaList[j] !== replicaList[i]) {
              if ((replicaList[j].row === row) && (replicaList[j].col === col - 1)) {
                occupied = true;
                break;
              }
            }
          }
          for (j = blockedList.length - 1; j >= 0; j--) {
            if ((blockedList[j].row === row) && (blockedList[j].col === col - 1)) {
              occupied = true;
              break;
            }
          }
          if (!occupied) {
            replicaList[i].move('W');
            if (replicaList[i]) {
              for (j = zapOnList.length - 1; j >= 0; j--) {
                if ((zapOnList[j].row === replicaList[i].row) && (zapOnList[j].col === replicaList[i].col)) {
                  game.add.tween(replicaList[i].sprite).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 300);
                  game.add.tween(replicaList[i].sprite).to({width: 0, height: 0}, 500, Phaser.Easing.Exponential.In, true, 800);
                  replicaList.splice(i, 1);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = portalList.length - 1; j >= 0; j--) {
                if ((portalList[j].row === replicaList[i].row) && (portalList[j].col === replicaList[i].col)) {
                  teleport(replicaList, portalList, i, j);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = zapOffList.length - 1; j >= 0; j--) {
                if ((zapOffList[j].row === replicaList[i].row) && (zapOffList[j].col === replicaList[i].col)) {
                  // Create new zapOn and remove zapOff
                  var zapOn = new Item(zapOffList[j].x, zapOffList[j].y, zapOffList[j].col, zapOffList[j].row, zapOffList[j].width, zapOffList[j].height, 'Z');
                  zapOnList.push(zapOn);
                  game.add.tween(zapOffList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 300);
                  zapOffList.splice(j, 1);
                  setTimeout(function() {
                    zapOn.show();
                  }, 300);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = goalList.length - 1; j >= 0; j--) {
                if ((goalList[j].row === replicaList[i].row) && (goalList[j].col === replicaList[i].col)) {
                  blockedList.push({row: goalList[j].row, col: goalList[j].col});
                  game.add.tween(goalList[j].sprite).to({width: goalList[j].width * 1.5, height: goalList[j].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 300);
                  goalList.splice(j, 1);
                  game.add.tween(replicaList[i].sprite).to({width: replicaList[i].width * 1.5, height: replicaList[i].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 300);
                  replicaList.splice(i, 1);
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
}

function moveEast() {
  if (ready) {
    ready = false;
    setTimeout(setReady, 300);
    replicaList.sort(function(a, b){return a.col-b.col});
    for (i = replicaList.length - 1; i >= 0; i--) {
      var row = replicaList[i].row;
      var col = replicaList[i].col;
      if (col + 1 < floorList[levelIndex][0].length) {
        if (floorList[levelIndex][row][col].includes('E') && floorList[levelIndex][row][col+1].includes('W')) {
          var occupied = false;
          for (j = replicaList.length - 1; j >= 0; j--) {
            if (replicaList[j] !== replicaList[i]) {
              if ((replicaList[j].row === row) && (replicaList[j].col === col + 1)) {
                occupied = true;
                break;
              }
            }
          }
          for (j = blockedList.length - 1; j >= 0; j--) {
            if ((blockedList[j].row === row) && (blockedList[j].col === col + 1)) {
              occupied = true;
              break;
            }
          }
          if (!occupied) {
            replicaList[i].move('E');
            if (replicaList[i]) {
              for (j = zapOnList.length - 1; j >= 0; j--) {
                if ((zapOnList[j].row === replicaList[i].row) && (zapOnList[j].col === replicaList[i].col)) {
                  game.add.tween(replicaList[i].sprite).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 300);
                  game.add.tween(replicaList[i].sprite).to({width: 0, height: 0}, 500, Phaser.Easing.Exponential.In, true, 800);
                  replicaList.splice(i, 1);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = portalList.length - 1; j >= 0; j--) {
                if ((portalList[j].row === replicaList[i].row) && (portalList[j].col === replicaList[i].col)) {
                  teleport(replicaList, portalList, i, j);
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = zapOffList.length - 1; j >= 0; j--) {
                if ((zapOffList[j].row === replicaList[i].row) && (zapOffList[j].col === replicaList[i].col)) {
                  // Create new zapOn and remove zapOff
                  var zapOn = new Item(zapOffList[j].x, zapOffList[j].y, zapOffList[j].col, zapOffList[j].row, zapOffList[j].width, zapOffList[j].height, 'Z');
                  console.info(zapOn);
                  zapOnList.push(zapOn);
                  game.add.tween(zapOffList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 300);
                  zapOffList.splice(j, 1);
                  zapOn.show();
                  break;
                }
              }
            }
            if (replicaList[i]) {
              for (j = goalList.length - 1; j >= 0; j--) {
                if ((goalList[j].row === replicaList[i].row) && (goalList[j].col === replicaList[i].col)) {
                  blockedList.push({row: goalList[j].row, col: goalList[j].col});
                  game.add.tween(goalList[j].sprite).to({width: goalList[j].width * 1.5, height: goalList[j].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 300);
                  goalList.splice(j, 1);
                  game.add.tween(replicaList[i].sprite).to({width: replicaList[i].width * 1.5, height: replicaList[i].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 300);
                  replicaList.splice(i, 1);
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
}

function teleport(rList, pList, m, n) {
  setTimeout(function() {
    // Teleport from one portal to other portal
    rList[m].row = pList[(n+1)%2].row;
    rList[m].col = pList[(n+1)%2].col;
    rList[m].x = pList[(n+1)%2].x;
    rList[m].y = pList[(n+1)%2].y;
    rList[m].sprite.x = pList[(n+1)%2].sprite.x;
    rList[m].sprite.y = pList[(n+1)%2].sprite.y;
    game.add.tween(pList[0].sprite).to({width: pList[0].width * 1.5, height: pList[0].height * 1.5}, 1000, Phaser.Easing.Exponential.Out, true);
    game.add.tween(pList[1].sprite).to({width: pList[1].width * 1.5, height: pList[1].height * 1.5}, 1000, Phaser.Easing.Exponential.Out, true);
    game.add.tween(pList[0].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true);
    game.add.tween(pList[1].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true);
    pList.length = 0;
  }, 300);
}

function resetProcess() {
  setReady();
  if (goalList.length <= 0) {
    nextLevel();
  }
  resetLevel();
}

function setReady() {
  ready = true;
}