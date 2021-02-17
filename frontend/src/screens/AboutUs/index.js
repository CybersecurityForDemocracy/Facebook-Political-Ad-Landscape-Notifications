import React from 'react';
import '../../styles/screens/AboutUsScreen.css';

import DamonImg from '../../assets/images/DamonAboutImg.png';
import LauraImg from '../../assets/images/LauraAboutImg.png';
import JeremyImg from '../../assets/images/JeremyAboutImg.png';
import NancyImg from '../../assets/images/NancyAboutImg.png';
import PaulImg from '../../assets/images/PaulDukeAboutImg.png';
import PartnersOpenSecretsImg from '../../assets/images/PartnersOpenSecretsImg.png';
import DemocracyFundImg from '../../assets/images/DemocracyFundImg.png';
import LuminateImg from '../../assets/images/LuminateImg.png';
import FirefoxImg from '../../assets/images/firefox.png';
import SocialDilemmaImg from '../../assets/images/social_dilemma.png';
import IDDPImage from '../../assets/images/iddp_logo.png';
import HearkenLogo from '../../assets/images/hearkenLogo.png';

const ImageWithText = ({ src, fullName, aboutTeamMember, largeText }) => (
  <div
    className={largeText ? 'aboutUsMemberWrapperStart' : 'aboutUsMemberWrapper'}
  >
    <img src={src} className="aboutTeamImage" alt="aboutTeam" />
    <div className="aboutTeamTextWrapper">
      <div className="aboutTeamFullName">{fullName}</div>
      <div className="aboutTeamText">{aboutTeamMember}</div>
    </div>
  </div>
);

