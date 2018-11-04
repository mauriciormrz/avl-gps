//==========================
// Puertos
//==========================
process.env.WEB_PORT = process.env.WEB_PORT || 3000;
process.env.APP_PORT = process.env.APP_PORT || 7001;
process.env.RUPTELA_PORT = process.env.RUPTELA_PORT || 9000;
process.env.ENFORA_PORT = process.env.ENFORA_PORT || 8000;

process.env.UDP_HOST = process.env.UDP_HOST || '127.0.0.1';

//==========================
// Base de datos
//==========================
process.env.HOST_MYSQL = process.env.HOST || '31.220.55.60';
process.env.USER_MYSQL = process.env.USER_MYSQL || 'vigicar_user';
process.env.PASSWORD_MYSQL = process.env.PASSWORD_MYSQL || 'Vigic@r2017!';
process.env.DATABASE_MYSQL = process.env.DATABASE_MYSQL || 'vigicar_db';