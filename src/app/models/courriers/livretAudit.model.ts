export interface LivretAudit {
    idAuditLivret: number;
    idCourrier: number;
    titre: string;
    dateInsertion: Date;
    contenue: string;
    typeContenue: string;
    userId: string;
    type: string;
    auditTimestamp: Date;
    modifiedBy: string;
}