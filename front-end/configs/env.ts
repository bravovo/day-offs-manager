if (!process.env.SERVER_URL) {
  throw new Error("З'єднання з сервером неможливе");
}

export const SERVER_URL = process.env.SERVER_URL;
