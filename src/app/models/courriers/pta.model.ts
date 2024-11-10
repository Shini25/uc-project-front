import { Courrier } from "./courrier.model";
import { User_account } from "../user.model";

export class Pta extends Courrier {

    type!: string;
    sousType!: string;
    valide: boolean;
    constructor(titre: string, contenue: string, typeDeContenue: string, user_account: User_account, type: string, sousType: string ,valide: boolean) {
        super(titre, contenue, typeDeContenue, user_account);
        this.type = type;
        this.sousType = sousType;
        this.valide = valide;
    }
}
