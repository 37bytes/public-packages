const double = (x: number) => {
    return x * 2;
};

const formatName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`.trim();
};

const isAdult = (age: number) => {
    return age >= 18;
};

export { double, formatName, isAdult };
