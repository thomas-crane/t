import { TextRange } from 't/types';

/**
 * Sets the text range on the given target.
 */
export function setTextRange<T>(target: Exclude<T, keyof TextRange>, range?: TextRange): T & TextRange {
  return {
    ...target,
    pos: range?.pos ?? 0,
    end: range?.end ?? 0,
  };
}
