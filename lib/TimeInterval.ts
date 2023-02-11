import Time from "./Time";

export default class TimeInterval {
    public readonly from: Time;
    public readonly to: Time;

    constructor(interval: [Time, Time]) {
        if(interval[0].day !== interval[1].day) throw new Error("The from and to atributes must be on the same day.")

        if(interval[0].asNumber < interval[1].asNumber) {
            this.from = interval[0]
            this.to = interval[1]
        } else {
            this.from = interval[1]
            this.to = interval[0]
        }
    }

    public distance(other: TimeInterval) {
        if(this.overlaps(other)) return 0;
        if(this.from.day !== other.from.day) return 0

        return Math.min(
            Math.abs(this.to.asNumber   - other.from.asNumber),
            Math.abs(this.from.asNumber - other.to.asNumber)
        )
    }

    public overlaps(other: TimeInterval) {
        const a1 = other.from.asNumber
        const a2 = other.to.asNumber
        const b1 = this.from.asNumber
        const b2 = this.to.asNumber
        return Math.max(a2, b2) - Math.min(a1, b1) < (a2 - a1) + (b2 - b1)
            && other.from.day === this.from.day
    }

    public toString() {
        return `${this.from.day} ${this.from.toString()} - ${this.to.toString()}`
    }

    public serialize() {
        
    }
}