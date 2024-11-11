const apiKey = "ed4db148a77f4bf78fd11ea6d3a211be";

async function fetchSuggestions() {
    const query = document.getElementById("query").value;
    const suggestionContainer = document.getElementById("suggestions-container");

    if(query.length === 0) {
        suggestionContainer.innerHTML = "";
        return;
    }

    try {
        const responce = await fetch(
            `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}`
        );
        const data = await responce.json();

        if(data.results.length > 0) {
            suggestionContainer.innerHTML = data.results.map((recipe) => { 
                return `<div class="suggestion-item" onclick="selectSuggestion('${recipe.title}')">${recipe.title}</div>`;
            })
            .join("");
        } else {
            suggestionContainer.innerHTML = "<div>No suggestions found</div>";
        }
    }
    catch(error) {
        console.log("Error fetching suggestions:", error);
    }
}

function selectSuggestion(recipeTitle) {
    document.getElementById("query").value = recipeTitle;
    document.getElementById("suggestions-container").innerHTML = "";
    searchRecipes();
}

async function searchRecipes() {
    const searchQuery = document.getElementById("query").value;
    try {
        const results = await fetch(
            `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${searchQuery}`
        );
        const data = await results.json();
        const recipeList = document.getElementById("results");
        recipeList.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            recipeList.innerHTML = "No recipes found";
        } else {
            data.results.forEach(recipe => {
                const recipeItem = document.createElement("div");
                recipeItem.className = "recipe-item";
                const recipeTitle = document.createElement("h3");
                recipeTitle.textContent = recipe.title;
                const recipeImage = document.createElement("img");
                recipeImage.src = recipe.image;
                recipeImage.alt = recipe.title;
                const recipeLink = document.createElement("a");
                recipeLink.href = "#";
                recipeLink.textContent = "View Recipe";
                recipeLink.onclick = async function() {
                    await showRecipeDetails(recipe.id);
                };

                const favoriteIcon = document.createElement("i");
                favoriteIcon.className = "fas fa-heart favorite-icon";
                favoriteIcon.onclick = function() {
                    addToFavorites(recipe.id); 
                };

                recipeItem.appendChild(recipeImage);
                recipeItem.appendChild(recipeTitle);
                recipeItem.appendChild(recipeLink);
                recipeItem.appendChild(favoriteIcon); 
                recipeList.appendChild(recipeItem);
            });
        }
    } catch (error) {
        console.error("Error fetching recipes: ", error); 
    }
}

function addToFavorites(recipeId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.includes(recipeId)) {
        favorites.push(recipeId);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert("Recipe added to favorites!");
        loadFavorites(); 
    } else {
        alert("Recipe is already in favorites.");
    }
}

async function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = ""; 

    if (favorites.length === 0) {
        favoritesList.innerHTML = "No favorite recipes yet.";
    } else {
        for (let recipeId of favorites) {
            const results = await fetch(
                `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
            );
            const recipeData = await results.json();
            const recipeItem = document.createElement("div");
            recipeItem.className = "recipe-item";
            const recipeTitle = document.createElement("h3");
            recipeTitle.textContent = recipeData.title;
            const recipeImage = document.createElement("img");
            recipeImage.src = recipeData.image;
            recipeImage.alt = recipeData.title;
            recipeItem.appendChild(recipeImage);
            recipeItem.appendChild(recipeTitle);
            favoritesList.appendChild(recipeItem);
        }
    }
}


async function showRecipeDetails(recipeId) {
    const recipeDetailsDiv = document.getElementById("recipe-details");
    const recipeContentDiv = document.getElementById("recipe-content");

    try{
        const results = await fetch(
            `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
        );
        const recipeData = await results.json();

        const summary = recipeData.summary;
        function extractNutritionalInfo(summary) {
            // Регулярные выражения для поиска питательных веществ
            const nutritionRegex = /(\d+)\s*(calories|g of protein|g of fat|g)/gi;
        
            const nutrients = {
                calories: '',
                protein: '',
                fat: ''
            };
        
            // Ищем все упоминания питательных веществ
            let matches;
            while ((matches = nutritionRegex.exec(summary)) !== null) {
                const value = matches[1];
                const type = matches[2].toLowerCase();
        
                // Присваиваем значение в нужное поле
                if (type.includes('calories')) {
                    nutrients.calories = value;
                } else if (type.includes('protein')) {
                    nutrients.protein = value;
                } else if (type.includes('fat')) {
                    nutrients.fat = value;
                }
            }
        
            return nutrients;
        }
        const nutritionalInfo = extractNutritionalInfo(summary);

        recipeContentDiv.innerHTML = `
            <h2>${recipeData.title}</h2>
            <img src="${recipeData.image}" alt="${recipeData.title}">
            <p><strong>Ingredients:</strong> ${recipeData.extendedIngredients.map(
                    ingredient => ingredient.original
                ).join(', ')}</p>
            <p><strong>Instructions:</string> ${recipeData.instructions}</p>
            <p><strong>Nutritional information:</strong> Calories: ${nutritionalInfo.calories}, Protein: ${nutritionalInfo.protein}g, Fat: ${nutritionalInfo.fat}</p>
        `;
        recipeDetailsDiv.style.display = "flex";
    } catch(error) {
        console.error("Error fetching recipe details: " , error);

    }


}

function closeRecipeDetails() {
    const recipeDetailsDiv = document.getElementById("recipe-details");
    recipeDetailsDiv.style.display = "none";
}

document.querySelector("#query").addEventListener("keyup", function(event) {
    if (event.key == "Enter") {
        searchRecipes();
    }
});

window.onload = loadFavorites; // Загружаем избранные рецепты при загрузке страницы