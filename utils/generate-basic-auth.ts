import { amrsUser } from '../conf/amrs-config';
import { AmrsUser } from '../interfaces/amrs-user';

export const GenerateBasicAuth = (): string =>{
    const amrsUser = GetUserCredentials();
    const authString = Buffer.from(`${amrsUser.username}:${amrsUser.password}`).toString('base64')
    return authString;
}

const GetUserCredentials = (): AmrsUser => {
    return amrsUser;
}