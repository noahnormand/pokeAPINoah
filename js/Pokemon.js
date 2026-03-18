import { Type } from "./Type.js";

export class Pokemon {
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