const AboutUs = () => (
  <div className="aboutUsMain">
    <div className="aboutUsBox">
      <div className="aboutUsLabel">About Us</div>
      <p className="aboutUsText">
        The Facebook Ad Observatory is part of the{' '}
        <a href="https://onlinepoliticaltransparencyproject.org/">
          Online Political Transparency Project
        </a>
        , which operates from the NYU Tandon School of Engineering. This
        nonpartisan, independent project is focused on improving the
        transparency of online political advertising, by deploying traditional
        methods used in cybersecurity to evaluate the vulnerabilities of online
        sites. The Project builds tools to collect and archive political
        advertising data, and makes these available publicly. We encourage
        journalists and researchers to use these to fuel analysis of online
        political advertising. In addition, the project conducts its own
        research, such as this cybersecurity analysis of vulnerabilities in
        the&nbsp;
        <span
          className="aboutUsPurpleText pointer underline"
          onClick={() =>
            window.open('https://www.facebook.com/ads/library/', '_blank')
          }
        >
          Facebook Ad Library
        </span>
        .
      </p>
    </div>
    <div className="aboutUsBackImage">
      <div className="aboutUsBox">
        <div className="aboutUsAboutTeamLabel">About the team</div>
        <ImageWithText
          src={DamonImg}
          fullName="Damon McCoy"
          aboutTeamMember="Damon McCoy is an assistant professor of Computer Science and Engineering at the New York University Tandon School of Engineering. He received his Ph.D., MS, and BS in Computer Science from the University of Colorado, Boulder. McCoy is the recipient of an NSF CAREER award, former CRA/CCC Computer Innovation Fellow, IEEE Security and Privacy best practical paper award, and ACM MobiSys best paper award."
        />
        <ImageWithText
          src={LauraImg}
          fullName="Laura Edelson"
          aboutTeamMember="Laura Edelson is a PhD Candidate in Computer Science at NYU’s Tandon School of Engineering. Laura studies online political communication and develops methods to identify inauthentic content and activity. Her research has powered reporting on social media ad spending in the New York Times, the Wall Street Journal and the Atlantic. Prior to her current time in academia, Laura was a software engineer for Palantir and Factset. During her time in industry, her work focused on applied machine learning and big data."
        />
        <ImageWithText
          src={JeremyImg}
          fullName="Jeremy Merrill"
          largeText
          aboutTeamMember="Jeremy B. Merrill is data journalism lead for the Facebook Ad Observatory. He is a reporter and a coder with a special interest in how ad-tech and algorithmic infrastructure is exploited for scams, shady political tactics and corporate sleight-of-hand about who’s doing what. He is fascinated by the possibilities of using machine learning techniques to enable investigative journalism using large datasets. The subject of one such investigation, where ML tools helped journalists search a large, multilingual corpus of leaked documents by (an approximation of) their meaning, was so incredulous of the combined power of reporters and computers that she tweeted: “715 thousand documents read? Who believes that?” Jeremy has previously written for Quartz, ProPublica and The New York Times."
        />
        <ImageWithText
          src={NancyImg}
          fullName="Nancy Watzman"
          largeText
          aboutTeamMember="Nancy Watzman is director of Lynx LLC, based in Denver, Colorado. She is a strategist specializing in developing and managing collaborations and partnerships to support journalists, technologists, and researchers in countering online dis- and mis-information, conducting investigations, and increasing newsroom sustainability. She is former director of and remains an advisor to the Colorado Media Project. She has written for numerous publications, including The Washington Monthly, Harper's Magazine, and The Nation. Her current projects include the Local News Fellowship with First Draft News. She is also apprenticing with her children, who give her insight into the workings of TikTok, Instagram, various subReddits, and other sources of online information used by teens."
        />
        <ImageWithText
          src={PaulImg}
          fullName="Paul Duke"
          aboutTeamMember="Paul Duke is a software engineer. They received their Bachelor of Science in Computer Science from the University of Georgia. Paul previously worked as a Software Engineer at Google, and was fired after organizing for workers’ right to know what they are working on and how their work is being used, as well as advocating for improved working conditions for temps, vendors, and contractors."
        />
      </div>
    </div>
    <div className="aboutUsBox">
      <div className="aboutUsAboutPartnersLabel">Partners</div>
      <div className="aboutUsAboutPartnersText">
        Our partners offer other research tools and support for journalists to
        understand political advertising and campaign finance.
      </div>
      <div className="aboutUsAboutPartnersImgWrapper">
        <img
          alt="PartnersOpenSecretsImg"
          src={PartnersOpenSecretsImg}
          className="aboutUsPartnerLogo"
        />
      </div>
      <p className="aboutUsPartnerText">
        The Center for Responsive Politics, aka&nbsp;
        <span className="aboutUsPurpleText">OpenSecrets.org</span>, is a
        nonpartisan, independent and nonprofit, research group tracking money in
        US politics and its effect on elections and public policy. Its deep
        databases on political influence–which include campaign contributions,
        lobbying, foreign agent registration, revolving door and more–are useful
        for journalists and researchers who want to dive into who is working to
        sway voters and how.
      </p>
      <div className="aboutUsAboutPartnersImgWrapper">
        <img alt="IDDP logo" src={IDDPImage} className="aboutUsPartnerLogo" />
      </div>
      <p className="aboutUsPartnerText">
        IDDP’s mission is to help the public, journalists, and policymakers
        understand digital media’s influence on public dialogue and opinion, and
        to develop sound solutions to disinformation and other ills that arise
        in these spaces.
      </p>
      <div className="aboutUsAboutPartnersImgWrapper">
        <img
          alt="Hearken logo"
          src={HearkenLogo}
          className="aboutUsPartnerLogo"
        />
      </div>
      <p className="aboutUsPartnerText">
        <a href="https://wearehearken.com/" className="aboutUsPurpleText">
          Hearken
        </a>{' '}
        helps organizations embed listening into their growth and operations to
        build more resilient companies and communities through consultation and
        technology solutions.
      </p>
      <div className="aboutUsAboutFundersLabel">Funders</div>
      <div className="aboutUsDemocracyWrapper">
        <img
          src={DemocracyFundImg}
          alt="DemocracyFundImg"
          className="aboutUsSideLogo"
        />
        <p className="aboutUsPartnerText">
          <span className="aboutUsPurpleText">Democracy Fund</span>
          &nbsp;is an independent and nonpartisan, private foundation that
          confronts deep-rooted challenges in American democracy while defending
          against new threats. Its Digital Democracy program supports work to
          strengthen online platform accountability.
        </p>
      </div>
      <div className="aboutUsDivider" />
      <div className="aboutUsDemocracyWrapper">
        <img src={LuminateImg} alt="LuminateImg" className="aboutUsSideLogo" />
        <p className="aboutUsPartnerText">
          <span className="aboutUsPurpleText">Luminate</span>
          &nbsp;is a global philanthropic organisation with the goal of
          empowering people and institutions to work together to build just and
          fair societies.
        </p>
      </div>

      <div className="aboutUsAboutFundersLabel">Thank you</div>
      <div className="aboutUsAboutPartnersText">
        Thank you to these organizations for helping us promote the Ad Observer
        tool.
      </div>
      <div className="aboutUsDemocracyWrapper">
        <img
          alt="SocialDilemmaImg"
          src={SocialDilemmaImg}
          className="aboutUsSideLogo"
        />
        <p className="aboutUsPartnerText">
          <span className="aboutUsPurpleText">The Social Dilemma</span> is a
          documentary that "reveals how social media is reprogramming
          civilization with tech experts sounding the alarm on their own
          creations." It is now{' '}
          <a href="https://www.netflix.com/title/81254224">
            streaming on Netflix
          </a>
          .
        </p>
      </div>

      <div className="aboutUsDivider" />

      <div className="aboutUsDemocracyWrapper">
        <img src={FirefoxImg} alt="FirefoxImg" className="aboutUsSideLogo" />
        <p className="aboutUsFirefoxText">
          <span className="aboutUsPurpleText">Mozilla</span>
          &nbsp; is the maker of the Firefox web browser.
        </p>
      </div>
    </div>
  </div>
);

export default AboutUs;
