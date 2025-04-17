import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return new Promise((resolve, reject) => {
    bcrypt.hash(
      password,
      saltRounds,
      (err: Error | undefined, hash: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      }
    );
  });
};

export const comparePassword = async ({
  password,
  hash,
}: {
  password: string;
  hash: string;
}): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(
      password,
      hash,
      (err: Error | undefined, result: boolean) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

