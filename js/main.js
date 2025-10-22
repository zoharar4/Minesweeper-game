var gBoard
var minesLocation
var minesCount = 0
const MINE = '💣'
const EMPTY = ''
const MARKED = '🚩'
var clickSound = new Audio('sounds/click.mp3')

const LEVELS = {
    easy: { boardLength: 4, mineCount: 2, lives:1},
    medium: { boardLength: 6, mineCount: 4, lives:2 },
    hard: { boardLength: 8, mineCount: 6, lives:3 },
}

var currLevel = LEVELS.hard

var gGame = {
    isOn: false,
    canClick: false,
    secsPassed: 0,
    markedCount: 0,
    currMinesCount: currLevel.mineCount,
}


//----------------------------------------------------

function onInit() {
    gBoard = undefined
    gBoard = createBoard(currLevel.boardLength) //creates the board with mines
    setMinesNegsCount(minesLocation, gBoard)    //updates the minesAroundCount of the cells
    console.table(gBoard)
    renderBoard(gBoard)
}

function startBtnClicked(elBtn) {
    if (gGame.isOn) return
    onInit ()
    elBtn.style.visibility = 'hidden'
    gGame.canClick = true
    gGame.isOn = true
    clickSound.play()
}

function createBoard(matLength) { //creates matrix of objects and two mines in same location(for now).//model
    gBoard = []
    minesLocation = []
    for (var i = 0; i < matLength; i++) {
        gBoard[i] = []
        for (var j = 0; j < matLength; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0, isRevealed: false, isMine: false, isMarked: false
            }
            if (i === 1 && j === 1 || i === matLength - 2 && j === matLength - 2 || i === 3 && j === 1 || i === 1 && j === 4) { //temporary
                gBoard[i][j].isMine = true
                minesLocation.push({ i, j })
            }
        }
    }
    return gBoard
}

// minesLocation = [{j, i}, {j, i}]
function setMinesNegsCount(minesLocation, board) { //gets the i and j of the mines location in array of object and
    for (var t = 0; t < minesLocation.length; t++) { //t < 2, runs 2 times
        var currMineI = minesLocation[t].i
        var currMineJ = minesLocation[t].j
        
        for (var i = currMineI - 1; i <= currMineI + 1; i++) {
            if (i < 0 || i > board.length - 1) continue                 // check to see if the i is not in the board's area
            
            for (var j = currMineJ - 1; j <= currMineJ + 1; j++) {
                if (j < 0 || j > board.length - 1) continue             // check to see if the j is not in the board's area
                if (i === currMineI && j === currMineJ) continue         // check to see if its the mine
                console.log('1:', 1)
                
                gBoard[i][j].minesAroundCount += 1
            }
        }
    }
}


function renderBoard(board) { //puts the html code into the html file and updates the mines and the num of mines around. (one time fn?)
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[i].length; j++) {

            strHTML += `<td oncontextmenu="onRightClick(this,${i},${j}) return false" onclick="onCellClicked(this,${i},${j})" class="cell cell_${i}-${j}"></td>`
        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}


function onCellClicked(elCell, i, j) {
    
    var currCell = gBoard[i][j]
    if (currCell.isRevealed === true) { console.log('already revealed:', i, j); return }
    if (gGame.canClick === false) return
    if (currCell.isMarked) return

    if (currCell.isMine === true) {                        //is mine
        elCell.innerText = MINE
        elCell.style.backgroundColor = 'rgb(210, 0, 0)'
        clickedMine()
    } else {                                                // not a mine
        if (currCell.minesAroundCount !== 0) {             // not zero mines around
            elCell.innerText = currCell.minesAroundCount
        }
        elCell.style.backgroundColor = 'rgb(90, 90, 90)'    // both
        clickSound.play()  
    }
    currCell.isRevealed = true                             // all
}

function onRightClick() {
    console.log('9:',9)
}


function clickedMine() {   // later checks if the player left lives. if false, calls  checkGameOver(win)
    checkGameOver(false)
    var startBtn = document.querySelector('.start-btn')
    startBtn.style.visibility = 'visible'
    gGame.isOn = false
    gGame.canClick = false
}

function checkGameOver(win) {
    if (win) {
        // show play again button and a massage of victory. show time
    } else {

    }
}