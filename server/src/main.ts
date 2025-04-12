import { config } from "dotenv";
import { resolve } from "path";

const ENV = process.env.NODE_ENV || "development";
config({ path: resolve(__dirname, `../.env.${ENV}`) });

import app from "./configs/app";
import { connectToDatabase } from "./configs/database";

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT} [${ENV}]`);
  });
};

bootstrap();