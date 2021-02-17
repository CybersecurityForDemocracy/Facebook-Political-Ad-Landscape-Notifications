import React, { useState } from 'react';
import '../../styles/screens/ContactUsScreen.css';
import Modal from 'react-modal';
import emailjs from 'emailjs-com';
import Input from '../../components/Input';
import Button from '../../components/Button';
import CrossIcon from '../../assets/images/cross.svg';
import EmailIcon from '../../assets/images/email.svg';

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
    background: '#312D72',
    alignContent: 'center',
    textAlign: 'center',
  },
};

const ContactUs = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
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
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
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
    <div className="contactUsMain">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        ariaHideApp={false}
        style={customStyles}
      >
        <div className="modal">
          <h2 className="modalTitle">Your message was successfully sent!</h2>
          <div className="modalText">
            <img src={EmailIcon} alt="Email" />
            <span>
              We will be in touch as soon as possible. If you do not receive a
              timely reply, please check your spam folder, as the message may be
              there.
            </span>
            <br />
            <span>Thanks!</span>
          </div>
          <button className="close-button" onClick={closeModal} type="button">
            <img src={CrossIcon} alt="Close icon" />
          </button>
          <Button
            label="Close"
            className="contactUsButton"
            onPress={closeModal}
          />
        </div>
      </Modal>
      <div className="contactUsContainer">
        <div className="contactUsLabel">Contact us</div>
        <div className="contactUsSubLabel">
          Please contact us if you have any questions.
        </div>
        <form className="contact-form" onSubmit={sendEmail}>
          <div className="contactUsRow">
            <Input
              placeholder="Enter your email"
              className="contactUsInput"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              name="user_email"
              type="email"
              maxLength={64}
              required
            />
            <Input
              placeholder="Enter your name"
              className="contactUsInput"
              onChange={(e) => setName(e.target.value)}
              value={name}
              name="user_name"
              maxLength={128}
              required
            />
          </div>
          <div className="contactUsRow">
            <textarea
              rows="4"
              cols="50"
              className="contactUsInputMessage"
              placeholder="Enter your message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={400}
              required
            />
          </div>
          <input
            type="submit"
            value="Send"
            className="contactUsButton w-full mg-top-24"
          />
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
