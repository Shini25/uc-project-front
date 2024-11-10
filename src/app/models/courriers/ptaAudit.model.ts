export interface PtaAudit {
    idAudit: number;
    idCourrier: number;
    titre: string;
    dateInsertion: Date;
    contenue: string;
    typeContenue: string;
    userId: string;
    type: string;
    valide: boolean;
    sousType: string;
    auditTimestamp: Date;
    modifiedBy: string;
}