export const ALLOWED_USERS = [
    'José Francisco Molina Sánchez',
    'Marta Fernández Lence',
    'Maria Angeles Cobo',
    'Ricardo Lopez Fernández',
    'Maria José Flores Torres'
] as const;

export type AllowedUser = typeof ALLOWED_USERS[number];
