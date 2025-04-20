"server only";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { cookies } from "next/headers";

export const decodeJWT = async () => {
  const token = (await cookies()).get("user-token")?.value || "";

  if (!token) {
    return;
  }
  const decoded = jwtDecode<JwtPayload>(token);

  return decoded;
};

export const getToken = async () => {
  const token = (await cookies()).get("user-token")?.value || "";
  return token;
};

