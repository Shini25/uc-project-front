import { ParticipantOrganizerDTO } from "./participantOrganizerDTO.model";

export interface InfoMeetingBase {
    id?: any;
    meetingDate: any;
    location: string;
    objet: string;
    meetingType: string;
    dateCreation?: any;
    ModificationDate?: any;
    logistics: string[];
    organizersMail: ParticipantOrganizerDTO[];
    participantsMail: ParticipantOrganizerDTO[];
    observations: string[];
    attendanceSheet: string;
    fileType?: any;
    addby?: string;
    modifyby?: string;
    reminder?: boolean;
    reminderDate?: any;
    reminderaddby?: string;

}