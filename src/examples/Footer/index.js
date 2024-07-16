import PropTypes from "prop-types";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import typography from "assets/theme/base/typography";

function Footer({ company, links, additionalLinks }) {
  const { href, name } = company;
  const { size } = typography;

  const renderLinks = (linkArray) =>
    linkArray.map((link) => (
      <ArgonBox key={link.name} component="li" px={2} lineHeight={1}>
        <Link href={link.href} target="_blank" underline="hover">
          <ArgonTypography variant="button" fontWeight="regular" color="text">
            {link.name}
          </ArgonTypography>
        </Link>
      </ArgonBox>
    ));

  return (
    <ArgonBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems="center"
      px={3}
      py={2}
      bgcolor="background.paper"
      boxShadow={2}
      borderRadius={2}
      sx={{ marginTop: 4 }}
    >
      <ArgonBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        color="text"
        fontSize={size.sm}
        px={1.5}
      >
        &copy; {new Date().getFullYear()}
        <ArgonBox fontSize={size.md} color="text" mb={-0.5} mx={0.25}>
          <Icon color="inherit" fontSize="inherit">
          </Icon>
        </ArgonBox>

      </ArgonBox>
      <ArgonBox
        component="ul"
        sx={({ breakpoints }) => ({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          listStyle: "none",
          mt: 3,
          mb: 0,
          p: 0,
          [breakpoints.up("lg")]: {
            mt: 0,
          },
        })}
      >
        {renderLinks(links)}
      </ArgonBox>
      {additionalLinks && additionalLinks.length > 0 && (
        <ArgonBox
          component="ul"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            listStyle: "none",
            mt: 3,
            mb: 0,
            p: 0,
          }}
        >
        </ArgonBox>
      )}
    </ArgonBox>
  );
}

Footer.defaultProps = {
  company: { href: "https://www.example.com/", name: "Remote Work Co." },
  links: [
    { href: "https://www.example.com/about", name: "About Us" },
    { href: "https://www.example.com/blog", name: "Blog" },
    { href: "https://www.example.com/contact", name: "Contact" },
  ],

};

Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
  additionalLinks: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
