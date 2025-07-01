import { Control } from 'angular2/common';

export class EmailValidator {

    private static EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    static validate(control: Control): {[key: string]: boolean} {
        if(EmailValidator.EMAIL_REGEX.test(control.value)){
            return null;
        }
        return { 'email': true };
    }
}