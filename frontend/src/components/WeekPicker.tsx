import React, { FunctionComponent } from "react";
import { Box, Grid, Typography, IconButton } from "@material-ui/core";
import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";

import { format } from "date-fns";
import { RangeDate } from "../helper/interfaces";

interface Prop {
  range: RangeDate;
  onNextWeek: () => void;
  onPrevWeek: () => void;
  isPublished: boolean;
}
const WeekPicker: FunctionComponent<Prop> = ({
  range,
  onNextWeek,
  onPrevWeek,
  isPublished,
}) => {
  return (
    <>
      <Grid
        container
        justifyContent="flex-end"
        spacing={5}
        direction="row"
        alignItems="center"
      >
        <Grid item>
          <IconButton
            variant="outlined"
            size="small"
            onClick={() => onPrevWeek()}
          >
            <ArrowBackIos />
          </IconButton>
        </Grid>
        <Grid item>
          <Box className="picker-container">
            <Typography
              variant="body1"
              color={isPublished ? "primary" : ""}
            >{`${format(range.startDate, "dd MMM")} - ${format(
              range.endDate,
              "dd MMM"
            )}`}</Typography>
          </Box>
        </Grid>
        <Grid item>
          <IconButton
            variant="outlined"
            size="small"
            onClick={() => onNextWeek()}
          >
            <ArrowForwardIos />
          </IconButton>
        </Grid>
      </Grid>
    </>
  );
};

export default WeekPicker;
