const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000',
  'https://i.ibb.co/bR8FfZKG/1.png'
);

code = code.replace(
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000',
  'https://i.ibb.co/bR5HNqTB/2.png'
);

code = code.replace(
  'https://images.unsplash.com/photo-1628126235206-5260b9ea6441?auto=format&fit=crop&q=80&w=1000',
  'https://i.ibb.co/ccPm3YRt/3.png'
);

code = code.replace(
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1000',
  'https://i.ibb.co/848TH62h/4.png'
);

code = code.replace(
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
  'https://i.ibb.co/GQvSchKL/5.png'
);

fs.writeFileSync('src/pages/Landing.tsx', code);
