import WebSocket from 'ws';

export async function dex(config) {
  return new Promise((resolve, reject) => {
    const socketUrl = `wss://io.dexscreener.com/dex/screener/pairs/h24/1?rankBy[key]=trendingScoreH6&rankBy[order]=desc&filters[chainIds][0]=${config.chain}`;
    const header = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.183'
    };

    const ws = new WebSocket(socketUrl, {
      headers: header,
      origin: 'https://dexscreener.com'
    });

    ws.on('message', (data) => {
      const parsedMessage = JSON.parse(data);
      // console.log('msg:', parsedMessage);
      if (parsedMessage.pairs) {
        // console.log(parsedMessage.pairs);
        // Filter desired properties from first 10 items
        const filteredPairs = parsedMessage.pairs.slice(0, 10).map(item => ({
          pairAddress: item.pairAddress,
          baseTokenSymbol: item.baseToken.symbol,
          marketCap: item.marketCap,
          volumeH24: item.volume.h24,
          priceChangeH6: item.priceChange.h6,
          chainId: item.chainId
        }));
        ws.close();
        // resolve(parsedMessage.pairs);
        resolve(filteredPairs);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      reject(error);
    });
  });
}