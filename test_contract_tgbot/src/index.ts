import { Telegraf } from "telegraf";
import dotenv from "dotenv"
import { Address, address, beginCell, toNano, fromNano, ContractProvider } from "@ton/core";
import qs from "qs";
import { message } from "telegraf/filters";
import { getHttpEndpoint,Network } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";

require('dotenv').config()

async function networkEndpoint() {
  const endpoint = await getHttpEndpoint({
    network: process.env.NETWORK as Network
  });
  const client = new TonClient({
    endpoint: endpoint
  });
  return client;
}

const client = networkEndpoint()

const bot = new Telegraf(process.env.TG_BOT_TOKEN!);

bot.start((ctx) =>
  ctx. reply ("Welcome to our counter app!", {
    reply_markup: {
      keyboard: [
        ["Increment by 5"],
        ["Deposit 0.3 TON"],
        ["Withdraw 0.7 TON"],
        ["Get Contract Data"],
      ],
    },
  })
);

bot.on(message("web_app_data"), (ctx) => ctx.reply("ok"));

bot.hears("Get Contract Data", async (ctx) => {

  if (process.env.CONTRACT_ADDRESS) {
    const contractAddress = Address.parse(process.env.CONTRACT_ADDRESS);
    const contract_data  = await (await client).getBalance(contractAddress);
    ctx.reply(fromNano(contract_data.toString()))
  } else {
    console.error('CONTRACT_ADDRESS environment variable is not defined.');
  }

});


bot.hears("Increment by 5", (ctx) => {

  const msg_body = beginCell() 
  .storeUint(1, 32)
  .storeUint(5, 32)
  .endCell();

  let link = `https://app.tonkeeper.com/transfer/${process.env.CONTRACT_ADDRESS}?${qs.stringify(
      {
        text: "Simple test transaction",
        amount: toNano("0.05").toString(10),
        bin: msg_body.toBoc({ idx: false }).toString("base64"),
      }
  )}`;

  ctx.reply("To increment, please sign a transaction", {
    reply_markup: {
      inline_keyboard: [
        [{
          text: "Sign transaction",
          url: link
        }]
      ]
    }
  });

});

bot.hears("Deposit 0.3 TON", (ctx) => {
  const msg_body = beginCell().storeUint(2, 32).endCell();

  let link = `https://app.tonkeeper.com/transfer/${process.env.CONTRACT_ADDRESS}?${qs.stringify(
      {
        text: "Deposit 0.3 TON",
        amount: toNano("0.3").toString(10),
        bin: msg_body.toBoc({ idx: false}).toString("base64"),
      }
  )}`;

  ctx.reply("To deposit 0.3 TON please sign a transaction:", {
    reply_markup: {
      inline_keyboard: [
        [{
          text: "Sign transaction",
          url: link
        }]
      ]
    }
  });

});

bot.hears ("Withdraw 0.7 TON", (ctx) => {

  const msg_body = beginCell().storeUint(3, 32).storeCoins(toNano("0.7")).endCell();
  
  let link = `https://app.tonkeeper.com/transfer/${process.env.CONTRACT_ADDRESS}?${qs.stringify(
      {
        text: "Withdraw 0.7 TON",
        amount: toNano("0.05").toString(10),
        bin: msg_body.toBoc({ idx: false}).toString("base64"),
      }
  )}`;
      
  ctx.reply("To withdraw 0.7 TON please sign a transaction:", {
    reply_markup: {
      inline_keyboard: [
        [{
          text: "Sign transaction",
          url: link,
        }]
      ]
    }
  });

});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop ("SIGTERM"));