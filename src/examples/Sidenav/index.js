import { useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import SidenavItem from "examples/Sidenav/SidenavItem";
import SidenavFooter from "examples/Sidenav/SidenavFooter";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import { useArgonController, setMiniSidenav } from "context";
import { useContext } from "react";
import { AuthContext } from "../../_services/AuthContext.js"; // Import useContext from React

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, darkSidenav, layout } = controller;
  const location = useLocation();
  const { pathname } = location;
  const itemName = pathname.split("/").slice(1)[0];
  const { user } = useContext(AuthContext); // Use the AuthContext
  const userRole = user ? user.role : null; // Extract user role

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
    }

    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();

    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // Filter routes based on user role
  const filteredRoutes = routes.filter((route) => {
    if (route.roles && route.roles.length > 0) {
      return route.roles.includes(userRole);
    }
    return true;
  });

  const renderRoutes = filteredRoutes.map(({ type, name, icon, title, key, href, route }) => {
    let returnValue;

    if (type === "route") {
      if (href) {
        returnValue = (
          <Link href={href} key={key} target="_blank" rel="noreferrer">
            <SidenavItem name={name} icon={icon} active={key === itemName} />
          </Link>
        );
      } else {
        returnValue = (
          <NavLink to={route} key={key}>
            <SidenavItem name={name} icon={icon} active={key === itemName} />
          </NavLink>
        );
      }
    } else if (type === "title") {
      returnValue = (
        <ArgonTypography
          key={key}
          color={darkSidenav ? "white" : "dark"}
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          opacity={0.6}
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </ArgonTypography>
      );
    } else if (type === "divider") {
      returnValue = <Divider key={key} light={darkSidenav} />;
    }

    return returnValue;
  });

  return (
    <SidenavRoot {...rest} variant="permanent" ownerState={{ darkSidenav, miniSidenav, layout }}>
      <ArgonBox pt={3} pb={1} px={4} textAlign="center">
        <ArgonBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <ArgonTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </ArgonTypography>
        </ArgonBox>
        <ArgonBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && (
            <ArgonBox component="img" src={brand} alt="Argon Logo" width="2rem" mr={0.25} />
          )}
          <ArgonBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <ArgonTypography
              component="h6"
              variant="button"
              fontWeight="medium"
              color={darkSidenav ? "white" : "dark"}
            >
              {brandName}
            </ArgonTypography>
          </ArgonBox>
        </ArgonBox>
      </ArgonBox>
      <Divider light={darkSidenav} />
      <List>{renderRoutes}</List>

      <ArgonBox pt={1} mt="auto" mb={2} mx={2}>
        <SidenavFooter />
      </ArgonBox>
    </SidenavRoot>
  );
}

Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
