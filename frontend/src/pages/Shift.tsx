import React, { FunctionComponent, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import { getErrorMessage } from "../helper/error/index";
import {
  deleteShiftById,
  getShifts,
  getShiftsBetweenDate,
  publishAllShifts,
} from "../helper/api/shift";
import DataTable from "react-data-table-component";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { useHistory } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@material-ui/lab/Alert";
import { Link as RouterLink } from "react-router-dom";
import { Button, Typography } from "@material-ui/core";
import { IShift, RangeDate } from "../helper/interfaces";
import WeekPicker from "../components/WeekPicker";
import { addDays, format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  spacing: {
    marginRight: theme.spacing(2),
  },
}));

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
  disabled?: boolean;
}
const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,
  disabled = false,
}) => {
  return (
    <div>
      <IconButton
        size="small"
        aria-label="delete"
        component={RouterLink}
        disabled={disabled}
        to={`/shift/${id}/edit`}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        aria-label="delete"
        disabled={disabled}
        onClick={() => onDelete()}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

interface CardActionProps {
  numOfData: number;
  onCreate: () => void;
  onPublish: () => void;
  isPublished?: boolean;
  datePublished?: Date;
  range: RangeDate;
  onNextWeek: () => void;
  onPrevWeek: () => void;
}

const CardAction: FunctionComponent<CardActionProps> = ({
  isPublished = false,
  onCreate,
  onPublish,
  numOfData,
  range,
  onNextWeek,
  onPrevWeek,
  datePublished,
}) => {
  return (
    <Grid
      container
      justifyContent="space-between"
      direction="row"
      alignItems="center"
    >
      <Grid item>
        <WeekPicker
          isPublished={isPublished}
          range={range}
          onNextWeek={onNextWeek}
          onPrevWeek={onPrevWeek}
        />
      </Grid>
      <Grid item>
        <Grid
          container
          justifyContent="flex-end"
          spacing={2}
          direction="row"
          alignItems="center"
        >
          {isPublished && datePublished !== undefined ? (
            <Grid item>
              <Typography color="primary">
                Week published on{" "}
                {format(new Date(datePublished), "dd MMM yyyy hh:mm a")}
              </Typography>
            </Grid>
          ) : null}
          <Grid item>
            <Button
              variant="outlined"
              disabled={isPublished}
              onClick={() => onCreate()}
            >
              Add Shift
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              disabled={numOfData === 0 || isPublished}
              onClick={() => onPublish()}
            >
              Publish
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const Shift = () => {
  const classes = useStyles();
  const history = useHistory();

  const [rows, setRows] = useState<IShift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [showPublishConfirm, setShowPublishConfirm] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 6),
  });

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setErrMsg("");
        const { results } = await getShiftsBetweenDate(
          range.startDate.toISOString(),
          range.endDate.toISOString()
        );
        setRows(results);
      } catch (error) {
        const message = getErrorMessage(error);
        setErrMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [range, publishLoading]);

  const columns = [
    {
      name: "Name",
      selector: "name",
      sortable: true,
    },
    {
      name: "Date",
      selector: "date",
      sortable: true,
    },
    {
      name: "Start Time",
      selector: "startTime",
      sortable: true,
    },
    {
      name: "End Time",
      selector: "endTime",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <ActionButton
          id={row.id}
          onDelete={() => onDeleteClick(row.id)}
          disabled={row.isPublished}
        />
      ),
    },
  ];

  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg("");

      if (selectedId === null) {
        throw new Error("ID is null");
      }

      console.log(deleteDataById);

      await deleteShiftById(selectedId);

      const tempRows = [...rows];
      const idx = tempRows.findIndex((v: any) => v.id === selectedId);
      tempRows.splice(idx, 1);
      setRows(tempRows);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };

  const onPublishClick = () => {
    setShowPublishConfirm(true);
  };

  const onClosePublishDialog = () => {
    setShowPublishConfirm(false);
  };

  const publishAll = async () => {
    try {
      setPublishLoading(true);
      setErrMsg("");
      await publishAllShifts(range);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setPublishLoading(false);
      onClosePublishDialog();
    }
  };

  const isTheWeekPublished = () => {
    return rows.length > 0 && rows[0].isPublished;
  };

  const getDatePublished = () => {
    return isTheWeekPublished() ? rows[0].updatedAt : undefined;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardContent>
            {errMsg.length > 0 ? (
              <Alert severity="error">{errMsg}</Alert>
            ) : (
              <></>
            )}
            <CardAction
              numOfData={rows.length}
              isPublished={isTheWeekPublished()}
              datePublished={getDatePublished()}
              onCreate={() =>
                history.push(
                  `/shift/add?startDate=${range.startDate.toISOString()}`
                )
              }
              onPublish={onPublishClick}
              range={range}
              onNextWeek={() =>
                setRange((prev: RangeDate) => ({
                  ...prev,
                  startDate: addDays(prev.startDate, 7),
                  endDate: addDays(prev.endDate, 7),
                }))
              }
              onPrevWeek={() =>
                setRange((prev: RangeDate) => ({
                  ...prev,
                  startDate: addDays(prev.startDate, -7),
                  endDate: addDays(prev.endDate, -7),
                }))
              }
            />
            <DataTable
              noHeader
              columns={columns}
              data={rows}
              pagination
              progressPending={isLoading}
            />
          </CardContent>
        </Card>
      </Grid>
      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />
      <ConfirmDialog
        title="Publish Confirmation"
        description={`Do you want to publish this data ?`}
        onClose={onClosePublishDialog}
        open={showPublishConfirm}
        onYes={publishAll}
        loading={publishLoading}
      />
    </Grid>
  );
};

export default Shift;
