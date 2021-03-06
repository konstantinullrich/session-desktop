import React from 'react';
import classNames from 'classnames';

import { Avatar } from '../Avatar';
import { Spinner } from '../Spinner';

import { LocalizerType } from '../../types/Util';
import { Contact, getName } from '../../types/Contact';

// This file starts with _ to keep it from showing up in the StyleGuide.

export function renderAvatar({
  contact,
  i18n,
  size,
  direction,
}: {
  contact: Contact;
  i18n: LocalizerType;
  size: number;
  direction?: string;
}) {
  const { avatar } = contact;

  const avatarPath = avatar && avatar.avatar && avatar.avatar.path;
  const pending = avatar && avatar.avatar && avatar.avatar.pending;
  const name = getName(contact) || '';
  const spinnerSize = size < 50 ? 'small' : 'normal';

  if (pending) {
    return (
      <div className="module-embedded-contact__spinner-container">
        <Spinner size={spinnerSize} direction={direction} />
      </div>
    );
  }

  const pubkey = contact.name?.givenName || '0';
  return (
    <Avatar avatarPath={avatarPath} name={name} size={size} pubkey={pubkey} />
  );
}

export function renderName({
  contact,
  isIncoming,
  module,
}: {
  contact: Contact;
  isIncoming: boolean;
  module: string;
}) {
  return (
    <div
      className={classNames(
        `module-${module}__contact-name`,
        isIncoming ? `module-${module}__contact-name--incoming` : null
      )}
    >
      {getName(contact)}
    </div>
  );
}

export function renderContactShorthand({
  contact,
  isIncoming,
  module,
}: {
  contact: Contact;
  isIncoming: boolean;
  module: string;
}) {
  const { number: phoneNumber, email } = contact;
  const firstNumber = phoneNumber && phoneNumber[0] && phoneNumber[0].value;
  const firstEmail = email && email[0] && email[0].value;

  return (
    <div
      className={classNames(
        `module-${module}__contact-method`,
        isIncoming ? `module-${module}__contact-method--incoming` : null
      )}
    >
      {firstNumber || firstEmail}
    </div>
  );
}
