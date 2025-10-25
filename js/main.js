var gBoard
var minesLocation
var timerInterval
var elHint

var time = 0

const elCurrentTime = document.querySelector('.timer span')
const elMarkedCells = document.querySelector('.marked-cells span')
const MINE = '💣'
const EMPTY = ''
const MARKED = '🚩'

const HEARTIMG = "img/heart3.png"
const HINTIMG = "img/hint.png"
var clickSound = new Audio('sounds/click.mp3')
var explosionSound = new Audio('sounds/explosion.mp3')

const LEVELS = {
    easy: { boardLength: 4, minesCount: 3, lives: 1, hints: 1 },
    medium: { boardLength: 8, minesCount: 8, lives: 2, hints: 2 },
    hard: { boardLength: 12, minesCount: 12, lives: 3, hints: 3 },
}

var currLevel = LEVELS.easy
var clickedHint = false

var gGame = {
    fstClicked: false,
    isOn: true,
    markedCount: 0,
    lives: currLevel.lives,
    hints: currLevel.hints
}

//----------------------------------------------------

function onInit() { //1
    // clearInterval(timerInterval)
    elCurrentTime.textContent = "00:00:00"
    elMarkedCells.innerText = 0
    time = 0
    clickedHint = false
    gGame.markedCount = 0
    gGame.lives = currLevel.lives
    gGame.hints = currLevel.hints
    gBoard = createBoard(currLevel.boardLength) //creates the board with no mines
    renderBoard(gBoard)
    renderMinesLivesHints()
    gGame.isOn = true
}

function resetBtnClicked(elBtn) { //lets the player click the board
    gGame.fstClicked = false
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

    for (const key in LEVELS) {
        if (difficultyStr === key) {
            currLevel = LEVELS[key]
            gGame.lives = LEVELS[key].lives
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

function renderCell(iIdx, jIdx) { // for the hints
    gGame.isOn = false
    clickedHintEl(elHint)
    gGame.hints--
    renderMinesLivesHints()
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > currLevel.boardLength - 1) continue

        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j > currLevel.boardLength - 1) continue
            if (gBoard[i][j].isRevealed) continue
            const elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            const currCell = gBoard[i][j]
            if (currCell.isMine) {
                elCurrCell.innerText = MINE

            } else if (currCell.minesAroundCount !== 0) {
                elCurrCell.innerText = currCell.minesAroundCount

            } else {
                elCurrCell.innerText = EMPTY
            }
            addClass(elCurrCell, 'revealed')
            setTimeout(() => {elCurrCell.classList.remove('revealed'); elCurrCell.innerText = EMPTY ; gGame.isOn = true}, 1500)

        }
    }

}



function onCellClicked(elCell, i, j) {

    var currCell = gBoard[i][j]
    if (gGame.isOn === false) return
    if (currCell.isMarked) return
    //--------
    if (gGame.fstClicked === false) {  //first click
        gGame.fstClicked = true
        firstClicked(i, j)
    }
    if (currCell.isRevealed === true) {
        reaveledClicked(i, j)
        return
    }
    if (clickedHint) {
        renderCell(i, j)
        return
    }
    if (currCell.minesAroundCount === 0) { //opens cells around
        revealArea(elCell, i, j)
    }

    if (currCell.isMine === true) {                        //is a mine
        clickedMine(elCell, i, j)
    } else {                                                // not a mine
        if (currCell.minesAroundCount !== 0) {
            elCell.innerText = currCell.minesAroundCount
        }
        addClass(elCell, 'revealed')    // both
        clickSound.play()
    }
    currCell.isRevealed = true
    checkVictory()
}

function onCellMarked(elCell, i, j) { // mark/unmark

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
    checkVictory()
}


function clickedMine(elCell, i, j) {   //TODO later checks if the player left lives. if false, calls  checkGameOver(win)
    elCell.innerText = MINE
    addClass(elCell, 'mine')
    gGame.lives -= 1
    explosionSound.play()
    renderMinesLivesHints()
    if (gGame.lives === 0) {
        onLoss()
    } else {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        elCell.innerText = MARKED
        elMarkedCells.innerText = gGame.markedCount
    }
    // checkVictory()
}

