var currentPlayer = "X";

var checkedBoxes = [];

var turnCount = 0;

var gameMode = 'PvP';

var dep=-1;

//After new game we wait for click in any box in the container. After click go to onCheckbox(). 
document.querySelectorAll('.box').forEach((value, key) => {
    value.addEventListener("click", () => {
        onCheckBox(value);
    });
});

function onGameModeChange(mode, _el) {
    //Here depending on the button pressed, PvP or PvC mode is implemented
    if (_el.classList.contains('mode-selected'))
        return;
    _el.classList.add('mode-selected');

    if (mode == 'PvP') {
        document.querySelector(`.mode.PvC`).classList.remove('mode-selected');
    }
    else if (mode == 'PvC') {
        document.querySelector(`.mode.PvP`).classList.remove('mode-selected');
    }
    gameMode = mode;
    newGame(); 
}

function onCheckBox(element) {
    //Here we push box id and player onto the dictionary and call checkElement
    checkedBoxes.push({ box: element.id, player: currentPlayer });
    checkElement(element);
    turnCount++;
    //check in case there is a winner
    var gameStatus = checkWinner();
    //interchange player to be playing next
    switchPlayer();
    //In case gamemode is pvc i.e. game is single player, call computerplays for computer to execute move.
    if (turnCount % 2 == 1 && gameStatus != 'game over' && gameStatus != 'game drawn' && gameMode == "PvC"){
        computerPlays();
    }
}

function checkElement(element){
    //Disable and mark the corresponding box.
    element.value = currentPlayer;
    element.disabled = "disabled";
}

function onUncheckBox(element, isImplicit = false) {
    //Similar to checkedBoxes.pop()
    checkedBoxes = checkedBoxes.filter(b => b.box != element.id);
    if (!isImplicit) {
        element.value = '';
        element.removeAttribute("disabled");
        turnCount--;
        switchPlayer();
    }
}

function switchPlayer() {
    //switch the current player to the other
    currentPlayer = currentPlayer == "X" ? "O" : "X";
    document.querySelector('.current-player').textContent = currentPlayer;
}

function checkWinner(isCheckOnly = false) {
    //Take all the elements of the current player in checkedBoxes dictionary, convert them to coordinates and store in another dictionary
    if (currentPlayer == "X") {
        var xs = checkedBoxes.filter(item => {
            return item.player == "X";
        }).map(value => {
            return { x: Number(value.box.split("-")[0]), y: Number(value.box.split("-")[1]) }
        });
        //check the xs dictionaries whether there is a winning configuration
        return calculateScore(xs, isCheckOnly);
    }
    else if (currentPlayer == "O") {
        var os = checkedBoxes.filter(item => {
            return item.player == "O";
        }).map(value => {
            return { x: Number(value.box.split("-")[0]), y: Number(value.box.split("-")[1]) }
        });
        //check the os dictionaries whether there is a winning configuration
        return calculateScore(os, isCheckOnly);
    }
}

function calculateScore(positions, isCheckOnly) {
    //check if left diagonal is a match
    if (positions.filter(i => { return i.x == i.y }).length == 3) {
        if (!isCheckOnly)
            showWinner();
        return 'game over';
    }
    //check if right diagonal is a match
    if (positions.filter(i => { return (i.x == 0 && i.y == 2) || (i.x == 1 && i.y == 1) || (i.x == 2 && i.y == 0) }).length == 3) {
        if (!isCheckOnly)
            showWinner();
        return 'game over';
    }
    //check if one of the rows or columns is a match
    for (var i = 0; i < 3; i++) {
        var consecutiveHorizontal = positions.filter(p => {
            return p.x == i;
        });
        if (consecutiveHorizontal.length == 3) {
            if (!isCheckOnly)
                showWinner();
            return 'game over';
        }
        var consecutiveVertical = positions.filter(p => {
            return p.y == i;
        });
        if (consecutiveVertical.length == 3) {
            if (!isCheckOnly)
                showWinner();
            return 'game over';
        }
    }
    //if there are 5 positions then its a draw
    if (positions.length == 5) {
        if (!isCheckOnly)
            showWinner(true);
        return 'game drawn';
    }
    return 'game on';
}

