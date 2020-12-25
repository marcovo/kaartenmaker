
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

export function formatCm(number: number, decimals: number = 1): string {
    return formatMeters(number/100, decimals, -2);
}

export function formatMeters(number: number, decimals: number = 1, displayOrderExponent: number = null): string {

    const numberOrderExponent = Math.floor(Math.log10(number));
    if(displayOrderExponent === null) {
        displayOrderExponent = 3 * Math.floor(numberOrderExponent / 3);
    }

    const displayOrder = 10 ** displayOrderExponent;
    const roundingOrder = displayOrder / (10**decimals);
    const roundedNumber = Math.round(number / roundingOrder) * roundingOrder;

    const numberText = trimTrailingZeroDecimalPlaces(roundedNumber / displayOrder, decimals);

    let unit: string;
    if(displayOrderExponent == 0) {
        unit = 'm';
    } else if(displayOrderExponent == 3) {
        unit = 'km';
    } else if(displayOrderExponent == -3) {
        unit = 'mm';
    } else if(displayOrderExponent == -2) {
        unit = 'cm';
    } else if(displayOrderExponent == -1) {
        unit = 'dm';
    } else if(displayOrderExponent == 1) {
        unit = 'dam';
    } else if(displayOrderExponent == 2) {
        unit = 'hm';
    } else {
        throw new Error('Could not find unit for order ' + displayOrderExponent);
    }

    return numberText + ' ' + unit;
}

export function findChildNode(node: Node, callback: (node) => boolean): Node|null {
    for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i];
        if(callback(childNode)) {
            return childNode;
        }
    }
    return null;
}

export function uint8arrayToString(input: Uint8Array): string {
    const output = [];

    for (let i = 0; i < input.length; i++) {
        output.push(String.fromCharCode(input[i]));
    }

    return output.join('');
}

export function stringToUnit8array(input: string): Uint8Array {
    return Uint8Array.from(input, (char) => char.charCodeAt(0));
}

export function formatDateTime(date: Date|number): string {
    if(!(date instanceof Date)) {
        date = new Date(date);
    }

    const minutes = date.getMinutes();
    const minuteString = ((minutes < 10) ? '0' : '') + minutes.toString();
    return date.getDay() + '-' + date.getMonth() + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + minuteString;
}
