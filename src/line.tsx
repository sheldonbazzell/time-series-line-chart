import React, { useState } from "react";
import { extent, max } from "d3-array";
import * as allCurves from "@visx/curve";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { Threshold } from "@visx/threshold";
import { scaleTime, scaleLinear } from "@visx/scale";
import Axis from "./axis";
import Tooltip from "./tooltip";
import getDataCache from "./util/getDataCache";

type CurveType = keyof typeof allCurves;
const curveTypes = Object.keys(allCurves);
const lineCount = 1;

export type LineProps = {
  width: number;
  height: number;
  data: any[];
  categoryField: string;
  categoryEndField: string;
  valueField: string;
  gap: number; // time series window width (minutes)
  threshold?: number;
  valueDomain?: [number, number]; // pass if desired, else will be determined by min max values in data
  showControls?: boolean;
};

export default function LineChart({
  width,
  height,
  data,
  categoryField,
  categoryEndField,
  valueField,
  threshold,
  gap,
  valueDomain,
  showControls = true,
}: LineProps) {
  // data accessors
  const getX = (d: any) => d[categoryField];
  const getY = (d: any) => d[valueField];

  // domains
  const xDomain = extent(data, getX) as [Date, Date];
  const yDomain = valueDomain || [0, max(data, getY) as number];

  // scales
  const xScale = scaleTime<number>({
    domain: xDomain,
  });
  const yScale = scaleLinear<number>({
    domain: yDomain,
  });

  const dataCache = getDataCache({
    data,
    gap,
    domain: xDomain,
    categoryField: "date",
  });

  // line defined fn for missing data points
  const lineDefined = (d) => d[valueField] !== null;

  const [curveType, setCurveType] = useState<CurveType>("curveBasis");
  const [showPoints, setShowPoints] = useState<boolean>(true);
  const lineHeight = height / lineCount;

  // update scale output ranges
  xScale.range([0, width]);
  yScale.range([lineHeight - 2, 0]);

  return (
    <div className="visx-curves-demo">
      {showControls && (
        <>
          <label>
            Curve type &nbsp;
            <select
              onChange={(e) => setCurveType(e.target.value as CurveType)}
              value={curveType}
            >
              {curveTypes.map((curve) => (
                <option key={curve} value={curve}>
                  {curve}
                </option>
              ))}
            </select>
          </label>
          &nbsp;
          <label>
            Show points&nbsp;
            <input
              type="checkbox"
              checked={showPoints}
              onChange={() => setShowPoints(!showPoints)}
            />
          </label>
          <br />
        </>
      )}
      <svg width={width} height={height + 40}>
        <rect width={width} height={height} fill="#efefef" rx={14} ry={14} />
        <Group top={0} left={13}>
          {showPoints &&
            data.map((d, j) => (
              <circle
                key={j}
                r={3}
                cx={xScale(getX(d))}
                cy={yScale(getY(d))}
                stroke="rgba(33,33,33,0.5)"
                fill="transparent"
              />
            ))}
          <Axis
            height={height}
            width={width}
            xScale={xScale}
            yScale={yScale}
            domain={xDomain}
          />
          <Threshold
            id={`${Math.random()}`}
            defined={lineDefined}
            data={data}
            x={(d) => xScale(d[categoryField])}
            y0={(d) => yScale(d[valueField])}
            y1={80}
            clipAboveTo={0}
            clipBelowTo={height}
            curve={allCurves[curveType]}
            belowAreaProps={{
              fill: "red",
              fillOpacity: 0.4,
            }}
            aboveAreaProps={{
              fill: "transparent",
              fillOpacity: 0,
            }}
          />
          <LinePath
            defined={lineDefined}
            curve={allCurves[curveType]}
            data={data}
            x={(d) => xScale(getX(d))}
            y={(d) => yScale(getY(d))}
            stroke="#333"
            strokeWidth={2}
            strokeOpacity={1}
            shapeRendering="geometricPrecision"
          />
          {threshold && (
            <LinePath
              defined={lineDefined}
              curve={allCurves[curveType]}
              data={data.map((d) => ({
                ...d,
                [valueField]: threshold,
              }))}
              x={(d) => xScale(getX(d))}
              y={(d) => yScale(getY(d))}
              stroke="#333"
              strokeWidth={2}
              strokeOpacity={1}
              strokeDasharray="2,2"
              shapeRendering="geometricPrecision"
            />
          )}
        </Group>
        <foreignObject
          className="node"
          x="0"
          y="0"
          width={width}
          height={height}
        >
          <body xmlns="http://www.w3.org/1999/xhtml">
            <Tooltip
              dataCache={dataCache}
              xScale={xScale}
              height={height}
              width={width}
              categoryField={categoryField}
              categoryEndField={categoryEndField}
              gap={gap}
            />
          </body>
        </foreignObject>
      </svg>
      <style jsx>{`
        .visx-curves-demo label {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
