/**
 * 设置认证 cookie
 */
export function setAuthCookie(token: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7天后过期
  
  return `auth-token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
}