export function tryParseInt(intString: string | number, defaultValue = 0) {
  if (typeof intString === "number") {
    if (isNaN(intString)) return defaultValue;
    return intString;
  }

  let intNum;

  try {
    intNum = parseInt(intString);
    if (isNaN(intNum)) intNum = defaultValue;
  } catch {
    intNum = defaultValue;
  }

  return intNum;
}

export function abbreviateNumber(n: number) {
  if (n >= 1e3 && n < 1e6) return (n / 1e3).toFixed(1) + "k";
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "m";
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "b";
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "t";
  else return tryParseInt(n).toFixed(0);
}

export function abbreviateNumberSplit(n: number) {
  if (n >= 1e3 && n < 1e6) return [+(n / 1e3).toFixed(1), "k"];
  if (n >= 1e6 && n < 1e9) return [+(n / 1e6).toFixed(1), "m"];
  if (n >= 1e9 && n < 1e12) return [+(n / 1e9).toFixed(1), "b"];
  if (n >= 1e12) return [+(n / 1e12).toFixed(1), "t"];
  else return [tryParseInt(n).toFixed(0), ""];
}

export function millisToMinutesAndSeconds(millis: number) {
  const hoursmillis = millis % (60 * 60 * 1000);
  const minutes = Math.floor(hoursmillis / (60 * 1000));
  const minutesmillis = millis % (60 * 1000);
  const sec = Math.floor(minutesmillis / 1000);

  return String(minutes).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

export function formatDurationFromMs(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  const remainingSeconds = seconds % 60;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatDurationFromS(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(1, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatTimestamp(timestampMs: number): string {
  const timestampDate = new Date(timestampMs);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateFormat: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit'
  };
  let formattedDate = timestampDate.toLocaleString(undefined, dateFormat);
  if (timestampDate.toDateString() === today.toDateString()) {
    formattedDate = `Today ${formattedDate}`;
  } else if (timestampDate.toDateString() === yesterday.toDateString()) {
    formattedDate = `Yesterday ${formattedDate}`;
  } else {
    formattedDate = timestampDate.toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit' }).replace(',', ' ');
  }
  return formattedDate;
}