const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `      const { plan, cycle, consultantStripeAccountId } = req.body;`;
const replacement = `      const { plan, cycle, consultantStripeAccountId, email, uid } = req.body;`;
code = code.replace(target, replacement);

const target2 = `      let sessionConfig: any = {
        payment_method_types: ['card'],
        success_url: \`http://\${req.headers.host}/dashboard?session_id={CHECKOUT_SESSION_ID}\`,
        cancel_url: \`http://\${req.headers.host}/cadastro\`,
      };`;
const replacement2 = `      let sessionConfig: any = {
        payment_method_types: ['card'],
        success_url: \`https://\${req.headers.host}/dashboard?session_id={CHECKOUT_SESSION_ID}\`,
        cancel_url: \`https://\${req.headers.host}/cadastro\`,
        customer_email: email,
        client_reference_id: uid,
      };`;
code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts again");
