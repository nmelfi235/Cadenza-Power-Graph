import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const formatMinute = d3.timeFormat("%I:%M %p"),
  formatHour = d3.timeFormat("%I:%M %p"),
  formatDay = d3.timeFormat("%a %d"),
  formatWeek = d3.timeFormat("%a %d"),
  formatMonth = d3.timeFormat("%B"),
  formatYear = d3.timeFormat("%Y");

export const tickFormat = (date) => {
  return (
    d3.timeHour(date) < date // checks precision
      ? formatMinute // returns function based on date precision
      : d3.timeDay(date) < date
      ? formatHour
      : d3.timeMonth(date) < date
      ? d3.timeWeek(date) < date
        ? formatDay
        : formatWeek
      : d3.timeYear(date) < date
      ? formatMonth
      : formatYear
  )(date);
};
