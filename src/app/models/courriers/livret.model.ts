import { Courrier } from "./courrier.model";
import { User_account } from "../user.model";
export enum LivretType {
  GUIDE_AU_USAGERS,
  CIRCUIT_DE_TRAITEMENT,
  MANUELS_DE_PROCEDURES,
  CODES_DE_LA_SOLDE,
  SGAP
}

export class Livret extends Courrier {
    type: LivretType;

    constructor(titre: string, contenue: string, typeContenue: string, user_account: User_account, type: LivretType) {
        super(titre, contenue, typeContenue, user_account);
        this.type = type;
    }
}