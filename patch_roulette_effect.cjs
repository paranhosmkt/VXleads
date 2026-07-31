const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

code = code.replace(
  "const spin = () => {",
  `  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlayingVideo && (videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be'))) {
      timeout = setTimeout(() => {
        setIsPlayingVideo(false);
        setVideoEnded(true);
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [isPlayingVideo, videoUrl]);

  useEffect(() => {
    if (videoEnded && !isSpinning && !selectedPrize && !showForm) {
      // Auto trigger spin when video ends
      spin();
    }
  }, [videoEnded]);

  const spin = () => {`
);

code = code.replace(
  "onLoad={() => {\n                // Since we can't reliably detect YouTube end without API, just wait 10 seconds\n                setTimeout(() => {\n                  setIsPlayingVideo(false);\n                  setVideoEnded(true);\n                  spin();\n                }, 10000);\n              }}",
  ""
);

code = code.replace(
  "onEnded={() => {\n                setIsPlayingVideo(false);\n                setVideoEnded(true);\n                spin();\n              }}",
  "onEnded={() => {\n                setIsPlayingVideo(false);\n                setVideoEnded(true);\n              }}"
);

code = code.replace(
  "onClick={() => {\n              setIsPlayingVideo(false);\n              setVideoEnded(true);\n              spin();\n            }}",
  "onClick={() => {\n              setIsPlayingVideo(false);\n              setVideoEnded(true);\n            }}"
);


fs.writeFileSync('src/pages/Roulette.tsx', code);
