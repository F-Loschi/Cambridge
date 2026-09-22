export const MAX_STREAK_SHIELDS = 2;
export const SHIELD_MILESTONE_DAYS = 7;

/** How many shields the user should have earned in total by this streak length. */
export function shieldMilestonesEarned(streak: number): number {
  return Math.floor(streak / SHIELD_MILESTONE_DAYS);
}
