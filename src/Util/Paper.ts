
export type millimeter = number;

export default abstract class Paper {
    public name: string;
    public title: string;
    public width: millimeter;
    public height: millimeter;
}

export class A3P extends Paper {
    public readonly name: string = 'A3P';
    public readonly title: string = 'A3 (Staand)';
    public readonly width: millimeter = 297;
    public readonly height: millimeter = 420;
}

export class A3L extends Paper {
    public readonly name: string = 'A3L';
    public readonly title: string = 'A3 (Liggend)';
    public readonly width: millimeter = 420;
    public readonly height: millimeter = 297;
}

export class A4P extends Paper {
    public readonly name: string = 'A4P';
    public readonly title: string = 'A4 (Staand)';
    public readonly width: millimeter = 210;
    public readonly height: millimeter = 297;
}

export class A4L extends Paper {
    public readonly name: string = 'A4L';
    public readonly title: string = 'A4 (Liggend)';
    public readonly width: millimeter = 297;
    public readonly height: millimeter = 210;
}

export class A5P extends Paper {
    public readonly name: string = 'A5P';
    public readonly title: string = 'A5 (Staand)';
    public readonly width: millimeter = 148;
    public readonly height: millimeter = 210;
}

export class A5L extends Paper {
    public readonly name: string = 'A5L';
    public readonly title: string = 'A5 (Liggend)';
    public readonly width: millimeter = 210;
    public readonly height: millimeter = 148;
}

export class CustomPaper extends Paper {
    constructor(
        public width: millimeter,
        public height: millimeter,
        public title: string = 'Custom',
        public name: string = 'custom',
    ) {
        super();
    }
}
