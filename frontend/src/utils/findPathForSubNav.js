import pathsForSubNav from '../constants/pathsForSubNav';

export const getPathsForSubNav = (pathname, otherRoutes) => {
  const allRoutes = {
    ...pathsForSubNav,
    stateData: [
      ...pathsForSubNav.stateData,
      // ...otherRoutes
    ],
  };
  const pathnamesArray = pathname.split('/');
  const baseRoute = pathnamesArray[1];
  const subRoutes = allRoutes[baseRoute];
  if (subRoutes && subRoutes.length) {
    return subRoutes;
  }
  return [];
};

export default getPathsForSubNav;
