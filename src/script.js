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

function onLevelChange(level,_el) {
    //Here depending on the button pressed, the level which is effctively the depth is input and that button is selected.
    if (_el.classList.contains('level-selected'))
        return;
    _el.classList.add('level-selected');
    if(level=='l1'){
        max_depth=1;
        document.querySelector(`.level.l2`).classList.remove('level-selected');
        document.querySelector(`.level.l3`).classList.remove('level-selected');
        document.querySelector(`.level.l4`).classList.remove('level-selected');
        document.querySelector(`.level.l5`).classList.remove('level-selected');
    }
    if(level=='l2'){
        max_depth=2;
        document.querySelector(`.level.l1`).classList.remove('level-selected');
        document.querySelector(`.level.l3`).classList.remove('level-selected');
        document.querySelector(`.level.l4`).classList.remove('level-selected');
        document.querySelector(`.level.l5`).classList.remove('level-selected');
    }
    if(level=='l3'){
        max_depth=3;
        document.querySelector(`.level.l2`).classList.remove('level-selected');
        document.querySelector(`.level.l1`).classList.remove('level-selected');
        document.querySelector(`.level.l4`).classList.remove('level-selected');
        document.querySelector(`.level.l5`).classList.remove('level-selected');
    }
    if(level=='l4'){
        max_depth=4;
        document.querySelector(`.level.l2`).classList.remove('level-selected');
        document.querySelector(`.level.l3`).classList.remove('level-selected');
        document.querySelector(`.level.l1`).classList.remove('level-selected');
        document.querySelector(`.level.l5`).classList.remove('level-selected');
    }
    if(level=='l5'){
        max_depth=1000;
        document.querySelector(`.level.l2`).classList.remove('level-selected');
        document.querySelector(`.level.l3`).classList.remove('level-selected');
        document.querySelector(`.level.l4`).classList.remove('level-selected');
        document.querySelector(`.level.l1`).classList.remove('level-selected');
    }
    if(gameMode=='PvC')  newGame();   
    
}
function clearSuggestion(){
    //Change suggestion color green to grey again
    var remainingMoves=getRemainingMoves();
    for(var box of remainingMoves){
        var nbox=document.querySelector(`[id='${box}']`);
        nbox.style.backgroundColor='gray';
    }
    
}
function onCheckBox(element) {
    //Ensure all suggestions are cleared
    clearSuggestion();
    //Change color to black
    element.style.backgroundColor='black';
    
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
    //clear the board by removing the moves and chaging color back
    document.querySelectorAll('.box').forEach((value, index) => {
        value.style.backgroundColor='gray';
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
        //update score of player X or player O correspondigly.
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
        computerPlays(true);
    });
})

function newGame() {
    //show the loader
    showLoader();
    clearBoard();
    document.querySelector('.winner-screen').classList.remove('fade-in');
    document.querySelector('.winner-screen').classList.add('fade-out');
    switchPlayer();
    //hide the loader
    setTimeout(hideLoader, 500);
}

function computerPlays(isCheck = false) {
    var nextBoxCoords;
    //call findmove function to get best possible move for the computer
    //hard coding first level to speed up the process
    //this is the first iteration of minimax in which a direct victory move is played
    if(turnCount==1){
        nextBoxCoords =computeFirstMove();
    }
    if (!nextBoxCoords) {
        nextBoxCoords = computeFinishingMove(); 
    } 
    //this blocks any direct win of the opponent but it is of depth 2 so if max depth is 1 this shouldnt be implemented
    if (!nextBoxCoords && max_depth > 1) {
        nextBoxCoords = computeSavingMove();
    }
    //the findmove function returns the best move to be played using minimax function
    if (!nextBoxCoords) {
        nextBoxCoords = findmove();
    }
    var nextBox = document.querySelector(`[id='${nextBoxCoords}']`);
    if (isCheck) {
        console.log(nextBoxCoords);
        //make the 'nextBox' with a different color
        nextBox.style.backgroundColor='green';
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
            checkedBoxes = checkedBoxes.filter(b => b.box != nextBox.id);
            break;
        }
        checkedBoxes = checkedBoxes.filter(b => b.box != nextBox.id);
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
            checkedBoxes = checkedBoxes.filter(b => b.box != nextBox.id);
            break;
        }
        checkedBoxes = checkedBoxes.filter(b => b.box != nextBox.id);
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
        checkedBoxes = checkedBoxes.filter(b => b.box != nextBox.id);
        if(mval>=bval){            
            bmove=move;
            bval=mval;                       
        }
    }
    return bmove;
}

var max_depth=1000;

function minimax(depth,ismax) {
    //here minimax coniders winning possiblities, minimum depth of win and number of possiblities of winning in that order of precedence using a factor of 10 and 100.
    var remainingMoves = getRemainingMoves();
    var score = evaluate();
    //return the evaluated score of maximiser
    if(score == 1) return 1000-depth*10+1;
    //return the evaluated score of minimiser
    if(score == -1) return -1000+depth*10-1;
    //to incorporate the intelligence level
    if(depth >= max_depth) return 0;   
    if(!remainingMoves)return 0;
    //if the move is by maximiser
    if(ismax){
        var bval=-10000;
            var wins=0;
        for(move of remainingMoves){
            checkedBoxes.push({ box: move, player: currentPlayer });
            var nextBox = document.querySelector(`[id='${move}']`);
            var v=minimax(depth+1,!ismax);
            if(v>0)wins=wins+v%1000;
            if(bval<v){
                bval=v-v%1000;
            }
            checkedBoxes = checkedBoxes.filter(b => b.box != nextBox.id);
        }
        return bval+wins;
    }
    //if the move is by minimiser
    else {
        var bval=10000;
        var loses=0;
        for(move of remainingMoves){
            switchPlayer();
            checkedBoxes.push({ box: move, player: currentPlayer });
            var nextBox = document.querySelector(`[id='${move}']`);
            var v=minimax(depth+1,!ismax);            
            if(v<0)loses=loses+(-v)%1000;
            if(bval>v){
                bval=v+(-v)%1000;
            }
            checkedBoxes = checkedBoxes.filter(b => b.box != nextBox.id);
            switchPlayer();
        }
        return bval-loses;
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


function showLoader() {
    document.querySelector('.loader-overlay').style.display = 'block';   
}

function hideLoader(){
    document.querySelector('.loader-overlay').style.display = 'none';
}

//function that if the suggestion button is clicked, call ComputerPlays(true)
function suggestions(){
    computerPlays(true);
}


