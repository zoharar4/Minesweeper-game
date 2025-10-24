var gBoard
var minesLocation
var timerInterval

var time = 0

var elCurrentTime = document.querySelector('.timer span')
const elMarkedCells = document.querySelector('.marked-cells span')
const MINE = '💣'
const EMPTY = ''
const MARKED = '🚩'
const HEARTIMG = "img/heart3.png"
var clickSound = new Audio('sounds/click.mp3')
var explosionSound = new Audio('sounds/explosion.mp3')

const LEVELS = {
    easy: { boardLength: 4, minesCount: 2, lives: 1 },
    medium: { boardLength: 8, minesCount: 4, lives: 2 },
    hard: { boardLength: 12, minesCount: 12, lives: 3 },
}

var currLevel = LEVELS.easy

var gGame = {
    frsClicked: false,
    isOn: true,
    markedCount: 0,
    lives: currLevel.lives,
}

//----------------------------------------------------

function onInit() { //1
    // clearInterval(timerInterval)
    time = 0
    elCurrentTime.textContent = "00:00:00"
    gGame.markedCount = 0
    elMarkedCells.innerText = 0
    gGame.lives = currLevel.lives
    gBoard = createBoard(currLevel.boardLength) //creates the board with no mines
    renderBoard(gBoard)
    renderMinesLives()
    gGame.isOn = true
}

function resetBtnClicked(elBtn) { //lets the player click the board
    gGame.frsClicked = false
    clickSound.play()
    clearInterval(timerInterval)
    onInit()
}

function firstClicked(i, j) {
    rndmMines(i, j)
    setMinesNegsCount(minesLocation, gBoard)    //updates the minesAroundCount of the cells
    timerInterval = setInterval(getTime, 10)
    console.log('gBoard:', gBoard)
}

function getTime() { // סופר זמן ב0.01 שניות

    time++
    var min = Math.trunc(time / 6000)
    var sec = Math.trunc((time / 100) % 60)
    var decSec = Math.trunc(time % 100)

    elCurrentTime.textContent = String(min).padStart(2, 0) + ":" + String(sec).padStart(2, 0) + ":" + String(decSec).padStart(2, 0)
}


function changeLevel(difficultyStr) {
    console.log('difficultyStr:', difficultyStr)
    for (const key in LEVELS) {
        if (difficultyStr === key) {
            currLevel = LEVELS[key]
            gGame.lives = LEVELS[key].lives

            console.log('gGame.lives:', gGame.lives)
            resetBtnClicked()
            return
        }
    }
}


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


function rndmMines(clickeI, clickedJ) {
    const minesCount = currLevel.minesCount
    minesLocation = []      // used to update the cells innerText to a num
    var canSpawn = []

    for (var i = 0; i < gBoard.length; i++) {           //gets all the locations of the board and put it inside an array
        for (var j = 0; j < gBoard[i].length; j++) {
            if (clickeI === i && clickedJ === j) continue
            canSpawn.push({ i, j })
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
    addNumsClasses()
}



function renderBoard(board) { //puts the html code into the html file and updates the mines and the num of mines around. (one time fn?)
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[i].length; j++) {
            strHTML += `<td onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,${i},${j}); return false"  class="cell cell-${i}-${j} "></td>`

        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}

function addNumsClasses() {                 // for the css color
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const minesAround = gBoard[i][j].minesAroundCount
            const elCurrCell = document.querySelector(`.cell-${i}-${j}`)

            elCurrCell.classList.add(`num${minesAround}`)
        }
    }
}



function onCellClicked(elCell, i, j) {

    var currCell = gBoard[i][j]
    if (currCell.isRevealed === true) return
    if (gGame.isOn === false) return
    if (currCell.isMarked) return
    //--------
    if (gGame.frsClicked === false) {  //first click
        gGame.frsClicked = true
        firstClicked(i, j)
    }
    if (currCell.minesAroundCount === 0) { //opens cells around
        revealArea(elCell, i, j)
    }

    if (currCell.isMine === true) {                        //is a mine
        elCell.innerText = MINE
        addClass(elCell, 'mine')
        clickedMine(elCell, i, j)
    } else {                                                // not a mine
        if (currCell.minesAroundCount !== 0) {
            elCell.innerText = currCell.minesAroundCount
        }
        addClass(elCell, 'revealed')    // both
        clickSound.play()
    }
    currCell.isRevealed = true
    if (gGame.markedCount === currLevel.minesCount) {
        checkVictory()
    }
}

function onCellMarked(elCell, i, j) { // Smark/unmark

    if (!gGame.isOn) return
    if (gBoard[i][j].isRevealed) return

    if (elCell.innerText === MARKED) {
        gBoard[i][j].isMarked = false
        elCell.innerText = EMPTY
        gGame.markedCount--
    } else {
        gBoard[i][j].isMarked = true
        elCell.innerText = MARKED
        gGame.markedCount++
    }
    elMarkedCells.innerText = gGame.markedCount
    if (gGame.markedCount === currLevel.minesCount) {
        checkVictory()
    }
}


function clickedMine(elCell, i, j) {   //TODO later checks if the player left lives. if false, calls  checkGameOver(win)

    gGame.lives -= 1
    explosionSound.play()
    renderMinesLives()
    if (gGame.lives === 0) {
        onLoss()
    } else {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        elCell.innerText = MARKED
        elMarkedCells.innerText = gGame.markedCount
    }
}
// thought: if i> idx && i< boardLength and minesAroundCount === 0 then reveale
function revealArea(elCell, iIdx, jIdx) {

    if (gBoard[iIdx][jIdx].isMine) return
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (i === iIdx && j === jIdx) continue
            if (i < 0 || i > currLevel.boardLength - 1 || j < 0 || j > currLevel.boardLength - 1) continue
            if (gBoard[i][j].isRevealed) continue
            console.log('1:', 1)

            const elCurrCell = document.querySelector(`.cell-${i}-${j}`)

            if (gBoard[i][j].minesAroundCount !== 0) {
                elCurrCell.innerText = gBoard[i][j].minesAroundCount
                gBoard[i][j].isRevealed = true
                addClass(elCurrCell, 'revealed')

            } else if (gBoard[i][j].minesAroundCount === 0) {
                elCurrCell.innerText = EMPTY
                gBoard[i][j].isRevealed = true
                addClass(elCurrCell, 'revealed')
                revealArea(elCell, i, j)
            }
        }

    }
}



function onLoss() {
    gGame.isOn = false
    revealMines()
    clearInterval(timerInterval)
    setTimeout(alert('You lost!!😩  (temporery)'), 200)
}

function checkVictory() {
    // לופ על כל הבורד ולמצוא את כל הפצצות (לבדוק אם אפשרי להשתמש בערך קיים) ולבדוק אם כולן עם עם מרקד שווה לטרו. ואז לבדוק באותו לופ לבדוק אם שאר התאים עם נחשפו
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isMine) {
                if (currCell.isMarked !== true) return

            } else if (currCell.isMine === false) {
                if (currCell.isRevealed === false) return
            } else {
                console.log('error:')
            }
        }
    }
    clearInterval(timerInterval)
    gGame.isOn = false
    console.log('victory:')
    setTimeout(() => { alert('You Won!!😎  (temporery)') }, 200)
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

function addClass(el, Class) {
    el.classList.add(Class)
}