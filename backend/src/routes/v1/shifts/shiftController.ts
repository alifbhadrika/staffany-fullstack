import { Request, ResponseToolkit } from "@hapi/hapi";
import * as shiftUsecase from "../../../usecases/shiftUsecase";
import { errorHandler } from "../../../shared/functions/error";
import {
  ICreateShift,
  IPublishShift,
  ISuccessResponse,
  IUpdateShift,
} from "../../../shared/interfaces";
import moduleLogger from "../../../shared/functions/logger";
import Shift from "../../../database/default/entity/shift";
import { HttpError } from "../../../shared/classes/HttpError";

const logger = moduleLogger("shiftController");

export const find = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shifts");
  try {
    let filter = req.query;

    let data = [];
    const { startDate, endDate } = req.query;
    if (startDate && endDate) {
      delete filter.startDate;
      delete filter.endDate;

      data = await shiftUsecase.findShiftsBetweenDate(
        startDate,
        endDate,
        filter
      );
    } else {
      data = await shiftUsecase.find(filter);
    }
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const findById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shift by id");
  try {
    const id = req.params.id;
    const data = await shiftUsecase.findById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const create = async (req: Request, h: ResponseToolkit) => {
  logger.info("Create shift");
  try {
    const body = req.payload as ICreateShift;

    if (body.startTime && body.endTime && body.date) {
      // check if shift overlap others
      const overlappingShifts = await shiftUsecase.findOverlap(
        body.startTime,
        body.endTime,
        body.date
      );
      if (overlappingShifts.length > 0) {
        throw new HttpError(400, "Shift overlapped with other Shift");
      }

      // check if the date is already been published
      const date = new Date(body.date);
      const publishedShifts = await shiftUsecase.findPublishedShiftsInTheWeek(
        date
      );

      if (publishedShifts.length > 0) {
        throw new HttpError(
          400,
          "The date is on the week that has already published"
        );
      }
    }

    const data = await shiftUsecase.create(body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Create shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const updateById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Update shift by id");
  try {
    const id = req.params.id;
    const body = req.payload as IUpdateShift;

    if (body.startTime && body.endTime && body.date) {
      // check if shift overlap others
      const overlappingShifts = await shiftUsecase.findOverlap(
        body.startTime,
        body.endTime,
        body.date
      );
      if (overlappingShifts.length > 0) {
        throw new HttpError(400, "Shift overlapped with other Shift");
      }

      // check if the date is already been published
      const date = new Date(body.date);
      const publishedShifts = await shiftUsecase.findPublishedShiftsInTheWeek(
        date
      );

      if (publishedShifts.length > 0) {
        throw new HttpError(
          400,
          "The date is on the week that has already published"
        );
      }
    }

    // check if shift has been published
    const shift = await shiftUsecase.findById(id);
    if (shift.isPublished) {
      throw new HttpError(400, "Shift has already been published");
    }

    const data = await shiftUsecase.updateById(id, body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Update shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const deleteById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Delete shift by id");
  try {
    const id = req.params.id;

    // check if shift has been published
    const shift = await shiftUsecase.findById(id);
    if (shift.isPublished) {
      throw new HttpError(400, "Shift has already been published");
    }

    const data = await shiftUsecase.deleteById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Delete shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const publish = async (req: Request, h: ResponseToolkit) => {
  logger.info("Publish shift(s)");
  try {
    const body = req.payload as IPublishShift;

    // check the which week is going to be published
    const startDate = body.startDate;
    const endDate = body.endDate;

    // get all shifts whithin the week
    const shifts = await shiftUsecase.findShiftsBetweenDate(startDate, endDate);

    if (shifts.length === 0) {
      throw new HttpError(400, "There are no shifts between selected dates");
    }

    // check if shift has already published
    if (shifts[0].isPublished) {
      throw new HttpError(400, "Shifts has already been published");
    }

    // update isPublished field in every shift
    shifts.forEach((shift: Shift) => {
      shift.isPublished = true;
    });

    const data = await shiftUsecase.save(shifts);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Publish shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};
