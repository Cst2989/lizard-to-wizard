import React from 'react';
import PropTypes from 'prop-types';
import './wrong-button.css';

/**
 * Primary UI component for user interaction
 */
export const Button = ({ type, size, label, icon, iconPosition, disabled, ...props }) => {
  const hasIcon = icon ? 'storybook-button--icon' : '';
  const isDisabled = disabled ? 'storybook-button--disabled' : '';
  return (
    <button
      type="button"
      className={['storybook-button', `storybook-button--${size}`, `storybook-button--${type}`, hasIcon, isDisabled, `storybook-button--${iconPosition}`].join(' ')}
      {...props}
      disabled={disabled}
    >
      {icon && <i className={icon}></i>}
      {label}
      {icon && <i className={icon}></i>}
    </button>
  );
};

Button.propTypes = {
  /**
   * Is this the principal call to action on the page?
   */
  type: PropTypes.oneOf(['Primary', 'Secondary', 'Ghost', 'Tertiary', 'Danger']),
  /**
   * How large should the button be?
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /**
   * Button contents
   */
  label: PropTypes.string.isRequired,
  /**
   * Optional click handler
   */
  onClick: PropTypes.func,
  /**
  * Optional icon
  */
  icon: PropTypes.string,

  /**
  * Optional icon position
  */
  iconPosition: PropTypes.oneOf(['left', 'right',]),
  /**
 * Optional disabled
 */
  disabled: PropTypes.bool
};

Button.defaultProps = {
  type: 'Primary',
  size: 'large',
  onClick: undefined,
  label: 'Button',
  icon: 'bi bi-plus-lg',
  iconPosition: 'left',
  disabled: false
};
