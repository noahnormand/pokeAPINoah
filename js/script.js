class Type {
    constructor(data) {

        this.name = typeof data.name === "string" ? data.name : data.name.fr;
        this.image = data.sprites ?? data.image ?? null;
        this.color = this.getColorHexa();
    }

    getColorHexa() {
        const couleurs = {
            "Plante": "#78C850",
            "Feu": "#F08030",
            "Eau": "#6890F0",
            "Insecte": "#A8B820",
            "Normal": "#A8A878",
            "Électrik": "#F8D030",
            "Poison": "#A040A0",
            "Combat": "#C03028",
            "Sol": "#E0C068",
            "Roche": "#B8A038",
            "Spectre": "#705898",
            "Acier": "#B8B8D0",
            "Glace": "#98D8D8",
            "Dragon": "#7038F8",
            "Fée": "#EE99AC",
            "Ténèbres": "#705848",
            "Psy": "#F85888",
            "Vol": "#A890F0"
        };
        return couleurs[this.name] || "#FFFFFF";
    }
}


class Pokemon {
    constructor(data) {
        this.id = data.pokedexId;
        this.image = data.sprites.regular;
        this.name = data.name.fr;
        this.apiTypes = data.types;
        this.attack = data.stats.atk;
        this.defense = data.stats.def;
        this.special_attack = data.stats.spe_atk;
        this.speed = data.stats.vit;


        this.arrTypes = this.apiTypes.map(t => new Type(t));
    }

    displayCard() {
        const couleur1 = this.arrTypes[0].color;
        let styleFond = couleur1;

        if (this.arrTypes.length > 1) {
            const couleur2 = this.arrTypes[1].color;
            styleFond = `linear-gradient(to right, ${couleur1} 50%, ${couleur2} 50%)`;
        }

        const texteTypes = this.arrTypes.map(t => t.name).join(" / ");


        const article = document.createElement("article");
        article.style.background = styleFond;
        article.style.border = `10px solid ${couleur1}`;

        article.innerHTML = `
            <figure>
                <picture>
                    <img alt="Image de ${this.name}" src="${this.image}"/>
                </picture>
                <figcaption>
                    <span class="types">${texteTypes}</span>
                    <h2>${this.name}</h2>
                    <ol>
                        <li>Attaque : ${this.attack}</li>
                        <li>Défense : ${this.defense}</li>
                        <li>Atq. spéciale : ${this.special_attack}</li>
                        <li>Vitesse : ${this.speed}</li>
                    </ol>
                </figcaption>
            </figure>
        `;

        return article;
    }
}


const selectGen = document.querySelector("#select-gen");
const selectTri = document.querySelector("#tri-pokemon");
const conteneurMain = document.querySelector("main");
const divBadges = document.querySelector("#types");

let listePokemons = [];
let typesSelectionnes = [];

const afficherLesPokemons = () => {
    let pkmFiltres = listePokemons.filter(pokemon => {
        if (typesSelectionnes.length === 0) return true;
        const lesTypesDuPkm = pokemon.arrTypes.map(t => t.name);
        return typesSelectionnes.every(typeChoisi => lesTypesDuPkm.includes(typeChoisi));
    });

    let critereTri = selectTri ? selectTri.value : "id";
    let pkmTries = pkmFiltres.sort((a, b) => {
        switch (critereTri) {
            case "nom":
                return a.name.localeCompare(b.name);
            case "type":
                return a.arrTypes[0].name.localeCompare(b.arrTypes[0].name);
            case "atk":
                return b.attack - a.attack;
            case "def":
                return b.defense - a.defense;
            case "id":
            default:
                return a.id - b.id;
        }
    });

    conteneurMain.innerHTML = "";
    pkmTries.forEach(pokemon => {
        conteneurMain.appendChild(pokemon.displayCard());
    });
};


const chargerApi = async (valeurGen) => {
    conteneurMain.innerHTML = "<p>Chargement...</p>";
    const lien = (valeurGen === "Tout")
        ? "https://tyradex.app/api/v1/pokemon"
        : `https://tyradex.app/api/v1/gen/${valeurGen}`;

    const reponse = await fetch(lien);
    if (!reponse.ok) throw new Error("Bug réseau");

    const dataJson = await reponse.json();


    listePokemons = dataJson
        .filter(p => p.types && p.types.length > 0)
        .map(p => new Pokemon(p));

    afficherLesPokemons();
};


const genererBadges = async () => {
    const reponseTypes = await fetch("https://tyradex.app/api/v1/types");
    if (!reponseTypes.ok) throw new Error("Impossible de récupérer les types");

    const dataTypes = await reponseTypes.json();

    if (!divBadges) return;
    divBadges.innerHTML = "";


    const btnReset = document.createElement("button");
    btnReset.classList.add("type-filter", "reset-btn", "active");
    btnReset.innerHTML = "<p>TOUT</p>";

    btnReset.addEventListener("click", () => {
        typesSelectionnes = [];
        document.querySelectorAll(".type-filter").forEach(b => b.classList.remove("active"));
        btnReset.classList.add("active");
        afficherLesPokemons();
    });

    divBadges.appendChild(btnReset);

    // Badges pour chaque type
    dataTypes.forEach(typeActuel => {
        const type = new Type(typeActuel);
        const boutonBadge = document.createElement("button");
        boutonBadge.classList.add("type-filter");

        const imageType = document.createElement("img");
        imageType.src = type.image;
        imageType.alt = type.name;
        imageType.title = type.name;

        boutonBadge.appendChild(imageType);

        boutonBadge.addEventListener("click", () => {
            if (boutonBadge.classList.contains("active")) {
                boutonBadge.classList.remove("active");
                typesSelectionnes = typesSelectionnes.filter(t => t !== type.name);
            } else {
                if (typesSelectionnes.length >= 2) return;
                btnReset.classList.remove("active");
                boutonBadge.classList.add("active");
                typesSelectionnes.push(type.name);
            }

            if (typesSelectionnes.length === 0) {
                btnReset.classList.add("active");
            }

            afficherLesPokemons();
        });

        divBadges.appendChild(boutonBadge);
    });
};

if (selectGen) {
    selectGen.addEventListener("change", (event) => {
        if (event.target.value) chargerApi(event.target.value);
    });
}

if (selectTri) {
    selectTri.addEventListener("change", () => afficherLesPokemons());
}

chargerApi("Tout");
genererBadges();