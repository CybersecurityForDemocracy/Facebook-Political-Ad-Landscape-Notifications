import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import '../../styles/components/Footer.css';
import FooterListItem from './FooterListItem';
import NYUTandonLogo from '../../assets/images/tandon_long_white.png';

const Footer = ({ history: { push }, location: { pathname } }) => (
  <div className="footerWrapper">
    <div className="dividerFirst" />
    <ul className="ulFooter">
      <FooterListItem
        to="/aboutUs"
        label="About Us"
        className={
          pathname !== '/aboutUs' ? 'footerListItem' : 'footerListItemDisabled'
        }
      />
      <FooterListItem
        to="https://medium.com/online-political-transparency-project"
        label="Blog"
        className="footerListItem"
      />
      <FooterListItem
        to="/faq"
        label="FAQ"
        className={
          pathname !== '/faq' ? 'footerListItem' : 'footerListItemDisabled'
        }
      />
      <FooterListItem
        to="/contact"
        label="Contact"
        className={
          pathname !== '/contact' ? 'footerListItem' : 'footerListItemDisabled'
        }
      />
    </ul>
    <div className="footerLogo">
      <img
        alt="NYU"
        style={{ height: '100%', width: '90%', display: 'center' }}
        src={NYUTandonLogo}
      />
    </div>
    <div className="divider" />
    <div className="copyright">
      © 2020 New York University.&nbsp;
      <span className="copyrightPurpleText">CC-BY 4.0</span>
    </div>
  </div>
);

Footer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(Footer);
