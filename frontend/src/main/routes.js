import Home from '../screens/HomeScreen';
import NationalOverview from '../screens/NationalOverview';
import ContactUs from '../screens/ContactUs';
import StateOverview from '../screens/StateOverview';
import PresidentialState from '../screens/PresidentialState';
import PresidentialNational from '../screens/PresidentialNational';
import FAQ from '../screens/FAQ';
import AboutUs from '../screens/AboutUs';
import Sponsors from '../screens/Sponsors';
import RacePage from '../screens/RacePage';
import Notifications from '../screens/Notifications';
import SignUp from '../screens/SignUp';
import FindAds from '../screens/FindAds';
import MissedAds from '../screens/MissedAds';

export default [
  {
    exact: true,
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/nationalData/overview',
    name: 'national_data_overview',
    component: NationalOverview,
    props: {
      dataFormat: 'Overview',
    },
  },
  {
    path: '/nationalData/presidential',
    name: 'national_data_presidential',
    component: PresidentialNational,
    props: {
      dataFormat: 'Presidential',
    },
  },
  {
    path: '/stateData/:state?/presidential',
    name: 'state_data_presidential',
    component: PresidentialState,
    props: {
      dataFormat: 'Presidential',
    },
  },
  {
    path: '/stateData/:state?/:overview?',
    name: 'state_data_overview_initial',
    component: StateOverview,
    props: {
      dataFormat: 'Overview',
    },
  },
  {
    path: '/stateElectionsData/:state?/:house?/:raceId?',
    name: 'state_elections_data',
    component: RacePage,
    props: {
      dataFormat: 'US House',
    },
  },
  {
    path: '/stateElectionsData/:state/usHouse/:raceId?',
    name: 'state_data_usHouse',
    component: RacePage,
    props: {
      dataFormat: 'US House',
    },
  },
  {
    path: '/stateElectionsData/:state/usSenate/:raceId?',
    name: 'state_data_usSenate',
    component: RacePage,
    props: {
      dataFormat: 'US Senate',
    },
  },
  {
    path: '/stateElectionsData/:state/governor/:raceId?',
    name: 'state_data_governor',
    component: RacePage,
    props: {
      dataFormat: 'Governor',
    },
  },
  {
    path: '/findAds',
    name: 'findAds',
    component: FindAds,
  },
  {
    path: '/findAds/:archiveId?',
    name: 'findAds',
    component: FindAds,
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactUs,
  },
  {
    path: '/signup',
    name: 'signUp',
    component: SignUp,
  },
  {
    path: '/faq',
    name: 'faq',
    component: FAQ,
  },
  {
    path: '/aboutUs',
    name: 'aboutUs',
    component: AboutUs,
  },
  {
    path: '/sponsors/:sponsorId?/:sponsorName?',
    name: 'sponsors',
    component: Sponsors,
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: Notifications,
  },
  {
    path: '/missed-ads',
    name: 'missedAds',
    component: MissedAds,
  },
];
