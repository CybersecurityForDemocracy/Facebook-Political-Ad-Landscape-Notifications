import React from 'react';
import { FaTrash } from 'react-icons/fa';

const ListItem = ({ getTypeName, notification, handleDelete, getRace }) => {
  return (
    <div className={'list-item'}>
      <div className={'min-w-200'}>
        <small>Type</small>
        <h4>{getTypeName(notification.type_id)}</h4>
      </div>

      {notification.region && (
        <div className={'min-w-100'}>
          <small>Region</small>
          <h4>{notification.region}</h4>
        </div>
      )}

      {notification.fire_frequency && (
        <div className={'min-w-100'}>
          <small>Frequency</small>
          <h4>{notification.fire_frequency}</h4>
        </div>
      )}

      {notification.count && (
        <div className={'min-w-100'}>
          <small>Count</small>
          <h4>{notification.count}</h4>
        </div>
      )}

      {notification.race && (
        <div className={'min-w-100'}>
          <small>Race</small>
          <h4>{getRace(notification)}</h4>
        </div>
      )}

      {notification.page_id && (
        <div className={'min-w-100'}>
          <small>Ad sponsor</small>
          <h4>{notification.page_name}</h4>
        </div>
      )}

      <div className={'delete-icon'}>
        <div onClick={() => handleDelete(notification)}>
          <FaTrash />
        </div>
      </div>
    </div>
  );
};

function List(props) {
  const { notifications, getTypeName, getRace } = props;

  function handleDelete(notification) {
    props.setDeleteModal({ notification: notification, open: true });
  }

  return (
    <div>
      {notifications.map((notification) => (
        <ListItem
          notification={notification}
          handleDelete={handleDelete}
          getTypeName={getTypeName}
          getRace={getRace}
        />
      ))}
    </div>
  );
}

export default List;
