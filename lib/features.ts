export function isTeluguEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_TE === "true";
}

export function areFutureSectionsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_FUTURE_SECTIONS === "true";
}
