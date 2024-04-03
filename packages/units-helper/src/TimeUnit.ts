const ONE_SECOND = 1000;

const getSeconds = (value: number) => value * ONE_SECOND;
const getMinutes = (value: number) => getSeconds(value) * 60;
const getHours = (value: number) => getMinutes(value) * 60;
const getDays = (value: number) => getHours(value) * 24;
const getWeeks = (value: number) => getDays(value) * 7;

export const TimeUnit = {
    seconds: getSeconds,
    minutes: getMinutes,
    hours: getHours,
    days: getDays,
    weeks: getWeeks
};
