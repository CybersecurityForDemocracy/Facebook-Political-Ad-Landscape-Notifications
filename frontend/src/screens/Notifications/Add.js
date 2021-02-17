import React, { useEffect } from 'react';
import CrossIcon from '../../assets/images/cross.svg';
import Async from 'react-select/async/dist/react-select.esm';
import { sponsorsSearch } from '../Sponsors/util';
import * as Actions from '../../modules/notifications/actions';
import { useDispatch, useSelector } from 'react-redux';

const asyncStyles = {
  container: (styles) => ({
    ...styles,
    border: 'none',
  }),
  control: (styles) => ({
    ...styles,
    border: '1px solid #F0F0F0',
    height: '44px',
    borderRadius: '6px',
  }),
};

function Add({ close, types, handleSubmit, topics }) {
  const dispatch = useDispatch();
  let formValues = useSelector(({ notifications }) => notifications.form);

  useEffect(() => {
    dispatch(Actions.getNotificationTypes());
  }, [dispatch]);

  function handleChange(event) {
    if (event.currentTarget.name === 'type_id') {
      let payload = {
        email: null,
        page_id: null,
        topic: null,
        region: null,
        count: null,
        type_id: '',
        time_window: null,
        fire_frequency: null,
        race: null,
      };
      payload.type_id = event.target.value;
      dispatch(Actions.updateForm(payload));
      return;
    }

    formValues[event.currentTarget.name] = event.currentTarget.value;
    dispatch(Actions.updateForm(formValues));
  }

  function handleAutocompleteChange(event) {
    formValues['page_id'] = event.value;
    dispatch(Actions.updateForm(formValues));
  }

  return (
    <div className="modal">
      <h5>Add new notification</h5>

      <div className={'form-container'}>
        <select
          className="add-notification-select mg-right-16 min-w-250"
          onChange={handleChange}
          value={formValues.type}
          name={'type_id'}
        >
          <option value={''} className="optionClass" disabled selected>
            Type
          </option>

          {types.map((res) => (
            <option value={res.type_id} className="optionClass">
              {res.type_name}
            </option>
          ))}
        </select>

        {types.map(
          (type) =>
            type.type_id === parseInt(formValues.type_id) &&
            type.fields.page !== undefined && (
              <Async
                isMulti={false}
                className="add-notification-select mg-right-16 min-w-250 async-search"
                noOptionsMessage={() => 'No sponsor found'}
                loadOptions={sponsorsSearch}
                styles={asyncStyles}
                onChange={handleAutocompleteChange}
                placeholder="Search by Sponsor (e.g. Joe Biden)"
              />
            ),
        )}

        {types.map(
          (type) =>
            type.type_id === parseInt(formValues.type_id) &&
            type.fields.race !== undefined && (
              <select
                className="add-notification-select mg-right-16 min-w-140 max-w-140"
                onChange={handleChange}
                value={formValues.race}
                name={'race'}
                disabled={
                  !formValues.type_id || formValues.type_id.length === 0
                }
              >
                <option value="" className="optionClass" disabled selected>
                  Race
                </option>

                {type.fields.race.map((race) => (
                  <option value={race.race_id} className="optionClass">
                    {`${race.state} (${race.race_id})`}
                  </option>
                ))}
              </select>
            ),
        )}

        {types.map(
          (type) =>
            type.type_id === parseInt(formValues.type_id) &&
            type.fields.region !== undefined && (
              <select
                className="add-notification-select mg-right-16 min-w-140 max-w-140"
                onChange={handleChange}
                value={formValues.region}
                name={'region'}
                disabled={
                  !formValues.type_id || formValues.type_id.length === 0
                }
              >
                <option value="" className="optionClass" disabled selected>
                  Region
                </option>

                {type.fields.region.map((region) => (
                  <option value={region} className="optionClass">
                    {region}
                  </option>
                ))}
              </select>
            ),
        )}

        {types.map(
          (type) =>
            type.type_id === parseInt(formValues.type_id) &&
            type.fields.topic !== undefined && (
              <select
                className="add-notification-select mg-right-16 min-w-140 max-w-140"
                onChange={handleChange}
                value={formValues.topic}
                name={'topic'}
                disabled={
                  !formValues.type_id || formValues.type_id.length === 0
                }
              >
                <option value="" className="optionClass" disabled selected>
                  Topic
                </option>

                {Object.keys(topics).map((topic, key) => (
                  <option value={topics[topic]} className="optionClass">
                    {topic}
                  </option>
                ))}
              </select>
            ),
        )}

        {types.map(
          (type) =>
            type.type_id === parseInt(formValues.type_id) &&
            type.fields['fire frequency'] !== undefined && (
              <select
                className="add-notification-select mg-right-16 min-w-140"
                onChange={handleChange}
                value={formValues.fire_frequency}
                name={'fire_frequency'}
                disabled={
                  !formValues.type_id || formValues.type_id.length === 0
                }
              >
                <option value="" className="optionClass" disabled selected>
                  Frequency
                </option>

                {type.fields['fire frequency'].map((frequency) => (
                  <option value={frequency} className="optionClass">
                    {frequency}
                  </option>
                ))}
              </select>
            ),
        )}

        {types.map(
          (type) =>
            type.type_id === parseInt(formValues.type_id) &&
            type.fields.count !== undefined && (
              <select
                className="add-notification-select mg-right-16 min-w-140"
                onChange={handleChange}
                value={formValues.count}
                name={'count'}
                disabled={
                  !formValues.type_id || formValues.type_id.length === 0
                }
              >
                <option value="" className="optionClass" disabled selected>
                  Count
                </option>

                {type.fields.count.map((count) => (
                  <option value={count} className="optionClass">
                    {count}
                  </option>
                ))}
              </select>
            ),
        )}

        <button className="add-button" onClick={handleSubmit}>
          Create
        </button>
      </div>

      <button className="close-button" type="button" onClick={close}>
        <img src={CrossIcon} alt="Close icon" />
      </button>
    </div>
  );
}

export default Add;
