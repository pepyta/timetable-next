import { NextPage } from "next";
import { useMemo, useState } from "react";
import Parser from "../lib/Parser";
import Timetable from "../lib/Timetable";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import TimeInterval from "../lib/TimeInterval";
import Time from "../lib/Time";
const localizer = momentLocalizer(moment);

type HomePageProps = {
  subjectsData: any[];
  coursesData: any[];
};

const HomePage: NextPage<HomePageProps> = ({ subjectsData, coursesData }) => {
  const timetables = useMemo(() => {
    const parser = new Parser();
    const { subjects } = parser.parse(subjectsData, coursesData);
    return Timetable.generate(subjects, {
      // lunchbreak
      /*
      deadzones: [
        new TimeInterval([new Time("monday", "12:00"), new Time("monday", "13:00")]),
        new TimeInterval([new Time("tuesday", "12:00"), new Time("tuesday", "13:00")]),
        new TimeInterval([new Time("wednesday", "12:00"), new Time("wednesday", "13:00")]),
        new TimeInterval([new Time("thursday", "12:00"), new Time("thursday", "13:00")]),
        new TimeInterval([new Time("friday", "12:00"), new Time("friday", "13:00")]),
      ]
      */
    })
      .sort((a, b) => b.credit - a.credit)
      .sort((a, b) => a.score - b.score)
      .sort((a, b) => a.days.length - b.days.length);
  }, []);
  const [index, setIndex] = useState(0);
  const timetable = useMemo(() => timetables[index], [timetables, index]);

  return (
    <>
      index: <input type={"number"} defaultValue={index} onChange={(e) => !Number.isNaN(parseInt(e.target.value)) ? setIndex(parseInt(e.target.value)) : undefined} /> score: {timetable.score} credit: {timetable.credit}

      <button
        onClick={() => setIndex(index <= 0 ? timetables.length - 1 : index - 1)}
      >
        vissza
      </button>
      <button
        onClick={() => setIndex(index >= timetables.length - 1 ? 0 : index + 1)}
      >
        tovább
      </button>
      <Calendar
        view="week"
        localizer={localizer}
        events={timetables[index].courses.map((course) => course.event)}
      />
    </>
  );
};

export const getServerSideProps = async () => {
  const parser = new Parser();

  const { subjectsData, coursesData } = await parser.load();

  return {
    props: {
      subjectsData,
      coursesData,
    },
  };
};

export default HomePage;
