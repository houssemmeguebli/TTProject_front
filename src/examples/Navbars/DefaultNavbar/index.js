import { useState, useEffect } from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// react-router components
import { Link } from "react-router-dom";

// @mui material components
import Icon from "@mui/material/Icon";
import Container from "@mui/material/Container";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";

// Argon Dashboard 2 MUI Base Styles
import breakpoints from "assets/theme/base/breakpoints";

// Material Dashboard 2 PRO React context
import { useArgonController } from "context";

function DefaultNavbar({ brand, transparent, light, action }) {
  const [controller] = useArgonController();
  const { darkMode } = controller;
  const [mobileNavbar, setMobileNavbar] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const openMobileNavbar = () => setMobileNavbar(!mobileNavbar);

  useEffect(() => {
    // A function that sets the display state for the DefaultNavbarMobile.
    function displayMobileNavbar() {
      if (window.innerWidth < breakpoints.values.lg) {
        setMobileView(true);
      } else {
        setMobileView(false);
        setMobileNavbar(false);
      }
    }

    window.addEventListener("resize", displayMobileNavbar);

    // Call the displayMobileNavbar function to set the state with the initial value.
    displayMobileNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", displayMobileNavbar);
  }, []);

  return (
    <Container>
      <ArgonBox
        pt={1}
        pb={1}
        px={{ xs: 4, sm: transparent ? 2 : 3, lg: transparent ? 0 : 2 }}
        my={2}
        mx={3}
        width="calc(100% - 48px)"
        borderRadius="lg"
        shadow={transparent ? "none" : "md"}
        color={light ? "white" : "dark"}
        position="absolute"
        left={0}
        zIndex={99}
        sx={({
               palette: { transparent: transparentColor, white, background },
               functions: { rgba },
             }) => ({
          backgroundColor: transparent
            ? transparentColor.main
            : rgba(darkMode ? background.dark : white.main, 0.8),
          backdropFilter: transparent ? "none" : `saturate(200%) blur(30px)`,
        })}
      >
        <ArgonBox display="flex" justifyContent="space-between" alignItems="center" px={2}>
          <ArgonBox component={Link} to="/" py={transparent ? 1.5 : 0.75} lineHeight={1}>
            <ArgonTypography variant="h5" fontWeight="bold" color={light ? "white" : "dark"}>
              TeleWorkPro
            </ArgonTypography>
          </ArgonBox>
          <ArgonBox display={{ xs: "none", lg: "block" }}>
            <ArgonTypography variant="subtitle1" color={light ? "white" : "dark"} mr={2}>
              Welcome to TeleWorkPro!
            </ArgonTypography>
          </ArgonBox>
          {action && typeof action === "object" &&
            (action.type === "internal" ? (
              <ArgonBox display={{ xs: "none", lg: "block" }}>
                <ArgonButton
                  component={Link}
                  to={action.route}
                  variant={action.variant ? action.variant : "contained"}
                  color={action.color ? action.color : "info"}
                  size="small"
                >
                  {action.label}
                </ArgonButton>
              </ArgonBox>
            ) : (
              <ArgonBox display={{ xs: "none", lg: "block" }}>
                <ArgonButton
                  component="a"
                  href={action.route}
                  target="_blank"
                  rel="noreferrer"
                  variant={action.variant ? action.variant : "contained"}
                  color={action.color ? action.color : "info"}
                  size="small"
                  sx={{ mt: -0.3 }}
                >
                  {action.label}
                </ArgonButton>
              </ArgonBox>
            ))}
          <ArgonBox
            display={{ xs: "inline-block", lg: "none" }}
            lineHeight={0}
            py={1.5}
            pl={1.5}
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={openMobileNavbar}
          >
            <Icon fontSize="default">{mobileNavbar ? "close" : "menu"}</Icon>
          </ArgonBox>
        </ArgonBox>
        {mobileNavbar && (
          <ArgonBox display={{ xs: "block", lg: "none" }} mt={2}>
            <ArgonTypography variant="subtitle1" color={light ? "white" : "dark"} mb={2}>
              Welcome to TeleWorkPro!
            </ArgonTypography>
            {action && typeof action === "object" &&
              (action.type === "internal" ? (
                <ArgonButton
                  component={Link}
                  to={action.route}
                  variant={action.variant ? action.variant : "contained"}
                  color={action.color ? action.color : "info"}
                  size="small"
                  fullWidth
                >
                  {action.label}
                </ArgonButton>
              ) : (
                <ArgonButton
                  component="a"
                  href={action.route}
                  target="_blank"
                  rel="noreferrer"
                  variant={action.variant ? action.variant : "contained"}
                  color={action.color ? action.color : "info"}
                  size="small"
                  fullWidth
                >
                  {action.label}
                </ArgonButton>
              ))}
          </ArgonBox>
        )}
      </ArgonBox>
    </Container>
  );
}

// Declaring default props for DefaultNavbar
DefaultNavbar.defaultProps = {
  brand: "TeleWorkPro",
  transparent: false,
  light: false,
  action: null,
};

// Typechecking props for the DefaultNavbar
DefaultNavbar.propTypes = {
  brand: PropTypes.string,
  transparent: PropTypes.bool,
  light: PropTypes.bool,
  action: PropTypes.shape({
    type: PropTypes.oneOf(["external", "internal"]).isRequired,
    route: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(["contained", "outlined", "gradient"]),
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
      "default",
      "white",
    ]),
    label: PropTypes.string.isRequired,
  }),
};

export default DefaultNavbar;
