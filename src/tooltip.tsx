import React, { useState, useCallback, useEffect } from "react";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import getDataPointWidth from "./util/getDataPointWidth";
import { formatFullDate, roundToMinute } from "./util/timeUtils";

export type TooltipProps = {
  width: number;
  height: number;
  xScale: any;
  dataCache: any;
  categoryField: string;
  categoryEndField: string;
  gap: number;
};

type TooltipData = string;

const offset = 18;
const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "#fff",
  color: "#000",
  width: 180,
  fontFamily: "Arial",
  padding: 12,
  lineHeight: "22px",
};

export default function Tooltip({
  width,
  height,
  xScale,
  dataCache,
  categoryField,
  categoryEndField,
}: TooltipProps) {
  const [pxlGap, setPxlGap] = useState(null);
  const [activeRecord, setActiveRecord] = useState({});
  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    {
      scroll: true,
      detectBounds: true,
    }
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<TooltipData>({
    // initial tooltip state
    tooltipOpen: false,
    tooltipLeft: width / 3,
    tooltipTop: height / 3,
    tooltipData: "Move me with your mouse or finger",
  });

  // event handlers
  const handleMouseMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      // coordinates should be relative to the container in which tooltip is rendered
      const containerX =
        ("clientX" in event ? event.clientX : 0) - containerBounds.left;
      const containerY =
        ("clientY" in event ? event.clientY : 0) - containerBounds.top;
      const timestamp = xScale
        .invert("clientX" in event ? event.clientX - offset : 0)
        .getTime();
      const roundedTime = roundToMinute(timestamp);
      const record = dataCache[roundedTime] || {};
      const { date, value } = record;
      setActiveRecord(record);

      showTooltip({
        tooltipLeft: containerX,
        tooltipTop: containerY,
        tooltipData: `${formatFullDate(date)}\nValue: ${value}`,
      });
    },
    [showTooltip, containerBounds]
  );

  useEffect(() => {
    const pxlGap = getDataPointWidth({
      startTime: activeRecord[categoryField],
      endTime: activeRecord[categoryEndField],
      timeScale: xScale,
    });
    setPxlGap(pxlGap);
  }, [activeRecord]);

  return (
    <>
      <div
        ref={containerRef}
        className="tooltip-container"
        style={{ width, height }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={hideTooltip}
      >
        {tooltipOpen && (
          <>
            <div
              className="crosshair vertical"
              style={{
                transform: `translateX(${tooltipLeft}px)`,
                width: pxlGap + "px",
              }}
            />
            <TooltipInPortal
              key={Math.random()} // needed for bounds to update correctly
              left={tooltipLeft}
              top={tooltipTop}
              style={tooltipStyles}
            >
              {tooltipData}
            </TooltipInPortal>
          </>
        )}
      </div>
      <style>{`
        .tooltip-container {
          z-index: 0;
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          background: transparent;
          font-size: 14px;
          font-family: Arial;
          color: white;
          width: 100%;
          height: 100%;
        }
        .crosshair {
          position: absolute;
          top: 0;
          left: 0;
        }
        .crosshair.vertical {
          height: 100%;
          width: 1px;
          border: 1px dashed #35477d;
        }
        .no-tooltip {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>
    </>
  );
}
