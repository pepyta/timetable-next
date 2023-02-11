import Course from "./Course";
import Subject from "./Subject";
import { DayType } from "./Time";
import TimeInterval from "./TimeInterval";

export type TimetableGenerateOptions = Partial<{
    maxDays: number;
    minCredit: number;
    maxCredit: number;
    allowDayGap: boolean;
    deadzones: TimeInterval[];
}>;

export default class Timetable {    
    constructor(public courses: Course[]) {}
    
    public static generateTimetableWithMandatoriesOnly(
        subjects: Subject[],
        fixedCourses: Course[] = []
    ): Timetable[] {
        if(subjects.length === 0) return [new Timetable(fixedCourses)]
        const result: Timetable[] = [];
        const [subject, ...remainingSubjects] = subjects;
        for(const course of subject.courses) {
            const prev = new Timetable(fixedCourses)
            if(prev.isFree(course.timeInterval)) {
                result.push(...Timetable.generateTimetableWithMandatoriesOnly(remainingSubjects, [...fixedCourses, course]))
            }
        }

        return result 
    }

    public static generateTimetableWithourMandatories(
        subjects: Subject[],
        fixedCourses: Course[],
    ) {
        if(subjects.length === 0) return [new Timetable(fixedCourses)]
        const result: Timetable[] = []
        const [subject, ...remainingSubjects] = subjects;
        for(const course of subject.courses) {
            const prev = new Timetable(fixedCourses)
            if(prev.isFree(course.timeInterval)) {
                result.push(...Timetable.generateTimetableWithourMandatories(remainingSubjects, [...fixedCourses, course]))
            }
        }

        // allow to not skip mandatory subjects
        result.push(...Timetable.generateTimetableWithourMandatories(remainingSubjects, fixedCourses))
        
        return result
    }

    public allCheckPasses(options: TimetableGenerateOptions) {
        if(options.minCredit && options.minCredit > this.credit) {
            return false;
        }

        if(options.maxCredit && options.maxCredit < this.credit) {
            return false;
        }

        if(options.maxDays && options.maxDays < this.days.length) {
            return false
        }

        if(!options.allowDayGap && this.hasDayGap) {
            return false
        }

        if(options.deadzones && this.courses.some((course) => options.deadzones.some((deadzone) => course.timeInterval.overlaps(deadzone)))) {
            return false
        } 

        return true
    }

    public static filterUnique(timetables: Timetable[]): Timetable[] {
        const map = new Map<string, Timetable>();
        for(const timetable of timetables) {
            map.set(timetable.toString(), timetable)
        }

        const result: Timetable[] = [];
        for(const key of map.keys()) {
            result.push(map.get(key) as Timetable)
        }
        return result
    }

    public static generate(subjects: Subject[], options: TimetableGenerateOptions = {}): Timetable[] {
        const mandatorySubjects = subjects.filter((subject) => subject.mandatory)
        const nonMandatorySubjects = subjects.filter((subject) => !subject.mandatory)

        const onlyMandatories = Timetable.generateTimetableWithMandatoriesOnly(mandatorySubjects)
        return onlyMandatories.flatMap((incompleteTimetable) => Timetable.generateTimetableWithourMandatories(nonMandatorySubjects, incompleteTimetable.courses))
                .filter((timetable) => timetable.allCheckPasses(options))
        

        /*
        if(subjects.length === 0) return [];
        const subject = Timetable.firstMandatorySubject(subjects) || subjects[0]
        const otherSubjects = subjects.filter((el) => el !== subject) 
        const result: Timetable[] = [];
        for(const course of subject.courses) {
            const prevTimetable = new Timetable(addedCourses || [])
            if(prevTimetable.isFree(course.from, course.to)) {
                const newTimetable = new Timetable(addedCourses ? [...addedCourses, course] : [course])
                const level = newTimetable.correctLevel(options)
                if (level !== "overflow") {
                    if(level === "correct" && otherSubjects.every((el) => !el.mandatory) && !newTimetable.hasDayGap) {
                        result.push(newTimetable)
                    }

                    result.push(...Timetable.generate(otherSubjects, options, addedCourses ? [...addedCourses, course] : [course]))
                }
            } 
            
        }

        return result
        */
    }

    public get credit() {
        return this.courses.reduce((prev, course) => prev + course.subject.credit, 0)
    }

    public isFree(interval: TimeInterval) {
        return this.courses.every((course) => !course.timeInterval.overlaps(interval))
    }

    public get days() {
        const days: DayType[] = [];
        for(const course of this.courses) {
            if(!days.includes(course.timeInterval.from.day)) {
                days.push(course.timeInterval.from.day)
            }
        }

        return days
    }

    public get hasDayGap() {
        const dayNumber: Record<DayType, number> = {
            monday: 0,
            tuesday: 1,
            wednesday: 2,
            thursday: 3,
            friday: 4,
        };

        const dayNumbers = this.days.map((day) => dayNumber[day]).sort((a, b) => a - b)
        if(dayNumbers.length < 2) return false
        for(let i = 0; i < dayNumbers.length - 1; i++) {
            if(dayNumbers[i] + 1 != dayNumbers[i+1]) return true
        }
        return false
    }

    public get score() {
        const courses = this.courses.sort((a, b) => a.timeInterval.from.asNumber - b.timeInterval.from.asNumber)
        let sum = 0;
        for(let i = 0; i < courses.length - 1; i++) {
            sum += courses[i].timeInterval.distance(courses[i+1].timeInterval)
        }

        return sum
    }

    public toString() {
        let result = "";
        this.courses = this.courses.sort((a, b) => a.timeInterval.from.asNumber - b.timeInterval.from.asNumber)
        result += "Score: " + this.score + "\n"
        result += "Credit: " + this.credit + "\n"
        for(const course of this.courses) {
            result += `${course.timeInterval.toString()}: ${course.subject.name} (${course.id})\n`
        }

        return result
    }
}
