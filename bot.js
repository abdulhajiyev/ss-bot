import 'dotenv/config'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { Markup } from 'telegraf'
import { ssChart } from './functions/ssChart.js';
import { dex } from './functions/dex.js';
import fs from 'fs';
import { table, getBorderCharacters } from 'table';
import { ssPair } from './functions/ssPair.js';

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome'))

const intervals = {
  '1 Min': '1',
  '3 Min': '3',
  '5 Min': '5',
  '15 Min': '15',
  '30 Min': '30',
  '45 Min': '45',
  '1 Hour': '60',
  '2 Hour': '120',
  '3 Hour': '180',
  '4 Hour': '240',
  '1 Day': 'D',
  '1 Week': 'W',
  '1 Month': 'M'
};

let userSelections = {};

bot.command('chart', (ctx) => {
  const input = ctx.message.text;
  const [, symbol = ''] = input.split(" ");

  if (!symbol) {
    return ctx.sendMessage('Please provide a _*symbol*_\\. Use the correct format: *_/chart AVAXUSDT_*', { parse_mode: 'MarkdownV2' });
  }

  const buttons = Object.keys(intervals).map(interval => Markup.button.callback(interval, `chart:${symbol.toUpperCase()}:${interval}`));

  userSelections[ctx.from.id] = null;

  return ctx.reply('Please select an interval:', Markup.inlineKeyboard(buttons, { columns: 4 }), { reply_to_message_id: ctx.message.message_id });
});

bot.action(/chart:(.+):(.+)/, async (ctx) => {
  if (userSelections[ctx.from.id]) {
    return;
  }

  userSelections[ctx.from.id] = ctx.match[0];

  await ctx.deleteMessage();
  const [, symbol, interval] = ctx.match;

  const intervalValue = intervals[interval];

  await ctx.sendChatAction('upload_photo');
  const url = await ssChart(symbol, intervalValue);

  await ctx.replyWithPhoto({ source: 'chart.png' }, {
    caption: url,
    parse_mode: 'Markdown'
  });
});

bot.command('dex', (ctx) => {
  const input = ctx.message.text;
  const [, coinInput = ''] = input.split(" ");

  const coinToChainMap = {
    'avax': 'avalanche',
    'eth': 'ethereum',
    'sol': 'solana',
    'arb': 'arbitrum',
    'matic': 'polygon',
  };

  const chain = coinToChainMap[coinInput];

  if (!chain) {
    ctx.reply('Invalid input. Coin must be "avax", "eth", "sol", "arb" or "matic"');
    return;
  }

  function formatNumber(num) {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toString();
  }

  dex(chain).then(async (output) => {
    if (!output) {
      console.error('Error: output from dex(config) is undefined');
      return;
    }

    const tableData = output.map(item => [
      item.baseTokenSymbol,
      formatNumber(item.marketCap),
      formatNumber(item.volumeH24),
      item.priceChangeH6
    ]);

    tableData.unshift(['Symbol', 'MCap', 'Vol24h', '6h']);
    const config = {
      border: getBorderCharacters('ramac'),
    };

    const data = table(tableData, config);

    const markdownTable = '```\n' + data + '\n```';
    await ctx.replyWithMarkdownV2(markdownTable);

    const buttons = output.map(item => Markup.button.callback(item.baseTokenSymbol, `symbol:${item.pairAddress}:${item.chainId}`));
    ctx.reply('Select symbol:', Markup.inlineKeyboard(buttons, { columns: 4 }));
  });
});

bot.action(/symbol:(.+):(.+)/, async (ctx) => {
  await ctx.deleteMessage();
  const [, pairAddress, chainId] = ctx.match;
  const result = await ssPair(pairAddress, chainId);
  await ctx.replyWithPhoto({ source: 'screenshot.png' }, {
    caption: `[${result.legendSourceTitle}](${result.swapLink})`,
    parse_mode: 'Markdown'
  });
});

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

