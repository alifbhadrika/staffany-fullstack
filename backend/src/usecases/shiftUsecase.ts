import * as shiftRepository from "../database/default/repository/shiftRepository";
import { Between, Equal, FindManyOptions, FindOneOptions } from "typeorm";
import Shift from "../database/default/entity/shift";
import { ICreateShift, IUpdateShift } from "../shared/interfaces";
import { getMonday, getSunday } from "../shared/utils";

export const find = async (opts: FindManyOptions<Shift>): Promise<Shift[]> => {
  return shiftRepository.find(opts);
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  return shiftRepository.findById(id, opts);
};

export const create = async (payload: ICreateShift): Promise<Shift> => {
  const shift = new Shift();
  shift.name = payload.name;
  shift.date = payload.date;
  shift.startTime = payload.startTime;
  shift.endTime = payload.endTime;
  shift.isPublished = false;
  shift.startWeekDate = getMonday(new Date(payload.date));

  return shiftRepository.create(shift);
};

export const save = async (payload: Shift[]): Promise<Shift[]> => {
  return shiftRepository.save(payload);
};

export const updateById = async (
  id: string,
  payload: IUpdateShift
): Promise<Shift> => {
  return shiftRepository.updateById(id, {
    ...payload,
  });
};

export const deleteById = async (id: string | string[]) => {
  return shiftRepository.deleteById(id);
};

export const findOverlap = async (
  startTime: string,
  endTime: string,
  date: string
) => {
  return shiftRepository.find({
    where: [
      {
        date: Equal(new Date(date)),
        startTime: Between(startTime, endTime),
      },
      {
        date: Equal(new Date(date)),
        endTime: Between(startTime, endTime),
      },
    ],
  });
};

export const findShiftsBetweenDate = async (
  statrtDate: string,
  endDate: string
) => {
  return shiftRepository.find({
    where: {
      date: Between(new Date(statrtDate), new Date(endDate)),
    },
  });
};

export const findPublishedShiftsInTheWeek = async (date: Date) => {
  const startDate = getMonday(date);
  const endDate = getSunday(date);

  return shiftRepository.find({
    where: {
      date: Between(startDate, endDate),
      isPublished: true,
    },
  });
};
