export class Type {
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
