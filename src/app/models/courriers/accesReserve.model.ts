import { Courrier } from "./courrier.model";
import { User_account } from "../user.model";

export class TableauDeBord extends Courrier {
    accesReserveType: AccesReserveType;

    constructor(titre: string, contenue: string, typeDeContenue: string, user_account: User_account, type: AccesReserveType) {
        super(titre, contenue, typeDeContenue, user_account);
        this.accesReserveType = type;
    }
}

export enum AccesReserveType {
    TABLEAU_DE_BORD_EXECUTION_BUDGETAIRE,
}