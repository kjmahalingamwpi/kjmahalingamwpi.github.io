// The play state
var playState = {
  // Automatically called
  preload: function() {
    // Set up input
    ready = false;
    loaded = false;
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    if (landscape) {
      upKey.onDown.add(moveNorth, this);
      downKey.onDown.add(moveSouth, this);
      leftKey.onDown.add(moveWest, this);
      rightKey.onDown.add(moveEast, this);
    } else {
      upKey.onDown.add(moveEast, this);
      downKey.onDown.add(moveWest, this);
      leftKey.onDown.add(moveNorth, this);
      rightKey.onDown.add(moveSouth, this);
    }
    spaceKey.onDown.add(spaceProcess, this);
    enterKey.onDown.add(spaceProcess, this);
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
    game.input.onDown.add(startSwipe, this);
  },
  // Automatically called
  create: function() {
    loadLevel();
    this.camera.flash('#DDDDDD', 500, true);
    minDimension = Math.min(game.width, game.height);
    resetButton = game.add.sprite(game.width * 0.5, game.height * 0.95, 'Reset');
    resetButton.anchor.setTo(0.5, 0.5);
    resetButton.width = resetButton.height = minDimension * 0.15;
    resetButton.inputEnabled = true;
    resetButton.events.onInputDown.add(resetProcess, this);
    nextButton = game.add.sprite(game.width * 0.9, game.height * 0.95, 'Next');
    nextButton.anchor.setTo(0.5, 0.5);
    nextButton.width = nextButton.height = minDimension * 0.15;
    nextButton.inputEnabled = true;
    nextButton.events.onInputDown.add(nextProcess, this);
    previousButton = game.add.sprite(game.width * 0.1, game.height * 0.95, 'Previous');
    previousButton.anchor.setTo(0.5, 0.5);
    previousButton.width = previousButton.height = minDimension * 0.15;
    previousButton.inputEnabled = true;
    previousButton.events.onInputDown.add(previousProcess, this);
    levelText = game.add.text(
      game.width * 0.5,
      game.height * 0.05,
      levelIndex + 1,
      {
        font: "6em Futura",
        fill: "#000000",
        align: "center"
      }
    );
    levelText.anchor.set(0.5);
    winSound = game.add.audio("Win");
    goalSound = game.add.audio("Goal");
    zapOnSound = game.add.audio("ZapOn");
    zapOffSound = game.add.audio("ZapOff");
    zapOffSound.volume = 0.6;
    portalSound = game.add.audio("Portal");
    unlockSound = game.add.audio("Unlock");
    unlockSound.volume = 0.6;
    setTimeout(setReady, 500);
    setTimeout(setLoaded, 500);
  },
  // Called every frame
  update: function() {
  }
}

