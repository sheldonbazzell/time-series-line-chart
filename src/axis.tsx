import React, { useState, useMemo } from 'react';
import { ScaleInput } from '@visx/scale';
import { Orientation, SharedAxisProps, AxisScale } from '@visx/axis';
import { AnimatedAxis, AnimatedGridRows } from '@visx/react-spring';
import moment from 'moment';

export const backgroundColor = '#da7cff';
export const labelColor = '#340098';
const axisColor = '#000';
const tickLabelColor = '#000';
const gridColor = '#dedede';
const animationTrajectory = 'center';

const tickLabelProps = () =>
  ({
    fill: tickLabelColor,
    fontSize: 12,
    fontFamily: 'sans-serif',
    textAnchor: 'middle',
  } as const);

export type AxisProps = {
  width: number;
  height: number;
  yScale: any;
  xScale: any;
  domain: [Date, Date]
};

export default function Axis({
  width: outerWidth = 800,
  height: outerHeight = 800,
  yScale,
  xScale,
  domain
}: AxisProps) {
  const margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const width = outerWidth - margin.left - margin.right;
  const height = outerHeight - margin.top - margin.bottom;
  const formatTime = (v: Date, i: number) =>
    width > 400 || i % 2 === 0 ? moment(v).format("h:mm a") : "";

  interface AxisProps<Scale extends AxisScale> extends SharedAxisProps<Scale> {
    values: ScaleInput<Scale>[];
    scale: Scale;
    label: string;
    tickFormat: Function;
  }

  const axes: AxisProps<AxisScale<number>>[] = useMemo(() => {
    return [
      {
        scale: xScale,
        values: domain,
        tickFormat: formatTime,
        label: 'time',
      }
    ];
  }, [width]);

  if (width < 10) return null;

  const scalePadding = 20;
  const scaleHeight = height / axes.length - scalePadding;

  return (
    <g>
        <rect
          x={0}
          y={0}
          width={outerWidth}
          height={outerHeight}
          fill={'transparent'}
          rx={14}
        />
        <g transform={`translate(${margin.left}, 20)`}>
        {axes.map(({ scale, label, tickFormat }, i) => (
            <g key={`scale-${i}`} transform={`translate(0, ${i * (scaleHeight + scalePadding)})`}>
              <AnimatedGridRows
                // force remount when this changes to see the animation difference
                key={`gridrows-${animationTrajectory}`}
                scale={yScale}
                stroke={gridColor}
                width={width}
                numTicks={0}
                animationTrajectory={animationTrajectory}
              />
              <AnimatedAxis
                // force remount when this changes to see the animation difference
                key={`axis-${animationTrajectory}`}
                orientation={Orientation.bottom}
                top={scaleHeight}
                scale={scale}
                tickFormat={tickFormat}
                stroke={axisColor}
                tickStroke={axisColor}
                tickLabelProps={tickLabelProps}
                numTicks={6}
                label={label}
                labelProps={{
                  x: width + 30,
                  y: -10,
                  fill: labelColor,
                  fontSize: 18,
                  strokeWidth: 0,
                  stroke: '#000',
                  paintOrder: 'stroke',
                  fontFamily: 'sans-serif',
                  textAnchor: 'start',
                }}
                animationTrajectory={animationTrajectory}
              />
            </g>
          ))}
        </g>
    </g>
  );
}