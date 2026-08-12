const fs = require('fs');

const keys = [
  "chatbot.title", "dashboard.access_token", "dashboard.captured_leads", "dashboard.close",
  "dashboard.contact", "dashboard.control_panel", "dashboard.date", "dashboard.edit_lead",
  "dashboard.email", "dashboard.endpoint", "dashboard.experience", "dashboard.game_qrcode",
  "dashboard.gifts", "dashboard.gifts_available", "dashboard.gifts_delivered", "dashboard.gift_status",
  "dashboard.gift_status_desc", "dashboard.inactive_desc", "dashboard.inactive_plan",
  "dashboard.mark_pending", "dashboard.name", "dashboard.open_game", "dashboard.pending_gifts",
  "dashboard.pending_payment", "dashboard.phone", "dashboard.prize", "dashboard.prize_status",
  "dashboard.qrcode", "dashboard.redeemed", "dashboard.tablet_desc", "dashboard.tablet_link",
  "dashboard.time", "dashboard.total_leads", "dashboard.welcome_prize", "demo.already_won",
  "demo.already_won_desc", "demo.roulette_desc", "demo.roulette_title", "demo.scratch_desc",
  "demo.scratch_instruction", "demo.scratch_title", "demo.slot_desc", "demo.slot_title",
  "demo.subtitle", "demo.title", "demo.won_desc", "demo.won_title", "footer.contact",
  "footer.contact_email", "footer.design_agency", "footer.design_by", "footer.legal",
  "footer.social", "hero.subtitle", "hero.title1", "hero.title2", "hero.title3",
  "landing.conversion.p1", "landing.conversion.p2", "landing.conversion.source",
  "landing.conversion.title1", "landing.conversion.title2", "landing.faq.a1",
  "landing.faq.a2", "landing.faq.a3", "landing.faq.a4", "landing.faq.a5", "landing.faq.a6",
  "landing.faq.q1", "landing.faq.q2", "landing.faq.q3", "landing.faq.q4", "landing.faq.q5",
  "landing.faq.q6", "landing.faq.title", "landing.features.f1_title", "landing.features.f2_title",
  "landing.features.f3_title", "landing.features.f4_title", "landing.features.title",
  "landing.how_it_works.e1_desc", "landing.how_it_works.e1_title", "landing.how_it_works.e2_desc",
  "landing.how_it_works.e2_title", "landing.how_it_works.e3_desc", "landing.how_it_works.e3_title",
  "landing.how_it_works.e4_desc", "landing.how_it_works.e4_title", "landing.how_it_works.e5_desc",
  "landing.how_it_works.e5_title", "landing.how_it_works.exhibitor_title", "landing.how_it_works.title",
  "landing.how_it_works.v1_title", "landing.how_it_works.v2_title", "landing.how_it_works.v3_title",
  "landing.how_it_works.visitor_title", "landing.integration_note", "landing.integration_title",
  "landing.partners.b1", "landing.partners.b2", "landing.partners.b3", "landing.partners.tag",
  "landing.partners.title", "landing.problem_solution.p1_desc", "landing.problem_solution.p1_title",
  "landing.problem_solution.p2_desc", "landing.problem_solution.p2_title", "landing.problem_solution.p3_desc",
  "landing.problem_solution.p3_title", "landing.problem_solution.problems_title",
  "landing.problem_solution.s1_desc", "landing.problem_solution.s1_title",
  "landing.problem_solution.s2_desc", "landing.problem_solution.s2_title",
  "landing.problem_solution.s3_desc", "landing.problem_solution.s3_title",
  "landing.problem_solution.solutions_title", "landing.problem_solution.title", "login.back",
  "login.email_ph", "login.error_invalid", "login.subtitle", "login.title", "nav.login",
  "pricing.custom.desc", "pricing.custom.name", "pricing.custom.price", "pricing.enterprise.desc",
  "pricing.enterprise.leads", "pricing.enterprise.leads_annual", "pricing.enterprise.name",
  "pricing.features.crm", "pricing.features.csv", "pricing.features.custom_interface",
  "pricing.features.custom_leads", "pricing.features.full_integrations", "pricing.features.offline",
  "pricing.features.stock", "pricing.features.support_247", "pricing.features.support_dedicated",
  "pricing.features.support_whatsapp", "pricing.features.unlimited_devices", "pricing.pro.desc",
  "pricing.pro.leads", "pricing.pro.leads_annual", "pricing.pro.name", "pricing.starter.desc",
  "pricing.starter.leads", "pricing.starter.leads_annual", "pricing.starter.name",
  "pricing.title", "register2.back", "register2.back_to_plans", "register2.choose_plan",
  "register2.create_account", "register2.custom", "register2.custom_desc", "register2.enterprise_desc",
  "register2.ie", "register2.logo_optional", "register2.most_popular", "register2.on_request",
  "register2.prize_guaranteed", "register2.pro_desc", "register2.starter_desc", "register.bairro",
  "register.bairro_ph", "register.cep", "register.cep_ph", "register.cidade", "register.cidade_ph",
  "register.cnpj", "register.cnpj_ph", "register.complemento", "register.complemento_ph",
  "register.error_in_use", "register.error_pass_match", "register.error_weak", "register.estado",
  "register.estado_ph", "register.logradouro", "register.logradouro_ph", "register.numero",
  "register.numero_ph", "register.phone_ph", "register.razao_ph", "register.razao_social",
  "register.success_contact", "register.terms_link", "register.terms_prefix"
];

const i18n = fs.readFileSync('src/i18n.ts', 'utf-8');

const missing = [];
for (const key of keys) {
  const lastPart = key.split('.').pop();
  if (!i18n.includes(`"${lastPart}"`) && !i18n.includes(`'${lastPart}'`)) {
    missing.push(key);
  }
}

if (missing.length > 0) {
  console.log("Possibly missing keys:", missing);
} else {
  console.log("All keys found!");
}
