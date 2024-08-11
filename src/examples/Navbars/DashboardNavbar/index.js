import { useEffect, useState } from "react";
import { Breadcrumbs, IconButton, Menu, Toolbar, AppBar, Icon, Box } from "@mui/material";
import ArgonBox from "../../../components/ArgonBox";
import ArgonTypography from "../../../components/ArgonTypography";
import NotificationItem from "../../Items/NotificationItem";
import { navbar, navbarContainer, navbarDesktopMenu, navbarIconButton, navbarRow } from "./styles";
import { setMiniSidenav, setOpenConfigurator, setTransparentNavbar, useArgonController } from "../../../context";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import team2 from "assets/images/team-2.jpg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";
import AuthService from "../../../_services/AuthService";

const authService = new AuthService();

function DashboardNavbar({ absolute = false, light = true, isMini = false }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator } = controller;
  const [openMenu, setOpenMenu] = useState(null); // Changed to null for better handling
  const [user, setUser] = useState(null);
  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    // Fetch user information
    const currentUser = authService.getCurrentUser();
    console.log("Current User:", currentUser);
    setUser(currentUser);

    // Setting the navbar type
    setNavbarType(fixedNavbar ? "sticky" : "static");

    // Function to set the transparent state of the navbar
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    // Add and clean up scroll event listener
    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(null); // Use null for closing the menu

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference="anchorEl"
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem
        image={<img src={team2} alt="person" />}
        title={["New message", "from Laur"]}
        date="13 minutes ago"
        onClick={handleCloseMenu}
      />
      <NotificationItem
        image={<img src={logoSpotify} alt="person" />}
        title={["New album", "by Travis Scott"]}
        date="1 day"
        onClick={handleCloseMenu}
      />
      <NotificationItem
        color="secondary"
        image={
          <Icon fontSize="small" sx={{ color: ({ palette: { white } }) => white.main }}>
            payment
          </Icon>
        }
        title={["", "Payment successfully completed"]}
        date="2 days"
        onClick={handleCloseMenu}
      />
    </Menu>
  );

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme, { navbarType })}>
        <ArgonBox
          color={light && transparentNavbar ? "white" : "dark"}
          mb={{ xs: 1, md: 0 }}
          sx={(theme) => navbarRow(theme, { isMini })}
        >
          <Breadcrumbs
            icon="home"
            title={route[route.length - 1]}
            route={route}
            light={transparentNavbar ? light : false}
          />
          <IconButton
            onClick={handleMiniSidenav}
            sx={{
              width: '100%', // Make IconButton full width
              display: 'flex',
              justifyContent: 'center',
              p: 0 // Remove default padding
            }}
            color="inherit" // Ensure it inherits the color if needed
          >
            <Icon fontSize="medium">
              {miniSidenav ? "menu_open" : "menu"}
            </Icon>
          </IconButton>


        </ArgonBox>
        {!isMini && (
          <ArgonBox sx={(theme) => navbarRow(theme, { isMini })}>

              <ArgonBox
                display="flex"
                alignItems="center"
                color={light ? "white" : "dark"}
                sx={navbarIconButton}
              >
                <Icon sx={{ fontSize: 40, color: 'inherit', mr: 1 }}>person</Icon> {/* User Icon */}
                <ArgonTypography variant="h6" color="inherit" sx={{ fontWeight: 'bold' }}>
                  {user?.firstName} {user?.lastName}
                </ArgonTypography>
                <ArgonTypography variant="body2" color="inherit" sx={{ ml: 1 }}>
                  ({user?.department})
                </ArgonTypography>
              </ArgonBox>
            <IconButton
              size="small"
              color={light && transparentNavbar ? "white" : "dark"}
              sx={navbarIconButton}
              onClick={handleConfiguratorOpen}
            >
              <Icon>settings</Icon>
            </IconButton>
          </ArgonBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
