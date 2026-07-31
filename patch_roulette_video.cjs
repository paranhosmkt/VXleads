const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

const videoOverlay = `
      {isPlayingVideo && videoUrl && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
            <iframe 
              className="w-full h-full max-w-5xl aspect-video"
              src={\`https://www.youtube.com/embed/\${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}?autoplay=1&controls=0&showinfo=0&rel=0\`} 
              frameBorder="0" 
              allow="autoplay; encrypted-media" 
              allowFullScreen
              onLoad={() => {
                // Since we can't reliably detect YouTube end without API, just wait 10 seconds
                setTimeout(() => {
                  setIsPlayingVideo(false);
                  setVideoEnded(true);
                  spin();
                }, 10000);
              }}
            ></iframe>
          ) : (
            <video 
              autoPlay 
              className="w-full h-full max-w-5xl object-contain"
              onEnded={() => {
                setIsPlayingVideo(false);
                setVideoEnded(true);
                spin();
              }}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
          
          <button 
            onClick={() => {
              setIsPlayingVideo(false);
              setVideoEnded(true);
              spin();
            }}
            className="absolute top-8 right-8 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full backdrop-blur-md transition-colors"
          >
            Pular
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 relative z-10 w-full md:w-1/2">`;

code = code.replace(
  '<div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 relative z-10 w-full md:w-1/2">',
  videoOverlay
);

fs.writeFileSync('src/pages/Roulette.tsx', code);
