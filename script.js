class Player {
    constructor(name) {
        this.name = name;
    }
}

class Recipe {
    constructor(name, country) {
        this.name = name;
        this.country = country;
    }
}

class Game {
    constructor(player, recipes) {
        this.player = player;
        this.recipes = recipes;
        this.selectedCategory = '';
        this.timerInterval = null;
        this.timeLeft = 30;
        this.correctOrders = 0;
        this.totalRecipes = 0;
    }

    startGame() {
        this.selectedCategory = document.getElementById('meal-category').value;
        if (this.player.name && this.selectedCategory) {
            document.getElementById('welcome-page').classList.remove('active');
            setTimeout(() => {
                document.getElementById('welcome-page').classList.add('hidden');
                document.getElementById('game-page').classList.remove('hidden');
                document.getElementById('game-page').classList.add('active');
                document.getElementById('player-name').innerText = `Player: ${this.player.name}`;
                document.getElementById('game-title').innerText = `Order the ${this.selectedCategory} recipes correctly!`;

                this.startTimer();
                this.displayRecipes();
            }, 500);
        } else {
            alert('Please enter your name and select a meal category.');
        }
    }

    startTimer() {
        this.timeLeft = 30;
        this.correctOrders = 0;
        document.getElementById('timer').innerText = `Time left: ${this.timeLeft}s`;

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').innerText = `Time left: ${this.timeLeft}s`;

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.endGame();
            }
        }, 1000);
    }

    displayRecipes() {
        const recipesContainer = document.getElementById('recipes-container');
        recipesContainer.innerHTML = '';

        const selectedRecipes = this.recipes[this.selectedCategory];
        this.totalRecipes = selectedRecipes.length;

        selectedRecipes.forEach((recipe, index) => {
            const recipeDiv = document.createElement('div');
            recipeDiv.innerText = recipe;
            recipeDiv.setAttribute('data-index', index);
            recipeDiv.setAttribute('draggable', true);

            recipeDiv.addEventListener('dragstart', this.dragStart);
            recipeDiv.addEventListener('dragover', this.dragOver);
            recipeDiv.addEventListener('drop', this.drop.bind(this));

            recipesContainer.appendChild(recipeDiv);
        });
    }

    dragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.index);
    }

    dragOver(event) {
        event.preventDefault();
    }

    drop(event) {
        event.preventDefault();

        const draggedIndex = event.dataTransfer.getData('text/plain');
        const targetIndex = event.target.dataset.index;

        if (draggedIndex !== targetIndex) {
            const recipesContainer = document.getElementById('recipes-container');
            const draggedElement = recipesContainer.querySelector(`[data-index="${draggedIndex}"]`);
            const targetElement = recipesContainer.querySelector(`[data-index="${targetIndex}"]`);

            recipesContainer.insertBefore(draggedElement, targetElement.nextSibling);

            [draggedElement.dataset.index, targetElement.dataset.index] = [targetElement.dataset.index, draggedElement.dataset.index];

            this.checkOrder();
        }
    }

    checkOrder() {
        const currentOrder = Array.from(document.querySelectorAll('#recipes-container div'))
            .map(div => div.innerText);

        const correctOrder = this.recipes[this.selectedCategory];

        this.correctOrders = currentOrder.reduce((count, recipe, index) => {
            return recipe === correctOrder[index] ? count + 1 : count;
        }, 0);

        if (this.correctOrders === this.totalRecipes) {
            clearInterval(this.timerInterval);
            this.endGame(true);
        }
    }

    endGame(isCompleted = false) {
        document.getElementById('game-page').classList.remove('active');
        setTimeout(() => {
            document.getElementById('game-page').classList.add('hidden');
            document.getElementById('score-page').classList.remove('hidden');
            document.getElementById('score-page').classList.add('active');

            let score = (this.correctOrders / this.totalRecipes) * 100;

            if (isCompleted) {
                const timeBonus = (this.timeLeft / 30) * 100;
                score += timeBonus;
            }

            document.getElementById('score').innerText = `You scored ${score.toFixed(2)}%!`;
        }, 500);
    }

    restartGame() {
        document.getElementById('score-page').classList.remove('active');
        setTimeout(() => {
            document.getElementById('score-page').classList.add('hidden');
            document.getElementById('game-page').classList.remove('hidden');
            document.getElementById('game-page').classList.add('active');
            this.startTimer();
            this.displayRecipes();
        }, 500);
    }

    goHome() {
        document.getElementById('score-page').classList.remove('active');
        setTimeout(() => {
            document.getElementById('score-page').classList.add('hidden');
            document.getElementById('welcome-page').classList.remove('hidden');
            document.getElementById('welcome-page').classList.add('active');
        }, 500);
    }

    addRecipe(recipe) {
        if (!this.recipes[recipe.country]) {
            this.recipes[recipe.country] = [];
        }
        this.recipes[recipe.country].push(recipe.name);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const player = new Player('');
    const game = new Game(player, {
        italian: ['Pasta', 'Pizza', 'Lasagna'],
        mexican: ['Tacos', 'Burrito', 'Enchiladas'],
        japanese: ['Sushi', 'Ramen', 'Tempura'],
        indian: ['Biryani', 'Butter Chicken', 'Naan']
    });

    document.getElementById('start-game-btn').addEventListener('click', () => {
        player.name = document.getElementById('username').value;
        game.startGame();
    });

    document.getElementById('restart-game-btn').addEventListener('click', () => {
        game.restartGame();
    });

    document.getElementById('go-home-btn').addEventListener('click', () => {
        game.goHome();
    });

    document.getElementById('add-recipe-btn').addEventListener('click', () => {
        const newRecipeName = document.getElementById('new-recipe-name').value;
        const newRecipeCountry = document.getElementById('new-recipe-country').value;

        if (newRecipeName && newRecipeCountry) {
            const newRecipe = new Recipe(newRecipeName, newRecipeCountry);
            game.addRecipe(newRecipe);

            alert(`Added ${newRecipeName} to ${newRecipeCountry} recipes.`);
        } else {
            alert('Please enter both a recipe name and country.');
        }
    });
});
