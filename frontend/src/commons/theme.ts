import { createTheme } from "@material-ui/core/styles";
import { STAFFANY_NAVY, STAFFANY_RED, STAFFANY_TURQOISE } from "./colors";

export const staffanyTheme = createTheme({
  palette: {
    primary: {
      main: STAFFANY_NAVY,
    },
    secondary: {
      main: STAFFANY_RED,
      contrastText: "white",
    },
    error: {
      main: STAFFANY_RED,
    },
    success: {
      main: STAFFANY_TURQOISE,
    },
  },
  color: {
    navy: STAFFANY_NAVY,
    red: STAFFANY_RED,
    turqouise: STAFFANY_TURQOISE,
  },
  overrides: {
    MuiButton: {
      outlined: {
        color: STAFFANY_TURQOISE,
        borderColor: STAFFANY_TURQOISE,
      },
      contained: {
        color: "white",
        backgroundColor: STAFFANY_TURQOISE,
      },
    },
    MuiTypography: {
      colorPrimary: {
        color: STAFFANY_TURQOISE,
      },
    },
  },
});
