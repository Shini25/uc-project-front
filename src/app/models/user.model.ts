export class User_account {
    numero: string;
    password: string;
    email: string;
    verificationCode: string;
    accountStatus: string;
    accountType: string;
    accountState: string;

    constructor(
        numero: string,
        password: string,
        email: string,
        verificationCode: string,
        accountStatus: string,
        accountType: string,
        accountState: string
    ) {
        this.numero = numero;
        this.password = password;
        this.email = email;
        this.verificationCode = verificationCode;
        this.accountStatus = accountStatus;
        this.accountType = accountType;
        this.accountState = accountState;
    }
}