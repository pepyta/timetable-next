import Course from "./Course";

export default class Subject {
    public courses: Course[] = [];

    constructor(
        public name: string,
        public credit: number,
        public mandatory: boolean
    ) {}
}