import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../styles/components/Navigation.css';
import { useSelector } from 'react-redux';
import NYU from '../../assets/images/NYU_full.png';
import NavListItem from './NavListItem';

const NavigtaionMenu = ({ navMobile, setNavMobile }) => {
  const { userInfo } = useSelector(({ notifications }) => notifications);
  const isLoggedIn =
    userInfo.is_authenticated && !!Object.keys(userInfo).length;

  const navItems = [
    {
      label: 'National',
      route: '/nationalData/overview',
    },
    {
      label: 'States',
      route: '/stateData/GA/overview',
    },
    {
      label: 'Races',
      route: '/stateElectionsData/GA/usSenate/GAS1',
    },
    {
      label: 'Sponsors',
      route: '/sponsors',
    },
    {
      label: 'Find Ads',
      route: '/findAds',
    },
    {
      label: 'Missed Ads',
      route: '/missed-ads',
    },
  ];

  if (isLoggedIn) {
    navItems.push({ label: 'Notifications', route: '/notifications' });
  }

  const authNavItems = isLoggedIn
    ? [
        {
          label: 'Log out',
          route: '/users/aws-logout/',
          tag: 'a',
        },
      ]
    : [
        {
          label: 'Login',
          route: '/accounts/amazon-cognito/login/',
          tag: 'a',
        },
        {
          label: 'Sign up',
          route: '/signup',
        },
      ];

  const showMobileNav = () => setNavMobile(true);
  const hideMobileNav = () => setNavMobile(false);

  return (
    <nav className="navigation">
      <div className="navigation__inner">
        <div className="navigation__logo">
          <img alt="NYU" className="navigation__logo-flag" src={NYU} />
          <Link to="/" className="navigation__logo-title">
            Ad Observatory
          </Link>
          <div className="navigation__logo-subtitle">
            By the NYU{' '}
            <a href="http://onlinepoliticaltransparencyproject.org/">
              Online Political Transparency Project
            </a>
          </div>
        </div>
        <button
          type="button"
          className="navigation__menu-toggle"
          title="Menu"
          onClick={showMobileNav}
        >
          <span className="sr-only">Menu</span>
        </button>
        {navMobile ? (
          <div className="navigation__mobile">
            <button
              type="button"
              className="navigation__menu-close"
              title="Close"
              onClick={hideMobileNav}
            >
              <span className="sr-only">Close</span>
            </button>
            <ul className="navigation__mobile-links">
              {[...navItems, ...authNavItems].map((item) => (
                <NavListItem
                  {...item}
                  isMobile
                  key={item.label}
                  onClick={hideMobileNav}
                />
              ))}
            </ul>
          </div>
        ) : (
          <div className="navigation__desktop">
            <ul className="navigation__desktop-links">
              {navItems.map((item) => (
                <NavListItem {...item} key={item.label} />
              ))}
            </ul>
            <ul className="navigation__desktop-links navigation__desktop-auth-links">
              {authNavItems.map((item) => (
                <NavListItem {...item} key={item.label} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

NavigtaionMenu.propTypes = {
  navMobile: PropTypes.bool.isRequired,
  setNavMobile: PropTypes.func.isRequired,
};

export default NavigtaionMenu;
