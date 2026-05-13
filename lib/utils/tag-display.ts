const SHORTEN_THRESHOLD = 14;
const TAIL_LENGTH = 8;
const ELLIPSIS = '…';

export function formatTagNumberForDisplay(tag: string | null | undefined): string {
  if (!tag) return '';
  if (tag.length <= SHORTEN_THRESHOLD) return tag;
  return ELLIPSIS + tag.slice(-TAIL_LENGTH);
}
