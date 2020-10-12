import { AxisScale } from '@visx/axis';
import moment from 'moment';

type DataPointWidthProps = {
  startTime: number;
  endTime?: number;
  timeScale: AxisScale;
  dynamicCursorWidth?: boolean; // default true, calculates width based on start and end time
  gap?: number; // pass to calculate width based on a fixed minute interval
};

/**
 *
 * For time series data, windows may represent data aggregated over a period
 * This function should be used to calculate the width of a data window in pixels
 */
const getDataPointWidth = ({
  startTime,
  endTime,
  timeScale,
  gap,
  dynamicCursorWidth = true,
}: DataPointWidthProps): number => {
  let nxtDate;
  if (dynamicCursorWidth && endTime) {
    nxtDate = moment(endTime);
  } else {
    nxtDate = moment(startTime).add(gap, "minutes").valueOf();
  }
  return timeScale(nxtDate) - timeScale(moment(startTime).valueOf());
};

export default getDataPointWidth;
