const getKilobytes = (value: number) => value * 1024;
const getMegabytes = (value: number) => getKilobytes(value) * 1024;
const getGigabytes = (value: number) => getMegabytes(value) * 1024;

export const SizeUnit = {
    kilobytes: getKilobytes,
    megabytes: getMegabytes,
    gigabytes: getGigabytes
};
