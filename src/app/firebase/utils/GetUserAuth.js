import Cookies from "js-cookie";

export default async function getUserAuth() {
  const user = Cookies.get("user");
  if (user) {
    const details = JSON.parse(user);
    return { details };
  }
  return false;
}
