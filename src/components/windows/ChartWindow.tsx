import React from 'react';

export const ChartWindow: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#0d0d0d]">
      <style>{`
        #dexscreener-embed {
          position: relative;
          width: 100%;
          padding-bottom: 125%;
        }
        @media(min-width:1400px) {
          #dexscreener-embed {
            padding-bottom: 65%;
          }
        }
        #dexscreener-embed iframe {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border: 0;
        }
      `}</style>
      <div id="dexscreener-embed">
        <iframe
          src="https://dexscreener.com/solana/2uF4Xh61rDwxnG9woyxsVQP7zuA6kLFpb3NvnRQeoiSd?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15"
          title="DexScreener Chart"
        />
      </div>
    </div>
  );
};
