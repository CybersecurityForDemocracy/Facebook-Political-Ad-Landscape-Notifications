import React from 'react';
import CrossIcon from '../../assets/images/cross.svg';

function ConfirmDelete(props) {
  return (
    <div className="modal">
      <h5>Delete Notification</h5>

      <div className={'w-310'}>
        <span>{`Are you sure you want to delete ${props.getTypeName(
          props.deleteModal.notification.type_id,
        )}?`}</span>
        <br />
      </div>

      <div className={'delete-notification-container w-310'}>
        <button
          className="delete-notification"
          onClick={() => props.delete(props.deleteModal.notification.id)}
        >
          Delete Notification
        </button>

        <button className={'clear-button'} onClick={props.close}>
          Cancel
        </button>
      </div>

      <button className="close-button" type="button" onClick={props.close}>
        <img src={CrossIcon} alt="Close icon" />
      </button>
    </div>
  );
}

export default ConfirmDelete;
