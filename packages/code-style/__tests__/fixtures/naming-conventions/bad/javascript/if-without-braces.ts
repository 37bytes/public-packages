const isValid = true;
const isActive = false;

function testIf() {
    if (isValid) console.log('Valid');

    if (isActive) return true;

    return false;
}

function testFor() {
    for (let i = 0; i < 10; i++) console.log(i);
}

function testWhile() {
    while (isValid) break;
}

export { isValid, isActive, testIf, testFor, testWhile };
