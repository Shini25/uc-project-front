import { Courrier } from "./courrier.model";
import { User_account } from "../user.model";

export enum ActiviteType {
    REFORMES,
    HEBDOMADAIRE,
    MENSUELLE,
    TRIMESTRIELLE,
    SEMESTRIELLE
}

export class Activite extends Courrier {
    type: ActiviteType;

    constructor(titre: string, contenue: string, typeDeContenue: string, user_account: User_account, type: ActiviteType) {
        super(titre, contenue, typeDeContenue, user_account);
        this.type = type;
    }
}
