(function(){

    function Player(name, el) {
        this.name = name;
        this.active = false;
        this.$el = el;
        this.$caret = this.$el.querySelector('.caret');
    }

    Player.prototype.render = function() {
        this.$el.className = this.name;
    }

    Player.prototype.reset = function(name){
        this.name = name;
        this.render(); 
    }

    Player.prototype.setActive = function(active) {
        this.active = !!active;
        this.$caret.hidden = !active;
    }

    Player.ramdon = function(exclude)  {
        var players = ['vue', 'react', 'angular'];
        if(exclude){
            players = players.filter(function(player){return player != exclude;})
        }
        return players[Math.floor(Math.random() * players.length)];
    }

    function Square(el) {
        this.$el = el;
        this.val = 0;
    }

    Square.prototype.set = function(name, val) {
        this.val = val;
        this.$el.classList.add(name);
    }

    Square.prototype.reset = function() {
        this.val = 0;
        this.$el.className = 'square';
    }

    function Game(el){
        this.$el = el;

        this.p1 = new Player(Player.ramdon(), document.querySelector('#p1'));
        this.p2 = new Player(Player.ramdon(this.p1.name), document.querySelector('#p2'));

        this.p1.render();
        this.p2.render();

        this.$start = this.$el.querySelector('.btn.start');
        this.$start.addEventListener('click', this.onClickStart.bind(this));
        this.$reset = this.$el.querySelector('.btn.reset');
        this.$reset.addEventListener('click', this.onClickReset.bind(this))
        this.$reset.disabled = true;

        this.$winner = this.$el.querySelector('.winner');
        this.$overlay = this.$el.querySelector('.overlay');

        this.$diceP1 = this.$el.querySelector('#dice-p1');
        this.$diceP2 = this.$el.querySelector('#dice-p2');

        var onClickDice = this.onClickDice.bind(this);
        this.$diceP1.addEventListener('click', onClickDice);
        this.$diceP2.addEventListener('click', onClickDice);

        var onClickSquare = this.onClickSquare.bind(this);
        var $squares = [].slice.call(this.$el.querySelectorAll('.square'));
        $squares.forEach(function(square){
            square.addEventListener('click', onClickSquare);
        })
        this.squares = $squares.map(function(square) {
            return new Square(square);
        })

        /*this.$diceP2.addEventListener('click', this.onClickDice('#p2').bind(this));*/
    }

    Game.prototype.onClickDice = function(e) {
        if (e.target.matches('#dice-p1')) this.p1.reset(Player.ramdon(this.p1.name));
        if (e.target.matches('#dice-p2')) this.p2.reset(Player.ramdon(this.p2.name));
        this.$start.disabled = (this.p1.name===this.p2.name);
    }

    Game.prototype.onClickStart = function(e) {
        this.state = 'start';
        this.setDiceHidden(true);
        this.p1.setActive(true);
        this.p2.setActive(false);
        this.$overlay.hidden = true;
        this.$start.hidden = true;
        this.$reset.disabled = false;
    }

    Game.prototype.resetSquares = function() {
        this.squares.forEach(function(square){
            square.reset();
        })
    }

    Game.prototype.onClickReset = function(e) {
        this.setDiceHidden(false);
        this.resetSquares();
        this.p1.setActive(false);
        this.p2.setActive(false);
        this.$winner.hidden = true;
        this.$winner.className = 'winner';
        this.$overlay.hidden = false;
        this.$start.hidden = false;
        this.$reset.disabled = true;
    }

    Game.prototype.setDiceHidden = function(e) {
        this.$diceP1.hidden = !!e;
        this.$diceP2.hidden = !!e;
    }

    Game.prototype.onClickSquare = function(e) {
        if(this.isEnded()) return;
        if(e.target.classList.length >= 2) return;
        this.squares[e.target.dataset.index].set(this.activePlayer().name, this.p1.active ? 1:-1);

        var winner = this.getWinner();
        if(winner) {
            this.showWinner(winner);
            return;
        }

        this.switchPlayer();
    }

    Game.prototype.showWinner = function(winner) {
        this.$overlay.classList.add('minimize');
        this.$overlay.hidden = false;
        this.$winner.hidden = false;
        this.$winner.classList.add(winner.name);
        var sef = this;
        setTimeout(function(){
            sef.$overlay.classList.remove('minimize');
        }, 500)
    }

    Game.prototype.activePlayer = function() {
        return this.p1.active ? this.p1 : this.p2;
    }

    Game.prototype.switchPlayer = function() {
        if(this.p1.active) {
            this.p1.setActive(false); 
            this.p2.setActive(true); 
        } else {
            this.p1.setActive(true); 
            this.p2.setActive(false); 
        }
    }

    Game.prototype.calcWinValues = function() {
        var wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        var result = [];
        for(var i=0; i < wins.length; i++) {
            var val = this.squares[wins[i][0]].val + this.squares[wins[i][1]].val + this.squares[wins[i][2]].val;

            result.push(val);
        }

        return result;
    }

    Game.prototype.isEnded = function() {
        return this.isAllSquareUsed() || !!this.getWinner();
    }

    Game.prototype.getWinner = function(){
        var values = this.calcWinValues();
        if(values.find(function(v) {
            return v === 3;
        }))
        return this.p1;
        if(values.find(function(v) {
            return v === -3;
        }))
        return this.p2;
    }

    Game.prototype.isAllSquareUsed = function(){
        return !this.squares.find(function(square) { return square.val === 0; });
    }

    document.addEventListener('DOMContentLoaded', function(){
        window.game = new Game(document.querySelector('.container'));
    });
})();