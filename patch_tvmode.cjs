const fs = require('fs');
let code = fs.readFileSync('src/pages/TVMode.tsx', 'utf8');

// Fix text logic
const oldTextLogic = `{['Enterprise', 'Personalizado'].includes(planType) ? (
              <>
                Escaneie o QR Code ao lado, gire a roleta e <strong className="text-yellow-400">ganhe brindes exclusivos!</strong>
              </>
            ) : (
              <>
                Gire a roleta no totem e <strong className="text-yellow-400">ganhe brindes exclusivos!</strong>
              </>
            )}`;

const newTextLogic = `              <>
                Escaneie o QR Code ao lado ou gire a roleta no totem e <strong className="text-yellow-400">ganhe brindes exclusivos!</strong>
              </>`;

code = code.replace(oldTextLogic, newTextLogic);

// Fix QR code rendering logic
const oldQRLogic = `{['Enterprise', 'Personalizado'].includes(planType) && (
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-500 border-8 border-white/50 backdrop-blur-sm relative z-20">
            <div className="absolute -top-6 bg-blue-600 text-white font-black px-8 py-2 rounded-full text-xl shadow-xl uppercase tracking-widest">
              Jogue Aqui
            </div>
            <QRCodeSVG value={rouletteUrl} size={300} level="H" includeMargin={false} />
            <p className="mt-8 text-gray-500 font-bold text-xl uppercase tracking-widest">Aponte a Câmera</p>
          </div>
        )}`;

const newQRLogic = `          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-500 border-8 border-white/50 backdrop-blur-sm relative z-20">
            <div className="absolute -top-6 bg-blue-600 text-white font-black px-8 py-2 rounded-full text-xl shadow-xl uppercase tracking-widest">
              Jogue Aqui
            </div>
            <QRCodeSVG value={rouletteUrl} size={300} level="H" includeMargin={false} />
            <p className="mt-8 text-gray-500 font-bold text-xl uppercase tracking-widest">Aponte a Câmera</p>
          </div>`;

code = code.replace(oldQRLogic, newQRLogic);

fs.writeFileSync('src/pages/TVMode.tsx', code);
