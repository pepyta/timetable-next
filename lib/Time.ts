export type DayType = "monday" | "tuesday" | "wednesday" | "thursday" | "friday"

export default class Time {
    public hour: number;
    public minute: number;

    constructor(public day: DayType, private str: `${number}:${number}`) {
        this.hour = parseInt(this.str.split(":")[0])
        this.minute = parseInt(this.str.split(":")[1])
    }

    public get asNumber() {
        const dayNumber = {
            "monday": 0,
            "tuesday": 1,
            "wednesday": 2,
            "thursday": 3,
            "friday": 4,
        };;

        return dayNumber[this.day] * 24 * 60 + this.hour * 60 + this.minute
    }
    
    public toString() {
        return `${this.hour < 10 ? `0${this.hour}` : this.hour }:${this.minute < 10 ? `0${this.minute}` : this.minute}`;
    }

    public static parse(str: string) {
        const map: Record<string, DayType> = {
            "Hétfő": "monday",
            "Kedd": "tuesday",
            "Szerda": "wednesday",
            "Csütörtök": "thursday",
            "Péntek": "friday",
            "Hétfo": "monday",
        }

        const dayStr = str.split(" ")[0]
        const day = map[dayStr]
        if(!day) throw new Error("Unknown day: " + dayStr)

        const timesStr = str.split(" ")[1].split("-")
        return {
            from: new Time(day, timesStr[0] as any),
            to: new Time(day, timesStr[1] as any)
        }
    }

    public get date() {
        const map: Record<DayType, number> = {
            "monday": 1,
            "tuesday": 2,
            "wednesday": 3,
            "thursday": 4,
            "friday": 5,
        };

        const d = new Date()
        d.setHours(this.hour, this.minute)
        d.setDate(d.getDate() - d.getDay() + map[this.day])
        return d
    }
}
