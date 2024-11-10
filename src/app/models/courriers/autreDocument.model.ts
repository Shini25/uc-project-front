import { Courrier } from "./courrier.model";
import { User_account } from "../user.model";

export enum AutreDocumentType {
    CALENDRIER_SOLDE_PENSION,
    REMARQUES_OBSERVATION,
    LETTRES_NOTE 
}

export class AutreDocument extends Courrier {
    type: AutreDocumentType;

    constructor(titre: string, contenue: string, typeDeContenue: string, user_account: User_account, type: AutreDocumentType) {
        super(titre, contenue, typeDeContenue, user_account);
        this.type = type;
    }
}