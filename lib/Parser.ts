import Subject from "./Subject";
import fs from "fs"
import path from "path"
import csv from "csv-parser";
import Course from "./Course";
import Time from "./Time";
import TimeInterval from "./TimeInterval";

export default class Parser {
    private async loadRawSubjectsData(): Promise<any[]> {
        return new Promise((resolve) => {
            const subjects: any[] = [];
            fs.createReadStream(path.resolve('./subjects_stripped.csv'))
                .pipe(csv({ separator: ";" }))
                .on("data", (data: any) => {
                    subjects.push(data)
                })
                .on("end", () => resolve(subjects))
        })
    }

    private async loadRawCoursesData(): Promise<any[]> {
        return new Promise((resolve) => {
            const result = []
            fs.createReadStream(path.resolve('./courses_stripped_2.csv'))
                .pipe(csv({ separator: ";" }))
                .on("data", (data: any) => {
                    result.push(data)
                })
                .on("end", () => resolve(result))
        })
    }

    public async load() {
        return {
            subjectsData: await this.loadRawSubjectsData(),
            coursesData: await this.loadRawCoursesData(),
        }
    }
    
    private parseSubjects(subjectsData: any[]): Subject[] {
        const result: Subject[] = [];
        subjectsData.forEach((data) => {

            const subject = new Subject(
                data["name"],
                parseInt(data["credit"]),
                data["mandatory"] == "true"
            )
                result.push(subject)
        })
        return result;
    }

    public parseCourses(subjects: Subject[], loaded: any[]) {
        const result: Course[] = [];
        loaded.forEach((data) => {
            const subject = subjects.find((subject) => subject.name.trim().toLowerCase() == data["name"].trim().toLowerCase())
            if(!subject) throw new Error("Could not find subject with " + data["name"]);
            const { from, to } = Time.parse(data["date"])
            
            if(data["disabled"] != "true") {
                result.push(
                    new Course(
                        data["group"],
                        new TimeInterval([from, to]),
                        subject,
                    )
                )
            }
        })
        return result
    }

    public parse(subjectsData, coursesData) {
        const subjects = this.parseSubjects(subjectsData)
        const courses = this.parseCourses(subjects, coursesData)

        const mandatorySubject = subjects.find((subject) => subject.mandatory && subject.courses.length === 0)
        if(mandatorySubject) {
            throw new Error("The " + mandatorySubject.name + " subject is mandatory and does not have a single course.");
        }

        subjects.filter((subject) => !subject.mandatory && subject.courses.length === 0).forEach((subject) => {
            console.warn("The " + subject.name + " has no courses!")
        })


        return {
            subjects,
            courses,
        }
    }

}