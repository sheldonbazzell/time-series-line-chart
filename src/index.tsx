import React from "react";
import ReactDOM from "react-dom";
import LineChart from "./line";
import { default as defaultProps } from "./util/defaultProps";
import { default as data } from "./__mock__/healthtrendline";

// has other properties, but we care about value and time here
type HealthTrendlineRecord = {
  value: number;
  time: string; // iso string
};

const lineData = data.response[0].values.map(
  (record: HealthTrendlineRecord) => {
    return {
      value:
        record[defaultProps.valueField] >= 0
          ? record[defaultProps.valueField]
          : null,
      date: new Date(record.time).getTime(),
    };
  }
);
const charts = [<LineChart {...defaultProps} data={lineData} valueDomain={[0, 100]} />];
ReactDOM.render(
  <>{charts.map((chart) => [chart, <br />])}</>,
  document.getElementById("app")
);
