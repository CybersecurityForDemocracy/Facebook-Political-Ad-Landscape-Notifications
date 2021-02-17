import React from 'react';
import PropTypes from 'prop-types';
import './BaseButton.css';

export const Sizes = Object.freeze({
  SM: 'sm',
  MD: 'md',
});

export const Variants = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
});

const BaseButton = ({
  block,
  children,
  className,
  size,
  tag: TagName,
  variant,
  ...rest
}) => {
  const classes = [
    className,
    'base-button',
    `base-button--${size}`,
    `base-button--${variant}`,
    block && 'base-button--block',
  ]
    .filter((c) => c)
    .join(' ');
  return (
    <TagName className={classes} {...rest}>
      {children}
    </TagName>
  );
};

BaseButton.propTypes = {
  /** If true, displays the button as a block-level element. */
  block: PropTypes.bool,
  /** Child text or elements */
  children: PropTypes.node.isRequired,
  /** CSS classes */
  className: PropTypes.string,
  /** Button size. one of 'sm', 'md'. */
  size: PropTypes.oneOf(Object.values(Sizes)),
  /** Wrapping element - can be an HTML string or react component. */
  tag: PropTypes.node,
  /** The color theme of the button. */
  variant: PropTypes.string,
};

BaseButton.defaultProps = {
  block: false,
  className: '',
  size: Sizes.MD,
  tag: 'button',
  variant: Variants.PRIMARY,
};

export default BaseButton;
