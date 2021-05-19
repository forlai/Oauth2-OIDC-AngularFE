export interface ILoginService {

    signInWithAuthority(): Promise<void>;
    logout(): Promise<any>;

}