function clearBoard() {
    document.querySelectorAll('.box').forEach((value, index) => {
        value.value = '';
        value.removeAttribute("disabled");
        checkedBoxes = [];
        turnCount = 0;
    })
}

function showWinner(noWinner = false) {
    //displays modal box with result.
    if (noWinner) {
        document.querySelector('.winner-screen .body').innerHTML = 'Its a Draw!';
        document.querySelector('.winner-screen').classList.toggle('fade-in');
        document.querySelector('.winner-screen').classList.toggle('fade-out');
        //updateModel('draw');
        return;
    }
    else {
        document.querySelector('.winner-screen .body').innerHTML = 'Player ' + currentPlayer + ' Won!';
        document.querySelector('.winner-screen').classList.toggle('fade-in');
        document.querySelector('.winner-screen').classList.toggle('fade-out');
        document.querySelector('#score-' + currentPlayer).textContent = Number(document.querySelector('#score-' + currentPlayer).textContent) + 1;
        return;
    }
}

//if new game button is clicked start new game
document.querySelectorAll('.okay-button').forEach((value, key) => {
    value.addEventListener('click', () => {
        newGame();
    });
})

//if suggestion button is clicked show suggestion
document.querySelectorAll('.suggest-button').forEach((value, key) => {
    value.addEventListener('click', () => {
        
    });
})

function newGame() {
    showLoader();
    clearBoard();
    document.querySelector('.winner-screen').classList.remove('fade-in');
    document.querySelector('.winner-screen').classList.add('fade-out');
    switchPlayer();
    setTimeout(hideLoader, 500);
}

function computerPlays(isCheck = false) {
    var nextBoxCoords;
    //call findmove function to get best possible move for the computer
    //hard coding first level to speed up the process
    if(turnCount == 1){
        nextBoxCoords = computeFirstMove();
    }
    //this is the first iteration of minimax in which a direct victory move is played
    if (!nextBoxCoords) {
        nextBoxCoords = computeFinishingMove(); 
    } 
    //this blocks any direct win of the opponent
    if (!nextBoxCoords && max_depth > 1) {
        nextBoxCoords = computeSavingMove();
    }
    //the findmove function returns the best move to be played using minimax function
    if (!nextBoxCoords) {
        nextBoxCoords = findmove();
    }
    var nextBox = document.querySelector(`[id='${nextBoxCoords}']`);
    if (isCheck) {
        //make the 'nextBox' with a different color
    }
    else {
        onCheckBox(nextBox); 
    }
}

function computeFirstMove(){
    //According to each type of the first move made go to corresponding function for computer's first move.
    //For first move instead of implementing minimax completely the corresponding moves can be taken directly to save time.
    var playedMove = checkedBoxes.map(b => b.box)[0];
    var edgeMoves = ['0-1', '1-0', '1-2', '2-1'];
    var cornerMoves = ['0-0', '0-2', '2-0', '2-2'];
    var centerMove = ['1-1'];
    if(edgeMoves.find(m => m == playedMove))
        return edgeMoveResponse(playedMove);
    else if(cornerMoves.find(m => m == playedMove))
        return '1-1';
    else if(centerMove.find(m => m == playedMove))
        return '0-0';
}

function edgeMoveResponse(playedMove){
    //choose adjacent corner to that edge corner
    if(playedMove == '1-2') 
        return '2-2';
    else if (playedMove == '0-1') 
        return '0-2';
    else if (playedMove == '1-0') 
        return '0-0';
    else if(playedMove == '2-1') 
        return '2-0';
}

