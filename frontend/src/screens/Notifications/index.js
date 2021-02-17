import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from 'react-modal';
import List from './List';
import Add from './Add';
import * as Actions from '../../modules/notifications/actions';
import ConfirmDelete from './ConfirmDelete';
import Loader from '../../components/Loader';
import IDDPImage from '../../assets/images/iddp_logo.png';

const customStyles = {
  content: {
    top: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    overflow: 'unset',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '60% !important',
    height: '45%',
    backgroundColor: '#FFFFFF',
    alignContent: 'center',
    textAlign: 'center',
  },
};

function Notifications(props) {
  const dispatch = useDispatch();
  const {
    form,
    notifications,
    notificationTypes,
    loading,
    topics,
    userInfo,
  } = useSelector(({ notifications }) => notifications);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    notification: {},
    open: false,
  });

  useEffect(() => {
    dispatch(Actions.getAccessToken('notifications'));
  }, [dispatch]);

  useEffect(() => {
    if (Object.keys(userInfo).length > 0 && userInfo.is_authenticated) {
      dispatch(Actions.reset());
      dispatch(Actions.setLoading(true));
      dispatch(Actions.fetch(userInfo.email, userInfo.access_token));
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    dispatch(Actions.getNotificationTypes());
  }, [dispatch]);

  function handleAddClick() {
    setAddModal(true);
  }

  async function closeAddModal() {
    await dispatch(Actions.resetForm());
    setAddModal(false);
  }

  function closeDeleteModal() {
    setDeleteModal({ notification: {}, open: false });
  }

  function getTypeName(typeId) {
    let typeName = 'N/A';
    const type = notificationTypes.find((type) => type.type_id === typeId);

    if (type) {
      typeName = type.type_name;
    }

    return typeName;
  }

  async function handleSubmit() {
    const payload = { ...form };
    payload.email = userInfo.email;
    payload.access_token = userInfo.access_token;
    await dispatch(Actions.create(payload, userInfo));

    closeAddModal();
  }

  async function deleteNotification(id) {
    await dispatch(Actions.remove(id, userInfo));
    closeDeleteModal();
  }

  function getRace(notification) {
    const { type_id } = notification;
    const data = notificationTypes.find(
      (type) => parseInt(type.type_id) === parseInt(type_id),
    );

    if (data) {
      const races = data.fields.race;
      const race = races.find((race) => race.race_id === notification.race);
      return `${race.state} (${race.race_id})`;
    }

    return notification.race;
  }

  return (
    <main
      className="senate__graph_views sponsors_view"
      style={{ overflow: 'visible' }}
    >
      <div className="notifications-header mg-bottom-16">
        <h3 className="page_header">Notifications</h3>
        <img
          className="IDDPLogo"
          src={IDDPImage}
          alt="Institute for Data, Democracy and Politics at The George Washington University"
        />
      </div>
      <div>
        <p>
          Get notified when new spenders pop up in your state or when spending
          surges 30% week-over-week in races you care about. Notifications are
          provided in partnership with the{' '}
          <a href="https://iddp.gwu.edu/">
            Institute for Data, Democracy and Politics at The George Washington
            University
          </a>
          .
        </p>
      </div>
      <button className="add-button" onClick={handleAddClick}>
        Add New
      </button>
      {loading ? (
        <Loader />
      ) : (
        <List
          setDeleteModal={setDeleteModal}
          getTypeName={getTypeName}
          notifications={notifications}
          getRace={getRace}
        />
      )}

      <Modal
        isOpen={addModal}
        onRequestClose={closeAddModal}
        ariaHideApp={false}
        style={customStyles}
        id="notification"
      >
        {addModal && (
          <Add
            close={closeAddModal}
            types={notificationTypes}
            topics={topics}
            handleSubmit={handleSubmit}
          />
        )}
      </Modal>

      <Modal
        isOpen={deleteModal.open}
        onRequestClose={closeDeleteModal}
        ariaHideApp={false}
        style={customStyles}
        id="delete-notification"
      >
        <ConfirmDelete
          close={closeDeleteModal}
          deleteModal={deleteModal}
          getTypeName={getTypeName}
          delete={deleteNotification}
        />
      </Modal>
    </main>
  );
}

export default Notifications;
