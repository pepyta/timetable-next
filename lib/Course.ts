import { Event } from "react-big-calendar"
import Subject from "./Subject"
import Time from "./Time"
import TimeInterval from "./TimeInterval"

export default class Course {
    constructor(
        public id: string,
        public timeInterval: TimeInterval,
        public subject: Subject
    ) {
        this.subject.courses.push(this)
    }

    public get event(): Event {
        return {
            start: this.timeInterval.from.date,
            end: this.timeInterval.to.date,
            title: `${this.subject.name} (${this.id})`,
             
        }
    }
}