function computeSavingMove() {
    //prevent opposing player's single winning move. This is also part of the depth 1 implementation.
    var remainingMoves = getRemainingMoves();
    switchPlayer();
    var savingMoveCoords;
    //Iterate through every remaining move to see if one of the moves results in a win
    for (var move of remainingMoves) {
        checkedBoxes.push({ box: move, player: currentPlayer });
        var nextBox = document.querySelector(`[id='${move}']`)
        if (checkWinner(true) == 'game over') { 
            savingMoveCoords = move;
            onUncheckBox(nextBox, true);
            break;
        }
        onUncheckBox(nextBox, true);
    }
    switchPlayer();
    if(savingMoveCoords){
        console.log('Playing Saving Move')
        return savingMoveCoords;
    }
}

function computeFinishingMove() {
    //This checks if the game can end in one winning move and returns that move. Basically this is minimax algo implementation with depth 1.
    var remainingMoves = getRemainingMoves();
    var finishingMoveCoords;
    //Iterate through every remaining move to see if one of the moves results in a win
    for (var move of remainingMoves) {
        checkedBoxes.push({ box: move, player: currentPlayer });
        var nextBox = document.querySelector(`[id='${move}']`)
        if (checkWinner(true) == 'game over') {
            finishingMoveCoords = move;
            onUncheckBox(nextBox, true);
            break;
        }
        onUncheckBox(nextBox, true);
    }
    if(finishingMoveCoords){
        console.log('Playing Finishing Move')
        return finishingMoveCoords;
    }
    else{
        return '';
    }  
}

function findmove(){
    //Returns the best move for computer to play
    var bval=-1000;
    var bmove='3-3';
    var remainingMoves = getRemainingMoves();
    //Iterates through every move using the minimax algorithm for fastest victory
    for(var move of remainingMoves){
        checkedBoxes.push({ box: move, player: currentPlayer });
        var nextBox = document.querySelector(`[id='${move}']`);
        var mval=minimax(0, false);
        onUncheckBox(nextBox, true);
        if(mval>=bval){            
            bmove=move;
            bval=mval;                       
        }
    }
    return bmove;
}

var max_depth=1000;

function minimax(depth,ismax) {
    var remainingMoves = getRemainingMoves();
    var score = evaluate();
    //return the evaluated score of maximiser
    if(score == 1) return 100-depth;
    //return the evaluated score of minimiser
    if(score == -1) return -100+depth;
    //to incorporate the intelligence level
    if(depth >= max_depth) return 0;   
    if(!remainingMoves)return 0;
    //if the move is by maximiser
    if(ismax){
        var bval=-1000;
        for(move of remainingMoves){
            checkedBoxes.push({ box: move, player: currentPlayer });
            var nextBox = document.querySelector(`[id='${move}']`);
            var v=minimax(depth+1,!ismax);
            if(bval<v){
                bval=v;
            }
            onUncheckBox(nextBox, true);
        }
        return bval;
    }
    //if the move is by minimiser
    else {
        var bval=1000;
        for(move of remainingMoves){
            switchPlayer();
            checkedBoxes.push({ box: move, player: currentPlayer });
            var nextBox = document.querySelector(`[id='${move}']`);
            var v=minimax(depth+1,!ismax);
            if(bval>v){
                bval=v;
            }
            onUncheckBox(nextBox, true);
            switchPlayer();
        }
        return bval;
    }
}

