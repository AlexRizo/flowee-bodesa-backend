import dotenv from 'dotenv';

dotenv.config();

export const getEnv = {
  //? All the environment variables
  ...process.env as Record<string, string>,
};