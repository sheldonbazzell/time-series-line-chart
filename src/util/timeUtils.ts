import moment from "moment";

export const formatFullDate = (t: Date): string => moment(t).format("LLL");
export const roundToMinute = (t: Date): number => moment(t).startOf("minute").valueOf();