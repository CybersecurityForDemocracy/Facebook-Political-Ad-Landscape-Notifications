import React, { useState } from 'react';
import '../../styles/screens/SignUpScreen.css';
import Modal from 'react-modal';
import emailjs from 'emailjs-com';
import colors from '../../styles/graphs';
import Input from '../../components/Input';
import Button from '../../components/Button';
import CrossIcon from '../../assets/images/cross.svg';
import EmailIcon from '../../assets/images/email.svg';
import IDDPImage from '../../assets/images/iddp_logo.png';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '45%',
    height: '45%',
    background: colors.modal,
    alignContent: 'center',
    textAlign: 'center',
  },
};

const SignUp = () => {
  const [organization, setOrganization] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userLink, setUserLink] = useState('');
  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function sendEmail(e) {
    e.preventDefault();

    emailjs
      .sendForm(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_SIGNUP_TEMPLATE_ID,
        e.target,
        process.env.REACT_APP_EMAILJS_USER_ID,
      )
      .then(
        (result) => {
          openModal();
        },
        (error) => {
          console.log(error.text);
        },
      );
  }

  return (
    <div className="signUpMain">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        ariaHideApp={false}
        style={customStyles}
      >
        <div className="modal">
          <h2 className="modalTitle">Thanks for signing up!</h2>
          <div className="modalText">
            <img src={EmailIcon} alt="Email" />
            <span>
              We approve every application by hand; you should get your account
              details via email within one business day or so.
            </span>
            <br />
            <span>Thanks!</span>
          </div>
          <button className="close-button" onClick={closeModal} type="button">
            <img src={CrossIcon} alt="Close icon" />
          </button>
          <Button label="Close" className="signUpButton" onPress={closeModal} />
        </div>
      </Modal>
      <div className="signUpContainer">
        <div className="signUpContainerInner">
          <div className="signUpSubLabel">
            Journalists and researchers with an institutional affiliation may
            sign up for a registered account to access enhanced features, like
            notifications.
          </div>
          <div className="signUpSubLabel">
            <span style={{ fontWeight: 'bold' }}>Notifications</span>: Set up
            email alerts to be notified when: there is a surge of spending on
            Facebook ads in a race you are watching; to see if a new sponsor is
            spending on Facebook ads in your state; top weekly topics, and
            more...
          </div>
          <div className="adObserverExtensionLabel">
            If you want to help provide transparency into microtargeting by installing the Ad Observer browser extension, click to <a href="https://adobserver.org">here</a> learn more and install.
          </div>
          <div className="signUpLabel">Sign up for an Ad Observatory account</div>
        </div>
        <form className="contact-form" onSubmit={sendEmail}>
          <div className="signUpRow">
            <Input
              placeholder="Your name"
              className="signUpInput"
              onChange={(e) => setName(e.target.value)}
              value={name}
              name="user_name"
              maxLength={64}
              required
            />
            <Input
              placeholder="Your work email address"
              className="signUpInput"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              name="user_email"
              maxLength={64}
              required
            />
            <Input
              placeholder="Your organizational affiliation (freelance is okay)"
              className="signUpInput"
              onChange={(e) => setOrganization(e.target.value)}
              value={organization}
              name="user_organization"
              maxLength={128}
              required
            />
            <Input
              placeholder="Enter link to published work (required only if freelance)"
              className="signUpInput"
              onChange={(e) => setUserLink(e.target.value)}
              value={userLink}
              name="user_link"
              maxLength={128}
            />
          </div>
          <input
            type="submit"
            value="Send"
            className="signUpButton w-full mg-top-24"
          />
        </form>
        <div className="signUpBottomLabel">
          Questions? <a href="/contact">Contact us.</a>
          <div>
            <p style={{ textAlign: 'center' }}>
              Notifications are made possible with support from the{' '}
              <a href="https://iddp.gwu.edu/">
                Institute for Data, Democracy and Politics at The George
                Washington University
              </a>
              .
            </p>
            <br />
            <img
              className="IDDPLogo"
              src={IDDPImage}
              alt="Institute for Data, Democracy and Politics at The George Washington University"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