function moveNorth() {
  if (ready) {
    ready = false;
    setTimeout(setReady, 200);
    replicaList.sort(function(a, b){return b.row-a.row});
    var unlocked = false;
    for (i = replicaList.length - 1; i >= 0; i--) {
      if (!replicaList[i].finished) {
        var row = replicaList[i].row;
        var col = replicaList[i].col;
        var scale = 1;
        for (r = row - 1; r >= 0; r--) {
          if (floorList[levelIndex][r][col].includes('P') && floorList[levelIndex][r][col].includes('N') && floorList[levelIndex][r][col].includes('S')) {
            scale++;
          } else {
            break;
          }
        }
        if (row - scale >= 0) {
          if (floorList[levelIndex][row][col].includes('N') && floorList[levelIndex][row-scale][col].includes('S')) {
            var occupied = false;
            for (j = replicaList.length - 1; j >= 0; j--) {
              if (replicaList[j] !== replicaList[i]) {
                if ((replicaList[j].row === row - scale) && (replicaList[j].col === col)) {
                  occupied = true;
                  break;
                }
              }
            }
            for (j = lockList.length - 1; j >= 0; j--) {
              if ((lockList[j].row === row - scale) && (lockList[j].col === col)) {
                occupied = true;
                break;
              }
            }
            for (j = blockedList.length - 1; j >= 0; j--) {
              if ((blockedList[j].row === row - scale) && (blockedList[j].col === col)) {
                occupied = true;
                break;
              }
            }
            if (!occupied) {
              replicaList[i].move('N', scale);
              if (replicaList[i]) {
                for (j = zapOnList.length - 1; j >= 0; j--) {
                  if ((zapOnList[j].row === replicaList[i].row) && (zapOnList[j].col === replicaList[i].col)) {
                    game.add.tween(replicaList[i].sprite).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 200);
                    game.add.tween(replicaList[i].sprite).to({width: 0, height: 0}, 500, Phaser.Easing.Exponential.In, true, 700);
                    replicaList.splice(i, 1);
                    setTimeout(function() {
                      zapOnSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = portalList.length - 1; j >= 0; j--) {
                  if ((portalList[j].row === replicaList[i].row) && (portalList[j].col === replicaList[i].col)) {
                    teleport(replicaList[i], portalList, j);
                    setTimeout(function() {
                      portalSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = keyList.length - 1; j >= 0; j--) {
                  if ((keyList[j].row === replicaList[i].row) && (keyList[j].col === replicaList[i].col)) {
                    game.add.tween(keyList[j].sprite).to({width: 0, height: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
                    game.add.tween(keyList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
                    keyList.splice(j, 1);
                    if (keyList.length === 0) {
                      unlocked = true;
                    }
                    setTimeout(function() {
                      unlockSound.play();
                    }, 200);
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
                    zapOn.show();
                    game.add.tween(zapOn.sprite).from({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 200);
                    game.add.tween(zapOffList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 200);
                    zapOffList.splice(j, 1);
                    setTimeout(function() {
                      zapOffSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = goalList.length - 1; j >= 0; j--) {
                  if ((goalList[j].row === replicaList[i].row) && (goalList[j].col === replicaList[i].col)) {
                    blockedList.push({row: goalList[j].row, col: goalList[j].col});
                    game.add.tween(goalList[j].sprite).to({width: goalList[j].width * 1.5, height: goalList[j].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 200);
                    goalList.splice(j, 1);
                    game.add.tween(replicaList[i].sprite).to({width: replicaList[i].width * 1.5, height: replicaList[i].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 200);
                    replicaList[i].finished = true;
                    setTimeout(function() {
                      goalSound.play();
                    }, 200);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    if (unlocked) {
      for (i = lockList.length - 1; i >= 0; i--) {
        game.add.tween(lockList[i].sprite).to({width: 0, height: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
        game.add.tween(lockList[i].sprite).to({alpha: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
        lockList.splice(i, 1);
      }
    }
  }
}

function moveSouth() {
  if (ready) {
    ready = false;
    setTimeout(setReady, 200);
    replicaList.sort(function(a, b){return a.row-b.row});
    var unlocked = false;
    for (i = replicaList.length - 1; i >= 0; i--) {
      if (!replicaList[i].finished) {
        var row = replicaList[i].row;
        var col = replicaList[i].col;
        var scale = 1;
        for (r = row + 1; r < floorList[levelIndex].length; r++) {
          if (floorList[levelIndex][r][col].includes('P') && floorList[levelIndex][r][col].includes('S') && floorList[levelIndex][r][col].includes('N')) {
            scale++;
          } else {
            break;
          }
        }
        if (row + scale < floorList[levelIndex].length) {
          if (floorList[levelIndex][row][col].includes('S') && floorList[levelIndex][row+scale][col].includes('N')) {
            var occupied = false;
            for (j = replicaList.length - 1; j >= 0; j--) {
              if (replicaList[j] !== replicaList[i]) {
                if ((replicaList[j].row === row + scale) && (replicaList[j].col === col)) {
                  occupied = true;
                  break;
                }
              }
            }
            for (j = lockList.length - 1; j >= 0; j--) {
              if ((lockList[j].row === row + scale) && (lockList[j].col === col)) {
                occupied = true;
                break;
              }
            }
            for (j = blockedList.length - 1; j >= 0; j--) {
              if ((blockedList[j].row === row + scale) && (blockedList[j].col === col)) {
                occupied = true;
                break;
              }
            }
            if (!occupied) {
              replicaList[i].move('S', scale);
              if (replicaList[i]) {
                for (j = zapOnList.length - 1; j >= 0; j--) {
                  if ((zapOnList[j].row === replicaList[i].row) && (zapOnList[j].col === replicaList[i].col)) {
                    game.add.tween(replicaList[i].sprite).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 200);
                    game.add.tween(replicaList[i].sprite).to({width: 0, height: 0}, 500, Phaser.Easing.Exponential.In, true, 700);
                    replicaList.splice(i, 1);
                    setTimeout(function() {
                      zapOnSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = portalList.length - 1; j >= 0; j--) {
                  if ((portalList[j].row === replicaList[i].row) && (portalList[j].col === replicaList[i].col)) {
                    teleport(replicaList[i], portalList, j);
                    setTimeout(function() {
                      portalSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = keyList.length - 1; j >= 0; j--) {
                  if ((keyList[j].row === replicaList[i].row) && (keyList[j].col === replicaList[i].col)) {
                    game.add.tween(keyList[j].sprite).to({width: 0, height: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
                    game.add.tween(keyList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
                    keyList.splice(j, 1);
                    if (keyList.length === 0) {
                      unlocked = true;
                    }
                    setTimeout(function() {
                      unlockSound.play();
                    }, 200);
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
                    zapOn.show();
                    game.add.tween(zapOn.sprite).from({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 200);
                    game.add.tween(zapOffList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 200);
                    zapOffList.splice(j, 1);
                    setTimeout(function() {
                      zapOffSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = goalList.length - 1; j >= 0; j--) {
                  if ((goalList[j].row === replicaList[i].row) && (goalList[j].col === replicaList[i].col)) {
                    blockedList.push({row: goalList[j].row, col: goalList[j].col});
                    game.add.tween(goalList[j].sprite).to({width: goalList[j].width * 1.5, height: goalList[j].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 200);
                    goalList.splice(j, 1);
                    game.add.tween(replicaList[i].sprite).to({width: replicaList[i].width * 1.5, height: replicaList[i].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 200);
                    replicaList[i].finished = true;
                    setTimeout(function() {
                      goalSound.play();
                    }, 200);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    if (unlocked) {
      for (i = lockList.length - 1; i >= 0; i--) {
        game.add.tween(lockList[i].sprite).to({width: 0, height: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
        game.add.tween(lockList[i].sprite).to({alpha: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
        lockList.splice(i, 1);
      }
    }
  }
}

function moveWest() {
  if (ready) {
    ready = false;
    setTimeout(setReady, 200);
    replicaList.sort(function(a, b){return b.col-a.col});
    var unlocked = false;
    for (i = replicaList.length - 1; i >= 0; i--) {
      if (!replicaList[i].finished) {
        var row = replicaList[i].row;
        var col = replicaList[i].col;
        var scale = 1;
        for (c = col - 1; c >= 0; c--) {
          if (floorList[levelIndex][row][c].includes('P') && floorList[levelIndex][row][c].includes('W') && floorList[levelIndex][row][c].includes('E')) {
            scale++;
          } else {
            break;
          }
        }
        if (col - scale >= 0) {
          if (floorList[levelIndex][row][col].includes('W') && floorList[levelIndex][row][col-scale].includes('E')) {
            var occupied = false;
            for (j = replicaList.length - 1; j >= 0; j--) {
              if (replicaList[j] !== replicaList[i]) {
                if ((replicaList[j].row === row) && (replicaList[j].col === col - scale)) {
                  occupied = true;
                  break;
                }
              }
            }
            for (j = lockList.length - 1; j >= 0; j--) {
              if ((lockList[j].row === row) && (lockList[j].col === col - scale)) {
                occupied = true;
                break;
              }
            }
            for (j = blockedList.length - 1; j >= 0; j--) {
              if ((blockedList[j].row === row) && (blockedList[j].col === col - scale)) {
                occupied = true;
                break;
              }
            }
            if (!occupied) {
              replicaList[i].move('W', scale);
              if (replicaList[i]) {
                for (j = zapOnList.length - 1; j >= 0; j--) {
                  if ((zapOnList[j].row === replicaList[i].row) && (zapOnList[j].col === replicaList[i].col)) {
                    game.add.tween(replicaList[i].sprite).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 200);
                    game.add.tween(replicaList[i].sprite).to({width: 0, height: 0}, 500, Phaser.Easing.Exponential.In, true, 700);
                    replicaList.splice(i, 1);
                    setTimeout(function() {
                      zapOnSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = portalList.length - 1; j >= 0; j--) {
                  if ((portalList[j].row === replicaList[i].row) && (portalList[j].col === replicaList[i].col)) {
                    teleport(replicaList[i], portalList, j);
                    setTimeout(function() {
                      portalSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = keyList.length - 1; j >= 0; j--) {
                  if ((keyList[j].row === replicaList[i].row) && (keyList[j].col === replicaList[i].col)) {
                    game.add.tween(keyList[j].sprite).to({width: 0, height: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
                    game.add.tween(keyList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
                    keyList.splice(j, 1);
                    if (keyList.length === 0) {
                      unlocked = true;
                    }
                    setTimeout(function() {
                      unlockSound.play();
                    }, 200);
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
                    zapOn.show();
                    game.add.tween(zapOn.sprite).from({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 200);
                    game.add.tween(zapOffList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 200);
                    zapOffList.splice(j, 1);
                    setTimeout(function() {
                      zapOffSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = goalList.length - 1; j >= 0; j--) {
                  if ((goalList[j].row === replicaList[i].row) && (goalList[j].col === replicaList[i].col)) {
                    blockedList.push({row: goalList[j].row, col: goalList[j].col});
                    game.add.tween(goalList[j].sprite).to({width: goalList[j].width * 1.5, height: goalList[j].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 200);
                    goalList.splice(j, 1);
                    game.add.tween(replicaList[i].sprite).to({width: replicaList[i].width * 1.5, height: replicaList[i].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 200);
                    replicaList[i].finished = true;
                    setTimeout(function() {
                      goalSound.play();
                    }, 200);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    if (unlocked) {
      for (i = lockList.length - 1; i >= 0; i--) {
        game.add.tween(lockList[i].sprite).to({width: 0, height: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
        game.add.tween(lockList[i].sprite).to({alpha: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
        lockList.splice(i, 1);
      }
    }
  }
}

function moveEast() {
  if (ready) {
    ready = false;
    setTimeout(setReady, 200);
    replicaList.sort(function(a, b){return a.col-b.col});
    var unlocked = false;
    for (i = replicaList.length - 1; i >= 0; i--) {
      if (!replicaList[i].finished) {
        var row = replicaList[i].row;
        var col = replicaList[i].col;
        var scale = 1;
        for (c = col + 1; c < floorList[levelIndex][0].length; c++) {
          if (floorList[levelIndex][row][c].includes('P') && floorList[levelIndex][row][c].includes('E') && floorList[levelIndex][row][c].includes('W')) {
            scale++;
          } else {
            break;
          }
        }
        if (col + scale < floorList[levelIndex][0].length) {
          if (floorList[levelIndex][row][col].includes('E') && floorList[levelIndex][row][col+scale].includes('W')) {
            var occupied = false;
            for (j = replicaList.length - 1; j >= 0; j--) {
              if (replicaList[j] !== replicaList[i]) {
                if ((replicaList[j].row === row) && (replicaList[j].col === col + scale)) {
                  occupied = true;
                  break;
                }
              }
            }
            for (j = lockList.length - 1; j >= 0; j--) {
              if ((lockList[j].row === row) && (lockList[j].col === col + scale)) {
                occupied = true;
                break;
              }
            }
            for (j = blockedList.length - 1; j >= 0; j--) {
              if ((blockedList[j].row === row) && (blockedList[j].col === col + scale)) {
                occupied = true;
                break;
              }
            }
            if (!occupied) {
              replicaList[i].move('E', scale);
              if (replicaList[i]) {
                for (j = zapOnList.length - 1; j >= 0; j--) {
                  if ((zapOnList[j].row === replicaList[i].row) && (zapOnList[j].col === replicaList[i].col)) {
                    game.add.tween(replicaList[i].sprite).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 200);
                    game.add.tween(replicaList[i].sprite).to({width: 0, height: 0}, 500, Phaser.Easing.Exponential.In, true, 700);
                    replicaList.splice(i, 1);
                    setTimeout(function() {
                      zapOnSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = portalList.length - 1; j >= 0; j--) {
                  if ((portalList[j].row === replicaList[i].row) && (portalList[j].col === replicaList[i].col)) {
                    teleport(replicaList[i], portalList, j);
                    setTimeout(function() {
                      portalSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = keyList.length - 1; j >= 0; j--) {
                  if ((keyList[j].row === replicaList[i].row) && (keyList[j].col === replicaList[i].col)) {
                    game.add.tween(keyList[j].sprite).to({width: 0, height: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
                    game.add.tween(keyList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
                    keyList.splice(j, 1);
                    if (keyList.length === 0) {
                      unlocked = true;
                    }
                    setTimeout(function() {
                      unlockSound.play();
                    }, 200);
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
                    zapOn.show();
                    game.add.tween(zapOn.sprite).from({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 200);
                    game.add.tween(zapOffList[j].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 200);
                    zapOffList.splice(j, 1);
                    setTimeout(function() {
                      zapOffSound.play();
                    }, 200);
                    break;
                  }
                }
              }
              if (replicaList[i]) {
                for (j = goalList.length - 1; j >= 0; j--) {
                  if ((goalList[j].row === replicaList[i].row) && (goalList[j].col === replicaList[i].col)) {
                    blockedList.push({row: goalList[j].row, col: goalList[j].col});
                    game.add.tween(goalList[j].sprite).to({width: goalList[j].width * 1.5, height: goalList[j].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 200);
                    goalList.splice(j, 1);
                    game.add.tween(replicaList[i].sprite).to({width: replicaList[i].width * 1.5, height: replicaList[i].height * 1.5}, 1000, Phaser.Easing.Elastic.Out, true, 200);
                    replicaList[i].finished = true;
                    setTimeout(function() {
                      goalSound.play();
                    }, 200);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    if (unlocked) {
      for (i = lockList.length - 1; i >= 0; i--) {
        game.add.tween(lockList[i].sprite).to({width: 0, height: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
        game.add.tween(lockList[i].sprite).to({alpha: 0}, 1000, Phaser.Easing.Exponential.Out, true, 200);
        lockList.splice(i, 1);
      }
    }
  }
}

function teleport(r, pList, n) {
  setTimeout(function() {
    // Teleport from one portal to other portal
    r.row = pList[(n+1)%2].row;
    r.col = pList[(n+1)%2].col;
    r.x = pList[(n+1)%2].x;
    r.y = pList[(n+1)%2].y;
    r.sprite.x = pList[(n+1)%2].sprite.x;
    r.sprite.y = pList[(n+1)%2].sprite.y;
    game.add.tween(pList[0].sprite).to({width: pList[0].width * 1.5, height: pList[0].height * 1.5}, 1000, Phaser.Easing.Exponential.Out, true);
    game.add.tween(pList[1].sprite).to({width: pList[1].width * 1.5, height: pList[1].height * 1.5}, 1000, Phaser.Easing.Exponential.Out, true);
    game.add.tween(pList[0].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true);
    game.add.tween(pList[1].sprite).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true);
    pList.length = 0;
  }, 200);
}

function spaceProcess() {
  if (goalList.length <= 0) {
    nextProcess();
  } else {
    resetProcess();
  }
}

function resetProcess() {
  if (loaded) {
    if (goalList.length <= 0) {
      winSound.play();
      completionList[levelIndex] = true;
    }
    loaded = false;
    ready = false;
    playState.camera.fade('#646464', 500, true);
    setTimeout(function() {
      setReady();
      resetLevel();
    }, 500);
  }
}

function nextProcess() {
  if (loaded) {
    if ((goalList.length <= 0) || completionList[levelIndex]) {
      winSound.play();
      loaded = false;
      ready = false;
      playState.camera.fade('#646464', 500, true);
      setTimeout(function() {
        completionList[levelIndex] = true;
        storeCompletion();
        setReady();
        nextLevel();
        resetLevel();
      }, 500);
    }
  }
}

function previousProcess() {
  if (loaded) {
    if (levelIndex > 0 || (levelIndex === 0 && completionList[completionList.length - 1])) {
      winSound.play();
      loaded = false;
      ready = false;
      playState.camera.fade('#646464', 500, true);
      setTimeout(function() {
        setReady();
        previousLevel();
        resetLevel();
      }, 500);
    }
  }
}

function setReady() {
  ready = true;
}

function setLoaded() {
  loaded = true;
}

function startSwipe() {
  startX = game.input.worldX;
  startY = game.input.worldY;
  game.input.onDown.remove(startSwipe);
  game.input.onUp.add(endSwipe);
}

function endSwipe() {
  endX = game.input.worldX;
  endY = game.input.worldY;
  var distX = endX - startX;
  var distY = endY - startY;

  if (Math.abs(distX) > (Math.abs(distY) * 2) && Math.abs(distX) > (game.width / 20)) {
    if (landscape) {
      if (distX > 0) {
        moveEast();
      } else {
        moveWest();
      }
    } else {
      if (distX > 0) {
        moveSouth();
      } else {
        moveNorth();
      }
    }
  }

  if (Math.abs(distY) > (Math.abs(distX) * 2) && Math.abs(distY) > (game.height / 20)) {
    if (landscape) {
      if (distY > 0) {
        moveSouth();
      } else {
        moveNorth();
      }
    } else {
      if (distY > 0) {
        moveWest();
      } else {
        moveEast();
      }
    }
  }

  game.input.onDown.add(startSwipe);
  game.input.onUp.remove(endSwipe);
}
