import { Courrier } from "./courrier.model";
import { User_account } from "../user.model";

export enum TexteType {
    TEXTES_LEGISLATIF
}

export class Texte extends Courrier {
    type: TexteType;

    constructor(titre: string, contenue: string, typeDeContenue: string, type: TexteType, user_account: User_account) {
        super(titre, contenue, typeDeContenue, user_account);
        this.type = type;
    }
}