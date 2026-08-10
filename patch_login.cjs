const fs = require('fs');

const pt = {
  login: {
    back: "Voltar para o site",
    title: "Acesse sua conta",
    subtitle: "Entre para gerenciar seus leads e eventos",
    email: "E-mail",
    email_ph: "seu@email.com",
    password: "Senha",
    password_ph: "Sua senha",
    submit: "Entrar no Painel",
    logging_in: "Entrando...",
    no_account: "Não tem uma conta?",
    register_link: "Cadastre-se",
    error_invalid: "E-mail ou senha incorretos.",
    error_generic: "Ocorreu um erro ao fazer login. Tente novamente."
  }
};

const en = {
  login: {
    back: "Back to website",
    title: "Access your account",
    subtitle: "Log in to manage your leads and events",
    email: "Email",
    email_ph: "your@email.com",
    password: "Password",
    password_ph: "Your password",
    submit: "Enter Dashboard",
    logging_in: "Logging in...",
    no_account: "Don't have an account?",
    register_link: "Sign up",
    error_invalid: "Incorrect email or password.",
    error_generic: "An error occurred while logging in. Please try again."
  }
};

const es = {
  login: {
    back: "Volver al sitio web",
    title: "Accede a tu cuenta",
    subtitle: "Inicia sesión para gestionar tus leads y eventos",
    email: "Correo",
    email_ph: "tu@correo.com",
    password: "Contraseña",
    password_ph: "Tu contraseña",
    submit: "Entrar al Panel",
    logging_in: "Entrando...",
    no_account: "¿No tienes una cuenta?",
    register_link: "Regístrate",
    error_invalid: "Correo o contraseña incorrectos.",
    error_generic: "Ocurrió un error al iniciar sesión. Inténtalo de nuevo."
  }
};

const i18nContent = fs.readFileSync('src/i18n.ts', 'utf-8');

let parts = i18nContent.split('en: {');
let ptPart = parts[0];
let en_esPart = parts[1].split('es: {');
let enPart = en_esPart[0];
let esPart = en_esPart[1];

ptPart = ptPart.replace(/dashboard: require\('\.\/update_dashboard_i18n\.cjs'\)\.pt\.dashboard/, "dashboard: require('./update_dashboard_i18n.cjs').pt.dashboard,\n      login: require('./patch_login.cjs').pt.login");
enPart = enPart.replace(/dashboard: require\('\.\/update_dashboard_i18n\.cjs'\)\.en\.dashboard/, "dashboard: require('./update_dashboard_i18n.cjs').en.dashboard,\n      login: require('./patch_login.cjs').en.login");
esPart = esPart.replace(/dashboard: require\('\.\/update_dashboard_i18n\.cjs'\)\.es\.dashboard/, "dashboard: require('./update_dashboard_i18n.cjs').es.dashboard,\n      login: require('./patch_login.cjs').es.login");

fs.writeFileSync('src/i18n.ts', ptPart + 'en: {' + enPart + 'es: {' + esPart);

let code = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

code = code.replace(/import \{ useState/, "import { useTranslation } from 'react-i18next';\nimport { useState");
code = code.replace(/export default function Login\(\) \{/, "export default function Login() {\n  const { t } = useTranslation();");

const r = (regex, replacement) => { code = code.replace(regex, replacement); };

r(/>Voltar para o site</g, ">{t('login.back')}<");
r(/>Acesse sua conta</g, ">{t('login.title')}<");
r(/>Entre para gerenciar seus leads e eventos</g, ">{t('login.subtitle')}<");
r(/>E-mail</g, ">{t('login.email')}<");
r(/placeholder="seu@email\.com"/g, "placeholder={t('login.email_ph')}");
r(/>Senha</g, ">{t('login.password')}<");
r(/placeholder="Sua senha"/g, "placeholder={t('login.password_ph')}");
r(/>Entrar no Painel</g, ">{t('login.submit')}<");
r(/>Entrando\.\.\.</g, ">{t('login.logging_in')}<");
r(/>Não tem uma conta\?</g, ">{t('login.no_account')}<");
r(/>Cadastre-se</g, ">{t('login.register_link')}<");

r(/setError\('E-mail ou senha incorretos\.'\)/, "setError(t('login.error_invalid'))");
r(/setError\('Ocorreu um erro ao fazer login. Tente novamente\.'\)/, "setError(t('login.error_generic'))");

fs.writeFileSync('src/pages/Login.tsx', code);

module.exports = { pt, en, es };
