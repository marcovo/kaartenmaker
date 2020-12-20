
export function trimTrailingZeroDecimalPlaces(number: number, fractionDigits: number): string {
    let text = number.toFixed(fractionDigits);

    for(let i=text.length-1; i>=0; i--) {
        if(text.substr(i, 1) === '0') {
            text = text.substr(0, i);
        } else {
            if(text.substr(i, 1) === '.' || text.substr(i, 1) === ',') {
                text = text.substr(0, i);
            }
            break;
        }
    }

    return text;
}
