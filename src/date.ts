const TODAY_REGEX = /today/;
const TOMORROW_REGEX = /tmr|tomorrow/;
const YESTERDAY_REGEX = /yday|yesterday/;

export function getFormattedDate(relativeDate: string): string {
  const now = new Date();
  let date = now;
  if (TODAY_REGEX.test(relativeDate)) {
    date = now;
  } else if (TOMORROW_REGEX.test(relativeDate)) {
    date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (YESTERDAY_REGEX.test(relativeDate)) {
    date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  }
  return formatDate(date);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${padded(month)}-${padded(day)}`;
}

function padded(value: number): string {
  return value.toString().padStart(2, "0");
}
