import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  value,
  placeholder,
  style,
  onChange,
  type,
  name,
  className,
  onKeyDown,
  error,
  errorMessage,
  disabled,
  min,
  maxLength,
  errorClass,
  required,
}) => (
  <>
    <input
      disabled={disabled}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      className={className}
      onKeyDown={onKeyDown}
      min={min}
      maxLength={maxLength}
      required={required}
    />
    {error ? <div className={errorClass}>{errorMessage}</div> : null}
  </>
);

Input.defaultProps = {
  value: '',
  placeholder: '',
  style: {},
  onChange: () => {},
  type: '',
  name: '',
  className: '',
  onKeyDown: () => {},
  error: false,
  errorMessage: '',
  disabled: false,
  min: 0,
  maxLength: 200,
  errorClass: 'errorInput',
  required: false,
};

Input.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  style: PropTypes.shape({}),
  onChange: PropTypes.func,
  type: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  onKeyDown: PropTypes.func,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  disabled: PropTypes.bool,
  min: PropTypes.number,
  maxLength: PropTypes.number,
  errorClass: PropTypes.string,
  required: PropTypes.bool,
};

export default Input;