function evaluate() {
    var xs = checkedBoxes.filter(item => {
        return item.player == "X";
    }).map(value => {
        return { x: Number(value.box.split("-")[0]), y: Number(value.box.split("-")[1]) }
    });
    var os = checkedBoxes.filter(item => {
        return item.player == "O";
    }).map(value => {
        return { x: Number(value.box.split("-")[0]), y: Number(value.box.split("-")[1]) }
    });

    //check the xs dictionary whether there is a winning configuration
    if(currentPlayer=="X"){
        if (xs.filter(i => { return i.x == i.y }).length == 3) {
            return 1;
        }
        if (os.filter(i => { return i.x == i.y }).length == 3) {
            return -1;
        }
        //check if right diagonal is a match
        if (xs.filter(i => { return (i.x == 0 && i.y == 2) || (i.x == 1 && i.y == 1) || (i.x == 2 && i.y == 0) }).length == 3) {
            return 1;
        }
        if (os.filter(i => { return (i.x == 0 && i.y == 2) || (i.x == 1 && i.y == 1) || (i.x == 2 && i.y == 0) }).length == 3) {
            return -1;
        }
        //check if one of the rows is a match
        for (var i = 0; i < 3; i++) {
            var consecutiveHorizontal = xs.filter(p => {
                return p.x == i;
            });
            if (consecutiveHorizontal.length == 3) {
                return 1;
            }
            var consecutiveVertical = xs.filter(p => {
                return p.y == i;
            });
            if (consecutiveVertical.length == 3) {
                return 1;
            }
        }
        //check if one of the columns is a match
        for (var i = 0; i < 3; i++) {
            var consecutiveHorizontal = os.filter(p => {
                return p.x == i;
            });
            if (consecutiveHorizontal.length == 3) {
                return -1;
            }
            var consecutiveVertical = os.filter(p => {
                return p.y == i;
            });
            if (consecutiveVertical.length == 3) {
                return -1;
            }
        }
        return 0;    
    }

    //check the os dictionary if there is a winning configuration
    if(currentPlayer=="O"){
        if (xs.filter(i => { return i.x == i.y }).length == 3) {
            return -1;
        }
        if (os.filter(i => { return i.x == i.y }).length == 3) {
            return 1;
        }
        //check if right diagonal is a match
        if (xs.filter(i => { return (i.x == 0 && i.y == 2) || (i.x == 1 && i.y == 1) || (i.x == 2 && i.y == 0) }).length == 3) {
            return -1;
        }
        if (os.filter(i => { return (i.x == 0 && i.y == 2) || (i.x == 1 && i.y == 1) || (i.x == 2 && i.y == 0) }).length == 3) {
            return 1;
        }
        //check if one of the rows is a match
        for (var i = 0; i < 3; i++) {
            var consecutiveHorizontal = xs.filter(p => {
                return p.x == i;
            });
            if (consecutiveHorizontal.length == 3) {
                return -1;
            }
            var consecutiveVertical = xs.filter(p => {
                return p.y == i;
            });
            if (consecutiveVertical.length == 3) {
                return -1;
            }
        }
        //check if one of the columns is a match
        for (var i = 0; i < 3; i++) {
            var consecutiveHorizontal = os.filter(p => {
                return p.x == i;
            });
            if (consecutiveHorizontal.length == 3) {
                return 1;
            }
            var consecutiveVertical = os.filter(p => {
                return p.y == i;
            });
            if (consecutiveVertical.length == 3) {
                return 1;
            }
        }
        return 0;        
    }   
}

function getRemainingMoves() {
    //return all remaining moves
    var allMoves = ['0-0', '0-1', '0-2',
        '1-0', '1-1', '1-2',
        '2-0', '2-1', '2-2',]
    var playedMoves = checkedBoxes.map(b => b.box);
    return allMoves.filter(m => !playedMoves.find(move => move == m));
}

// var mod=getElementById("level");
// var l1=getElementById("level 1");
// var l2=getElementById("level 2");
// var l3=getElementById("level 3");
// var l4=getElementById("level 4");
// var l5=getElementById("level 5");
function showLoader() {
    document.querySelector('.loader-overlay').style.display = 'block';
    //mod.style.display="block";
}
// l1.onclick = function(){
//     dep=1;
//     setTimeout(hideLoader, 500);
// }
// l2.onclick = function(){
//     dep=2;
//     setTimeout(hideLoader, 500);
// }
// l3.onclick = function(){
//     dep=3;
//     setTimeout(hideLoader, 500);
// }
// l4.onclick = function(){
//     dep=4;
//     setTimeout(hideLoader, 500);
// }
// l5.onclick = function(){
//     dep=100;
//     setTimeout(hideLoader, 500);
// }
function hideLoader(){
    document.querySelector('.loader-overlay').style.display = 'none';
    //mod.style.display="none";
}

//function that if the suggestion button is clicked, call ComputerPlays(true)
function suggestions(){
    computerPlays(true);
}


