import readline from "node:readline"
import {type Calendar} from "iamcal";
import {parseCalendar} from "iamcal/parse";
import {load} from "iamcal/io";

const rl = readline.createInterface({
        input: process.stdin, output: process.stdout,
    })

;(function main() {
    rl.question('Calendar URL or path: ', analyzePath)
})()

async function analyzePath(path: string) {
    let calendar: Calendar
    try {
        calendar = await getCalendar(path)
    } catch (e) {
        console.error('Failed to get calendar:')
        console.error(e)
        console.trace()
        process.exit(1)
    }

    analyzeCalendar(calendar)
}

async function getCalendar(path: string): Promise<Calendar> {
    let calendar: Calendar
    if (/^https?:\/\//.test(path)) {
        console.log("Fetching calendar from URL")
        const text = await fetch(path).then(response => response.text()).catch(reason => {
            throw reason
        })
        calendar = await parseCalendar(text)
    } else {
        console.log('Parsing calendar from file')
        calendar = await load(path)
    }

    return calendar
}

function analyzeCalendar(calendar: Calendar) {
    const events = calendar.events()

    let newestEvent: Date | undefined = undefined
    let oldestEvent: Date | undefined = undefined

    for (let event of events) {
        const start = parseDate(event.getProperty('DTSTART')!.value)
        if (!newestEvent || newestEvent < start) {
            newestEvent = start
        }
        if (!oldestEvent || oldestEvent > start) {
            oldestEvent = start
        }
    }

    console.log()
    console.log("Information about " + calendar.getProperty('X-WR-CALNAME')?.value)
    console.log()
    console.log("Event count: " + calendar.events().length)
    console.log("Oldest event: " + oldestEvent?.toDateString())
    console.log("Newest event: " + newestEvent?.toDateString())

    process.exit(0)
}

function parseDate(value: string): Date {
    return new Date(
        parseInt(value.substring(0, 4)), //
        parseInt(value.substring(4, 6)) - 1,
        parseInt(value.substring(6, 8)),
        12
    )
}