import { Schedule, UserData } from '@/types/salmon-stats';
import { IIdKeyMap, idKeyMapModule as idKeyMap, idKeyMapModule } from '@/store/modules/id-key-map';
import dayjs, { Dayjs } from 'dayjs';
import { i18n } from './i18n-setup';

export const iconUrl = (weaponType: string, id: string | number) => {
  return `https://splatoon-stats-api.yuki.games/static/images/${weaponType}/${id}.png`;
};

export const isGrizzcoWeapon = (weaponId: number): boolean => weaponId >= 20000;

type QueryParams = {
  page?: number;
  filters?: string;
}

export const mapQueryParamsToApiPath = (endpoint: string, { page, filters }: QueryParams = {}) : string => {
  const parsedFilters = filters ? JSON.parse(filters) as { [key: string]: any } : {};

  const queryString = Object.entries(parsedFilters)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        value = (value as any[]).join(',');
      }

      return `${key}=${encodeURIComponent(value)}`
    })
    .join('&');

  return `${endpoint}?page=${page || 1}&${queryString}`;
};

/**
 * @param percentage percentage (0-1)
 * @param digits
 */
export const percentage = (percentage: number, digits: number = 2): string => {
  if (percentage === 0 || percentage === 1) digits = 0;

  return (percentage * 100).toFixed(digits) + '%';
};

/**
 * @param number
 * @param digits
 */
export const toFixed = (number: number, digits: number): string => {
  return number.toFixed(digits);
};

/**
 * @param dateString
 * @param formatter
 */
export const formatDateInLocalTz = (dateLikeObject: string | number | Date | Dayjs, formatter: string): string => {
  // Date object is timezone aware
  if (dateLikeObject instanceof Date) {
    return dayjs(dateLikeObject).format(formatter);
  }

  return dayjs.utc(dateLikeObject).local().format(formatter);
};

/**
 * @param dateLikeObject
 */
export const formatDateToYmdhm = (dateLikeObject: string | number | Date | Dayjs) =>
  formatDateInLocalTz(dateLikeObject, 'YYYY-MM-DD HH:mm');

/**
 * @param dateLikeObject
 */
export const formatDateToMdhm = (dateLikeObject: string | number | Date | Dayjs) =>
  formatDateInLocalTz(dateLikeObject, 'MM-DD HH:mm');

  /**
 * @param dateLikeObject in UTC
 */
export const formatScheduleId = (dateLikeObject: string | number | Date | Dayjs) =>
  dayjs(dateLikeObject).format('YYYYMMDDHH');

/**
 * @param key
 * @param id
 */
export const getTranslationKey = (key: keyof IIdKeyMap, id: string | number) => {
    // @ts-ignore
    return `${key}.${idKeyMap[key][id]}`;
};

export const isMaxHazard = (hazardLevel: any): boolean =>
  parseInt(hazardLevel, 10) === 200;

export const translate = (key: keyof IIdKeyMap, id: number|string) => {
  return i18n.t(getTranslationKey(key, id));
};

export const parseRawSchedule = (rawSchedule: any): Schedule => {
  const startAt = dayjs.utc(rawSchedule.schedule_id);
  const endAt = dayjs.utc(rawSchedule.end_at);

  return {
    scheduleId: formatScheduleId(startAt),
    startAt: startAt.toDate(),
    endAt: endAt.toDate(),
    weapons: rawSchedule.weapons,
    stageId: rawSchedule.stage_id,
    rareWeaponId: rawSchedule.rare_weapon_id,
  };
};

export const parseRawUserData = (rawUser: any): UserData => {
  return {
    isRegistered: !!(rawUser.is_registered || rawUser.created_at),
    isCustomName: !!rawUser.is_custom_name,
    playerId: rawUser.player_id,
    name: rawUser.name,
    avatar: rawUser.twitter_avatar,
    total: rawUser.total,
    results: rawUser.results,
  };
}

export const sum = (collection: number[] | object) => {
  let numbers: number[];

  if (!Array.isArray(collection)) {
    numbers = Object.values(collection);
  } else {
    numbers = collection;
  }

  return numbers.reduce((sum: number, item: number) => sum + item, 0);
}

export const timeDifference = (a: Date | Dayjs, b: Date | Dayjs): string => {
  const diff = Math.abs(dayjs(a).diff(b, 's'));
  return [Math.floor(diff / 3600), Math.floor((diff % 3600) / 60), (diff % 3600) % 60]
    .map(fragment => fragment.toString().padStart(2, '0'))
    .join(':');
}

export const useMetricPrefix = (n: number, toFixed: number) => {
  const megaThreshold = 10e6;
  const mega = 10e6;
  const kiloThreshold = 10e4;
  const kilo = 10e3;

  const convert = (m: number, base: number) =>
    (m / (base ** (Math.log(m) / Math.log(base) | 0))).toFixed(toFixed);

  if (n >= megaThreshold) {
    return `${convert(n, mega)}M`;
  } else if (n >= kiloThreshold) {
    return `${convert(n, kilo)}K`;
  }
  return n;
};
