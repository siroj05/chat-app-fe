export type LoginReq = {
    username: string;
    password: string;
    turnstileToken: string;
}

export type LoginRes = {
    id : string;
    username: string;
    created_at: string;
}

