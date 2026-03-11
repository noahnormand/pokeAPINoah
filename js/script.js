const selectGen = document.querySelector("#select-gen"); // Attention si tu as 2 select, il vaut mieux utiliser l'ID : document.querySelector("#ton-id-gen")
const selectTri = document.querySelector("#tri-pokemon"); // Ajout du sélecteur pour le tri
const conteneurMain = document.querySelector("main");
const divBadges = document.querySelector("#types");

let listePokemons = [];
let typesSelectionnes = [];

const avoirCouleur = (type) => {
    const couleurs = {
        "Plante": "green", "Feu": "orange", "Eau": "blue", "Insecte": "lightgreen",
        "Normal": "lightgray", "Électrik": "yellow", "Poison": "purple", "Combat": "red",
        "Sol": "burlywood", "Roche": "darkkhaki", "Spectre": "indigo", "Acier": "silver",
        "Glace": "lightblue", "Dragon": "royalblue", "Fée": "pink", "Ténèbres": "darkslategray",
        "Psy": "hotpink", "Vol": "skyblue"
    };
    return couleurs[type] || "white";
};

const afficherLesPokemons = () => {
    // 1. Filtrage
    let pkmFiltres = listePokemons.filter(pokemon => {
        if (typesSelectionnes.length === 0) return true;
        let lesTypesDuPkm = pokemon.types.map(t => t.name);
        return typesSelectionnes.every(typeChoisi => lesTypesDuPkm.includes(typeChoisi));
    });

    // 2. Tri
    let critereTri = selectTri ? selectTri.value : "id";
    let pkmTries = pkmFiltres.sort((a, b) => {
        switch (critereTri) {
            case "nom":
                return a.name.fr.localeCompare(b.name.fr);
            case "type":
                return a.types[0].name.localeCompare(b.types[0].name);
            case "hp":
                return b.stats.hp - a.stats.hp; // Plus grand au plus petit
            case "atk":
                return b.stats.atk - a.stats.atk;
            case "def":
                return b.stats.def - a.stats.def;
            case "id":
            default:
                return a.pokedexId - b.pokedexId; // Plus petit au plus grand
        }
    });

    // 3. Affichage
    let cartesHtml = pkmTries.map(pokemon => {
        let type1 = pokemon.types[0].name;
        let couleur1 = avoirCouleur(type1);
        let styleFond = couleur1;

        if (pokemon.types.length > 1) {
            let type2 = pokemon.types[1].name;
            let couleur2 = avoirCouleur(type2);
            styleFond = `linear-gradient(to right, ${couleur1} 50%, ${couleur2} 50%)`;
        }

        let texteTypes = pokemon.types.map(t => t.name).join(" / ");

        return `
        <article style="background: ${styleFond}; border: 10px solid ${couleur1}">
            <figure>
                <picture>
                    <img alt="Image de ${pokemon.name.fr}" src="${pokemon.sprites.regular}"/>
                </picture>
                <figcaption>
                    <span class="types">${texteTypes}</span>
                    <h2>${pokemon.name.fr}</h2>
                    <ol>
                        <li>Points de vie : ${pokemon.stats.hp}</li>
                        <li>Attaque : ${pokemon.stats.atk}</li>
                        <li>Défense : ${pokemon.stats.def}</li>
                        <li>Attaque spéciale : ${pokemon.stats.spe_atk}</li>
                        <li>Vitesse : ${pokemon.stats.vit}</li>
                    </ol>
                </figcaption>
            </figure>
        </article>
        `;
    });

    conteneurMain.innerHTML = cartesHtml.join('');
};

const chargerApi = async (valeurGen) => {
    conteneurMain.innerHTML = "<p>Chargement...</p>";
    try {
        let lien = (valeurGen === "Tout")
            ? "https://tyradex.app/api/v1/pokemon"
            : `https://tyradex.app/api/v1/gen/${valeurGen}`;

        const reponse = await fetch(lien);
        if (!reponse.ok) throw new Error("Bug réseau");

        const dataJson = await reponse.json();

        listePokemons = dataJson.filter(p => p.types && p.types.length > 0);
        afficherLesPokemons();
    } catch (erreur) {
        conteneurMain.innerHTML = `<p style="color:red">Erreur : ${erreur.message}</p>`;
    }
};

// Écouteur pour la génération
selectGen.addEventListener("change", (event) => {
    if (event.target.value) {
        chargerApi(event.target.value);
    }
});

// Écouteur pour le nouveau système de tri
if (selectTri) {
    selectTri.addEventListener("change", () => {
        afficherLesPokemons(); // Relance l'affichage avec le nouveau tri
    });
}

const genererBadges = async () => {
    // ... (Reste inchangé) ...
    try {
        const reponseTypes = await fetch("https://tyradex.app/api/v1/types");
        if (!reponseTypes.ok) throw new Error("Impossible de recup les types");

        const dataTypes = await reponseTypes.json();

        if (!divBadges) return;
        divBadges.innerHTML = "";

        let btnReset = document.createElement("button");
        btnReset.classList.add("type-filter", "reset-btn", "active");
        btnReset.innerHTML = "<p>TOUT</p>";

        btnReset.addEventListener("click", () => {
            typesSelectionnes = [];
            document.querySelectorAll(".type-filter").forEach(b => b.classList.remove("active"));
            btnReset.classList.add("active");
            afficherLesPokemons();
        });

        divBadges.appendChild(btnReset);

        dataTypes.forEach(typeActuel => {
            let boutonBadge = document.createElement("button");
            boutonBadge.classList.add("type-filter");

            let imageType = document.createElement("img");
            imageType.src = typeActuel.sprites;
            imageType.alt = typeActuel.name.fr;
            imageType.title = typeActuel.name.fr;

            boutonBadge.appendChild(imageType);

            boutonBadge.addEventListener("click", () => {
                if (boutonBadge.classList.contains("active")) {
                    boutonBadge.classList.remove("active");
                    typesSelectionnes = typesSelectionnes.filter(t => t !== typeActuel.name.fr);
                } else {
                    if (typesSelectionnes.length >= 2) return;
                    btnReset.classList.remove("active");
                    boutonBadge.classList.add("active");
                    typesSelectionnes.push(typeActuel.name.fr);
                }

                if (typesSelectionnes.length === 0) {
                    btnReset.classList.add("active");
                }

                afficherLesPokemons();
            });

            divBadges.appendChild(boutonBadge);
        });
    } catch (erreurBadges) {
        console.error(erreurBadges.message);
    }
};

chargerApi("Tout");
genererBadges();