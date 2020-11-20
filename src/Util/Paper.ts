
export type millimeter = number;

export abstract class Paper {
    public readonly name: string;
    public readonly width: millimeter;
    public readonly height: millimeter;
}

export class A3P extends Paper {
    public readonly name: string = 'A3P';
    public readonly width: millimeter = 297;
    public readonly height: millimeter = 420;
}

export class A3L extends Paper {
    public readonly name: string = 'A3L';
    public readonly width: millimeter = 420;
    public readonly height: millimeter = 297;
}

export class A4P extends Paper {
    public readonly name: string = 'A4P';
    public readonly width: millimeter = 210;
    public readonly height: millimeter = 297;
}

export class A4L extends Paper {
    public readonly name: string = 'A4L';
    public readonly width: millimeter = 297;
    public readonly height: millimeter = 210;
}

export class A5P extends Paper {
    public readonly name: string = 'A5P';
    public readonly width: millimeter = 148;
    public readonly height: millimeter = 210;
}

export class A5L extends Paper {
    public readonly name: string = 'A5L';
    public readonly width: millimeter = 210;
    public readonly height: millimeter = 148;
}

export class CustomPaper extends Paper {
    constructor(
        public readonly width: millimeter,
        public readonly height: millimeter,
        public readonly name: string = 'Custom'
    ) {
        super();
    }
}
