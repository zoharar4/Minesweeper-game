var gBoard
var minesLocation
// var minesCount = 0
const MINE = '💣'
const EMPTY = ''
const MARKED = '🚩'
const HEARTIMG = "img/heart3.png"
var clickSound = new Audio('sounds/click.mp3')

const LEVELS = {
    easy: { boardLength: 4, minesCount: 2, lives: 1 },
    medium: { boardLength: 8, minesCount: 14, lives: 2 },
    hard: { boardLength: 12, minesCount: 32, lives: 3 },
}

var currLevel = LEVELS.easy

var gGame = {
    isOn: true,
    canClick: true,
    secsPassed: 0,
    markedCount: 0,
    lives: currLevel.lives

}


//----------------------------------------------------

function onInit() { //1
    gBoard = createBoard(currLevel.boardLength) //creates the board with no mines
    rndmMines()
    setMinesNegsCount(minesLocation, gBoard)    //updates the minesAroundCount of the cells
    renderBoard(gBoard)
    gGame.isOn = true
    console.log('gBoard:', gBoard)
    renderBoard(gBoard)
    gGame.lives = currLevel.lives
    renderMinesLives()
}

function resetBtnClicked(elBtn) { //lets the player click the board
    clickSound.play()
    onInit()
}

function firstClick(i, j) {



}

function changeLevel(difficultyStr) {
    console.log('difficultyStr:', difficultyStr)
    for (const key in LEVELS) {
        if (difficultyStr === key) {
            currLevel = LEVELS[key]
            gGame.lives = LEVELS[key].lives

            console.log('gGame.lives:', gGame.lives)
            onInit()
            return
        }
    }
}

// minesLocation = []
// if (i === 1 && j === 1 || i === matLength - 2 && j === matLength - 2 || i === 3 && j === 1 || i === 1 && j === 4) { //temporary
//     gBoard[i][j].isMine = true
//     minesLocation.push({ i, j })
// }

function createBoard(matLength) { //creates matrix of objects and two mines in same location(for now).//model //
    gBoard = []
    for (var i = 0; i < matLength; i++) {
        gBoard[i] = []
        for (var j = 0; j < matLength; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0, isRevealed: false, isMine: false, isMarked: false
            }
        }
    }
    return gBoard
}


function rndmMines() { 
    const minesCount = currLevel.minesCount 
    minesLocation = []
    var canSpawn = []


    for (var i = 0; i < gBoard.length; i++) {           //gets all the locations of the board and put it inside an array
        for (var j = 0; j < gBoard[i].length; j++) {
            // if (i !== iIdx && j !== jIdx) {
            canSpawn.push({ i, j })
            // }
        }
    }

    for (var i = 0; i < minesCount; i++) {  // runs the number of mines that is set in the current difficulty       
        rndmIdx = Math.floor(Math.random() * canSpawn.length) // random num from the array length
        var iIdx = canSpawn[rndmIdx].i
        var jIdx = canSpawn[rndmIdx].j
        gBoard[iIdx][jIdx].isMine = true
        minesLocation.push({ i: iIdx, j: jIdx })
        canSpawn.splice(rndmIdx, 1)
    }
}




// minesLocation = [{j, i}, {j, i}]
function setMinesNegsCount(minesLocation, board) { //gets the i and j of the mines location in array of object and
    console.log('minesLocation:', minesLocation)
    for (var t = 0; t < minesLocation.length; t++) { //t < 2, runs 2 times
        var currMineI = minesLocation[t].i
        var currMineJ = minesLocation[t].j

        for (var i = currMineI - 1; i <= currMineI + 1; i++) {
            if (i < 0 || i > board.length - 1) continue                 // check to see if the i is not in the board's area

            for (var j = currMineJ - 1; j <= currMineJ + 1; j++) {
                if (j < 0 || j > board.length - 1) continue             // check to see if the j is not in the board's area
                if (i === currMineI && j === currMineJ) continue         // check to see if its the mine
                if (gBoard[i][j].isMine === true) continue
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
            var minesAroundCurrCell = gBoard[i][j].minesAroundCount

            strHTML += `<td onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,${i},${j}); return false"  class="cell cell-${i}-${j} num${minesAroundCurrCell}"></td>`

        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}



function onCellClicked(elCell, i, j) {

    var currCell = gBoard[i][j]
    if (currCell.isRevealed === true) return
    if (gGame.isOn === false) return
    if (currCell.isMarked) return
    //--------
    if (currCell.isMine === true) {                        //is a mine
        elCell.innerText = MINE
        addClass(elCell, 'mine')
        clickedMine()
    } else {                                                // not a mine
        if (currCell.minesAroundCount !== 0) {
            elCell.innerText = currCell.minesAroundCount
        }
        addClass(elCell, 'revealed')    // both
        clickSound.play()
    }
    currCell.isRevealed = true
}

function onCellMarked(elCell, i, j) { // Smark/unmark
    if (!gGame.isOn) return
    if (gBoard[i][j].isRevealed) return
    if (elCell.innerText === MARKED) {
        gBoard[i][j].isMarked = false
        elCell.innerText = EMPTY
    } else {
        gBoard[i][j].isMarked = true
        elCell.innerText = MARKED
    }
}


function clickedMine() {   //TODO later checks if the player left lives. if false, calls  checkGameOver(win)
        gGame.lives -= 1
        renderMinesLives()
    if (gGame.lives === 0) {
        onLoss()
        var startBtn = document.querySelector('.reset-btn')
        startBtn.style.visibility = 'visible'
        gGame.isOn = false
    } else {
        
        // renderMinesLives
    }


}

function renderMinesLives() {
    var elMines = document.querySelector('.mines span')
    elMines.innerText = currLevel.minesCount
    
    var elLivesContainer = document.querySelector('.lives-container')
    elLivesContainer.innerHTML = ''
    for (var i = 0; i < gGame.lives; i++) {
        const img = document.createElement('img')
        img.src = HEARTIMG
        elLivesContainer.appendChild(img)
    }

}

function onLoss() {
    revealMines()
}

function onVictory() {

}




function revealMines() {
    for (var i = 0; i < minesLocation.length; i++) {
        var mineI = minesLocation[i].i
        var mineJ = minesLocation[i].j
        gBoard[mineI][mineJ].isRevealed = true
        var currMine = document.querySelector(`.cell-${mineI}-${mineJ}`)
        currMine.classList.add('mine')
        currMine.innerText = MINE
    }
}

function addClass(el, Class) {
    el.classList.add(Class)
}