function revealArea(elCell, iIdx, jIdx) {
    if (gBoard[iIdx][jIdx].isMine) return

    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > currLevel.boardLength - 1) continue

        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j > currLevel.boardLength - 1) continue
            if (i === iIdx && j === jIdx) continue
            if (gBoard[i][j].isRevealed) continue
            const currCell = gBoard[i][j]

            const elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            if (currCell.minesAroundCount !== 0) {
                currCell.isRevealed = true
                elCurrCell.innerText = currCell.minesAroundCount
                addClass(elCurrCell, 'revealed')

            } else {
                currCell.isRevealed = true
                elCurrCell.innerText = EMPTY
                addClass(elCurrCell, 'revealed')
                revealArea(elCell, i, j)
            }
        }
    }
}

function reaveledClicked(iIdx, jIdx) {
    var markedAround = 0
    if (gBoard[iIdx][jIdx].minesAroundCount === 0) return
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (i < 0 || i > currLevel.boardLength - 1 || j < 0 || j > currLevel.boardLength - 1) continue
            if (i === iIdx && j === jIdx) continue

            if (gBoard[i][j].isMarked) {
                markedAround++
            }
        }
    }

    if (markedAround === gBoard[iIdx][jIdx].minesAroundCount) {
        for (var i = iIdx - 1; i <= iIdx + 1; i++) {
            for (var j = jIdx - 1; j <= jIdx + 1; j++) {
                if (i < 0 || i > currLevel.boardLength - 1 || j < 0 || j > currLevel.boardLength - 1) continue
                if (gBoard[i][j].isMarked) continue
                if (gBoard[i][j].isRevealed) continue
                if (i === iIdx && j === jIdx) continue
                const elCurrCell = document.querySelector(`.cell-${i}-${j}`)

                if (gBoard[i][j].isMine) {
                    gBoard[i][j].isRevealed = true
                    clickedMine(elCurrCell, i, j)
                    continue
                }

                gBoard[i][j].isRevealed = true
                addClass(elCurrCell, 'revealed')
                if (gBoard[i][j].minesAroundCount > 0) {
                    elCurrCell.innerText = gBoard[i][j].minesAroundCount
                } else {
                    elCurrCell.innerText = EMPTY
                }
            }
        }
    }
    checkVictory()
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
    checkVictory()
}

function onLoss() {
    gGame.isOn = false
    revealMines()
    clearInterval(timerInterval)
    setTimeout(alert('You lost!!😩  (temporery)'), 200) //timeout is not working.. 😓
}

function checkVictory() {
    if (gGame.markedCount !== currLevel.minesCount) return

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isMine) {
                if (currCell.isMarked !== true) return

            } else {
                if (currCell.isRevealed === false) return
            }
        }
    }
    clearInterval(timerInterval)
    gGame.isOn = false
    setTimeout(() => { alert('You Won!!😎  (temporery)') }, 200) //timeout is not working.. 😓
}

function clickedHintEl(elImg) {
    elHint = elImg
    if (clickedHint === false) {
        clickedHint = true
        addClass(elImg, 'clicked')
    } else {
        clickedHint = false
        elImg.classList.remove('clicked')
    }
}


function renderMinesLivesHints() {
    var elMinesCounter = document.querySelector('.mines span')  //mines
    elMinesCounter.innerText = currLevel.minesCount

    var elLivesContainer = document.querySelector('.lives-container') //hearts
    elLivesContainer.innerHTML = ''
    for (var i = 0; i < gGame.lives; i++) {
        const img = document.createElement('img')
        img.src = HEARTIMG
        elLivesContainer.appendChild(img)
    }

    var elHintsContainer = document.querySelector('.hints span')
    elHintsContainer.innerHTML = ''
    for (var i = 0; i < gGame.hints; i++) { //hints
        const img = document.createElement('img')
        img.src = HINTIMG
        img.addEventListener('click', function () { clickedHintEl(this) })
        elHintsContainer.appendChild(img)
    }
}

function addClass(el, Class) {
    el.classList.add(Class)
}

