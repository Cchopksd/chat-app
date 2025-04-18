"server only";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { cookies } from "next/headers";

export const deCodeJWT = async () => {
  const token = (await cookies()).get("user-token")?.value || "";

  if (!token) {
    return;
  }
  const decoded = jwtDecode<JwtPayload>(token);

  return decoded;
};

