export function isTeluguEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_TE === "true";
}
