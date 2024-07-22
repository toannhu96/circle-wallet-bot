import forge from "node-forge";
import axios from "axios";
import { uuidv7 } from "uuidv7";

enum CHAIN {
  ETH = "ETH-SEPOLIA",
  MATIC = "MATIC-AMOY",
  SOL = "SOL-DEVNET",
}

const generateEntitySecretCipherText = (): string => {
  const entitySecret = forge.util.hexToBytes(process.env.ENTITY_SECRET);

  const publicKey = forge.pki.publicKeyFromPem(Buffer.from(process.env.PUBLIC_KEY, "base64").toString("ascii"));

  const encryptedData = publicKey.encrypt(entitySecret, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha256.create() },
  });

  return forge.util.encode64(encryptedData);
};

export const createWalletSet = async (name: string) => {
  const options = {
    method: "POST",
    url: "https://api.circle.com/v1/w3s/developer/walletSets",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
    },
    data: {
      idempotencyKey: uuidv7(),
      entitySecretCipherText: generateEntitySecretCipherText(),
      name,
    },
  };

  return await axios
    .request(options)
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
    });
};

export const createWallet = async (walletSetId: string, chains: CHAIN[]) => {
  const options = {
    method: "POST",
    url: "https://api.circle.com/v1/w3s/developer/wallets",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
    },
    data: {
      idempotencyKey: uuidv7(),
      entitySecretCipherText: generateEntitySecretCipherText(),
      blockchains: chains,
      count: 1,
      walletSetId,
      accountType: "EOA", // "SCA"
    },
  };
  return await axios
    .request(options)
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
    });
};

export const getWalletBalance = async (walletId: string) => {
  const options = {
    method: "GET",
    url: `https://api.circle.com/v1/w3s/wallets/${walletId}/balances`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
    },
  };

  return await axios
    .request(options)
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
    });
};
