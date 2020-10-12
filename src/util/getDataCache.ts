import moment from "moment";
import { roundToMinute } from "./timeUtils";

export const MILLISECONDS_IN_1_MINUTE = 60000;

type ValidDateProps = {
  time: Date | number;
  minBound: Date | number;
  maxBound: Date | number;
};

/**
 *
 * Determine whether date is within a given range
 */
const getIsValidDate = ({ time, minBound, maxBound }: ValidDateProps) => {
  const momentT = moment(time);
  const momentMin = moment(minBound);
  const momentMax = moment(maxBound);
  return momentT.isBetween(momentMin, momentMax, undefined, "[]");
};

type DataCacheProps = {
  data: any[];
  categoryField: string; // date field lookup
  gap: number; // time series window length (minutes)
  domain: [Date, Date];
};

/**
 *
 * @returns {object} lookup object of timestamp -> record associated to that timestamp
 * used for time series charts to display data on hover
 */
export default function getDataCache({
  data: inputData,
  gap,
  domain,
  categoryField,
}: DataCacheProps) {
  // receives chart's input data, outputs dataCache and formatted data array
  const { dataCache, data } = inputData.reduce(
    (map, cur, idx) => {
      let nxtDate;
      if (inputData[idx + 1]) {
        nxtDate = inputData[idx + 1][categoryField];
      } else {
        nxtDate = moment(cur[categoryField]).add(gap, "minutes").valueOf();
      }
      let d = roundToMinute(cur[categoryField]);
      const isValidEnd = getIsValidDate({
        time: nxtDate,
        minBound: d,
        maxBound: domain[1],
      });

      nxtDate = isValidEnd ? nxtDate : roundToMinute(domain[1]);

      // add record with timestamp truncated to nearest minute
      map.data.push({
        ...cur,
        [categoryField]: d,
      });

      while (d < nxtDate) {
        if (!map.dataCache[d]) {
          map.dataCache[d] = cur;
          map.dataCache[d].index = idx;
          const endTime = cur.endTime || nxtDate;
          map.dataCache[d].endTime = endTime;
        }
        d += MILLISECONDS_IN_1_MINUTE;
      }
      return map;
    },
    { dataCache: {}, data: [] }
  );

  // calculate last record interval, so that times within final window can be added to dataCache
  const last = data[data.length - 1];
  let d = last[categoryField];
  const lastRecordTimeInterval = gap;
  const endTime = moment(d).add(lastRecordTimeInterval, "minutes").valueOf();

  // add final window to dataCache
  while (d <= endTime) {
    if (!dataCache[d]) {
      dataCache[d] = last;
    }
    d += MILLISECONDS_IN_1_MINUTE;
  }

  return dataCache;
}
